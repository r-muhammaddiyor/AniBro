import { ArrowDownWideNarrow, ChevronDown, Clock3, Search, SlidersHorizontal, Sparkles, Star, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GENRES } from "../utils/constants.js";

const SearchBar = ({ filters, onChange, suggestions = [], onPickSuggestion }) => {
  const { t } = useTranslation();

  return (
    <div className="panel rounded-[32px] p-5 md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="font-[Space_Grotesk] text-xl font-bold text-white">{t("filters.discoveryTitle")}</p>
          <p className="text-sm text-slate-400">{t("filters.discoverySubtitle")}</p>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.6fr_repeat(5,minmax(0,1fr))]">
        <label className="ui-label">
          <span className="ui-label-text">{t("filters.titleLabel")}</span>
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-orange-300" />
            <input
              type="search"
              autoComplete="off"
              value={filters.search}
              onChange={(event) => onChange("search", event.target.value)}
              placeholder={t("filters.search")}
              className={`ui-input has-icon ${filters.search ? "has-trailing-button" : ""}`.trim()}
            />
            {filters.search ? (
              <button
                type="button"
                onClick={() => onChange("search", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none"
                aria-label={t("filters.clearSearch")}
              >
                <X size={14} />
              </button>
            ) : null}
            {suggestions.length ? (
              <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-20 overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur">
                {suggestions.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => onPickSuggestion(item)}
                    className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5 focus-visible:outline-none last:border-b-0"
                  >
                    <img src={item.posterURL} alt={item.title} className="h-12 w-10 rounded-xl object-cover" loading="lazy" decoding="async" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-white">{item.title}</span>
                      <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">{item.releaseYear}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </label>

        <label className="ui-label">
          <span className="ui-label-text">{t("filters.genre")}</span>
          <div className="relative">
            <SlidersHorizontal size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300" />
            <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <select value={filters.genre} onChange={(event) => onChange("genre", event.target.value)} className="ui-select has-icon has-trailing-icon">
              <option value="">{t("filters.allGenres")}</option>
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="ui-label">
          <span className="ui-label-text">{t("filters.duration")}</span>
          <div className="relative">
            <Clock3 size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300" />
            <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <select value={filters.duration} onChange={(event) => onChange("duration", event.target.value)} className="ui-select has-icon has-trailing-icon">
              <option value="">{t("filters.allDurations")}</option>
              <option value="short">{t("filters.durationShort")}</option>
              <option value="medium">{t("filters.durationMedium")}</option>
              <option value="long">{t("filters.durationLong")}</option>
            </select>
          </div>
        </label>

        <label className="ui-label">
          <span className="ui-label-text">{t("filters.sort")}</span>
          <div className="relative">
            <ArrowDownWideNarrow size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300" />
            <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <select value={filters.sort} onChange={(event) => onChange("sort", event.target.value)} className="ui-select has-icon has-trailing-icon">
              <option value="new">{t("filters.sortNew")}</option>
              <option value="popular">{t("filters.sortPopular")}</option>
              <option value="trending">{t("filters.sortTrending")}</option>
              <option value="rating">{t("filters.sortRating")}</option>
              <option value="az">{t("filters.sortAz")}</option>
            </select>
          </div>
        </label>

        <label className="ui-label">
          <span className="ui-label-text">{t("filters.rating")}</span>
          <div className="relative">
            <Star size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-amber-300" />
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={filters.rating}
              onChange={(event) => onChange("rating", event.target.value)}
              className="ui-input has-icon"
              placeholder="8.5"
            />
          </div>
        </label>

        <label className="ui-label">
          <span className="ui-label-text">{t("filters.year")}</span>
          <input
            type="number"
            min="1950"
            max="2100"
            value={filters.year}
            onChange={(event) => onChange("year", event.target.value)}
            className="ui-input"
            placeholder="2025"
          />
        </label>
      </div>
    </div>
  );
};

export default SearchBar;
