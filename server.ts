import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface User {
  id: string;
  name: string;
  vote: string | null;
  isCreator: boolean;
  isSpectator: boolean;
}

interface Room {
  id: string;
  name: string;
  users: User[];
  status: "voting" | "revealing" | "revealed";
}

const rooms = new Map<string, Room>();

async function startServer() {
  const app = express();
  const PORT = 4000;
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("createRoom", (roomName: string, creatorName: string, isSpectator: boolean, callback: (roomId: string, userId: string) => void) => {
      const roomId = uuidv4();
      const userId = socket.id;

      const newRoom: Room = {
        id: roomId,
        name: roomName,
        users: [{ id: userId, name: creatorName, vote: null, isCreator: true, isSpectator }],
        status: "voting",
      };

      rooms.set(roomId, newRoom);
      socket.join(roomId);
      callback(roomId, userId);
    });

    socket.on("joinRoom", (roomId: string, userName: string, isSpectator: boolean, callback: (success: boolean, userId?: string, error?: string) => void) => {
      const room = rooms.get(roomId);
      if (!room) {
        return callback(false, undefined, "Room not found");
      }

      const userId = socket.id;
      const existingUser = room.users.find((u) => u.id === userId);

      if (!existingUser) {
        room.users.push({ id: userId, name: userName, vote: null, isCreator: false, isSpectator });
      } else {
        existingUser.name = userName;
        existingUser.isSpectator = isSpectator;
      }

      socket.join(roomId);
      io.to(roomId).emit("roomUpdated", room);
      callback(true, userId);
    });

    socket.on("getRoom", (roomId: string, callback: (room: Room | null) => void) => {
      const room = rooms.get(roomId);
      callback(room || null);
    });

    socket.on("vote", (roomId: string, vote: string | null) => {
      const room = rooms.get(roomId);
      if (room && room.status === "voting") {
        const user = room.users.find((u) => u.id === socket.id);
        if (user) {
          user.vote = vote;
          io.to(roomId).emit("roomUpdated", room);
        }
      }
    });

    socket.on("revealCards", (roomId: string) => {
      const room = rooms.get(roomId);
      if (room && room.status === "voting") {
        const user = room.users.find((u) => u.id === socket.id);
        if (user && user.isCreator) {
          room.status = "revealing";
          io.to(roomId).emit("roomUpdated", room);

          setTimeout(() => {
            if (room.status === "revealing") {
              room.status = "revealed";
              io.to(roomId).emit("roomUpdated", room);
            }
          }, 3000);
        }
      }
    });

    socket.on("resetVoting", (roomId: string) => {
      const room = rooms.get(roomId);
      if (room) {
        const user = room.users.find((u) => u.id === socket.id);
        if (user && user.isCreator) {
          room.status = "voting";
          room.users.forEach((u) => (u.vote = null));
          io.to(roomId).emit("roomUpdated", room);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      rooms.forEach((room, roomId) => {
        const userIndex = room.users.findIndex((u) => u.id === socket.id);
        if (userIndex !== -1) {
          room.users.splice(userIndex, 1);
          if (room.users.length === 0) {
            rooms.delete(roomId);
          } else {
            // If creator leaves, assign new creator
            if (!room.users.some((u) => u.isCreator)) {
              room.users[0].isCreator = true;
            }
            io.to(roomId).emit("roomUpdated", room);
          }
        }
      });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: process.cwd(),
      configFile: "vite.config.ts",
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
