import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const [isSpectator, setIsSpectator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = (e: FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !userName.trim()) return;

    setIsLoading(true);
    const roomId = crypto.randomUUID();

    localStorage.setItem(`poker_room_name_${roomId}`, roomName);
    localStorage.setItem("poker_user_name", userName);
    localStorage.setItem("poker_is_spectator", isSpectator ? "true" : "false");

    navigate(`/room/${roomId}`);
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-200">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t("create_room")}</h1>
        <p className="text-slate-500 dark:text-slate-400">{t("start_session_desc")}</p>
      </div>

      <form onSubmit={handleCreateRoom} className="space-y-6">
        <div>
          <label htmlFor="roomName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t("room_name")}
          </label>
          <input
            id="roomName"
            type="text"
            required
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder={t("placeholder_room_name")}
          />
        </div>

        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t("your_name")}
          </label>
          <input
            id="userName"
            type="text"
            required
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder={t("placeholder_user_name")}
          />
        </div>

        <div className="flex items-center">
          <input
            id="isSpectator"
            type="checkbox"
            checked={isSpectator}
            onChange={(e) => setIsSpectator(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900"
          />
          <label htmlFor="isSpectator" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
            {t("join_as_spectator")}
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !roomName.trim() || !userName.trim()}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            t("loading")
          ) : (
            <>
              <Play size={20} />
              {t("create_room")}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
