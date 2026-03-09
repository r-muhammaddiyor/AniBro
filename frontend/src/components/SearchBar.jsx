import { ChevronDown, Search, SlidersHorizontal, Sparkles, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GENRES } from "../utils/constants.js";

const SearchBar = ({ filters, onChange }) => {
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
      <div className="grid gap-4 lg:grid-cols-[1.8fr_repeat(3,minmax(0,1fr))]">
        <label className="ui-label">
          <span className="ui-label-text">{t("filters.titleLabel")}</span>
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-orange-300" />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => onChange("search", event.target.value)}
              placeholder={t("filters.search")}
              className="ui-input has-icon"
            />
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
