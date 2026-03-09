import { PlayCircle, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const AnimeCard = ({ anime }) => {
  const { t } = useTranslation();

  return (
    <Link
      to={`/anime/${anime._id}`}
      className="group panel-strong stagger-up overflow-hidden rounded-[30px] border border-white/8 transition duration-300 will-change-transform hover:-translate-y-1 hover:border-orange-400/50 focus-visible:outline-none"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={anime.posterURL}
          alt={anime.title || "Anime poster"}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 will-change-transform group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {anime.releaseYear}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1 text-xs font-bold leading-none text-slate-950 shadow-lg shadow-amber-400/20">
            <Star size={14} fill="currentColor" className="shrink-0" />
            <span>{anime.rating?.toFixed?.(1) || anime.rating}</span>
          </span>
        </div>
        <div className="absolute inset-x-4 bottom-4 opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg">
            <PlayCircle size={16} />
            {t("anime.playNow")}
          </span>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="line-clamp-1 font-[Space_Grotesk] text-xl font-bold text-white">{anime.title}</h3>
          <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-slate-400">{anime.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {anime.genres?.slice(0, 3).map((genre) => (
            <span key={genre} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              {genre}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;
