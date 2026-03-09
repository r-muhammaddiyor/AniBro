import { Play, Tv2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDuration } from "../utils/formatters.js";

const EpisodeList = ({ episodes, currentEpisodeId, onSelect }) => {
  const { t } = useTranslation();

  if (!episodes.length) {
    return <div className="panel rounded-[28px] p-6 text-sm text-slate-400">{t("anime.noEpisodes")}</div>;
  }

  return (
    <div className="panel rounded-[28px] p-4">
      <div className="mb-4 flex items-center gap-3">
        <Tv2 size={18} className="text-cyan-300" />
        <h2 className="font-[Space_Grotesk] text-xl font-bold text-white">{t("anime.episodes")}</h2>
      </div>
      <div className="space-y-3">
        {episodes.map((episode) => {
          const isActive = episode._id === currentEpisodeId;

          return (
            <button
              key={episode._id}
              type="button"
              onClick={() => onSelect(episode)}
              className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? "border-orange-400 bg-orange-500/10"
                  : "border-white/10 bg-slate-950/40 hover:border-cyan-400/40 hover:bg-white/5"
              }`}
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/5 text-slate-200">
                <Play size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">
                  {episode.episodeNumber}. {episode.title}
                </p>
                <p className="text-sm text-slate-400">{formatDuration(episode.duration)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EpisodeList;
