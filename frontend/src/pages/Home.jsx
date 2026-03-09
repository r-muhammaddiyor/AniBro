import { BellRing, PlayCircle } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import AnimeCard from "../components/AnimeCard.jsx";
import PageLoader from "../components/PageLoader.jsx";
import SearchBar from "../components/SearchBar.jsx";
import useDebounce from "../hooks/useDebounce.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { getAnimeAutocomplete, getAnimeList } from "../services/animeService.js";
import { getGuestWatchHistory, getWatchHistory } from "../services/watchHistoryService.js";
import STORAGE_KEYS from "../utils/storage.js";

const Home = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [filters, setFilters] = useState({ search: "", genre: "", duration: "", sort: "new", rating: "", year: "" });
  const [animeData, setAnimeData] = useState({ items: [], pagination: { page: 1, totalPages: 1 } });
  const [watchHistory, setWatchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [releaseNotice, setReleaseNotice] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const debouncedSearch = useDebounce(filters.search, 350);

  useEffect(() => {
    const loadAnime = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getAnimeList({
          page: animeData.pagination.page,
          limit: 12,
          search: debouncedSearch,
          genre: filters.genre,
          duration: filters.duration,
          sort: filters.sort,
          rating: filters.rating,
          year: filters.year
        });
        setAnimeData(data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || t("errors.generic"));
        setAnimeData((current) => ({ ...current, items: [] }));
      } finally {
        setIsLoading(false);
      }
    };

    void loadAnime();
  }, [animeData.pagination.page, debouncedSearch, filters.duration, filters.genre, filters.rating, filters.sort, filters.year, t]);

  useEffect(() => {
    if (debouncedSearch.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const loadSuggestions = async () => {
      try {
        const items = await getAnimeAutocomplete(debouncedSearch);
        setSuggestions(items);
      } catch (_error) {
        setSuggestions([]);
      }
    };

    void loadSuggestions();
  }, [debouncedSearch]);

  useEffect(() => {
    const loadHistory = async () => {
      if (isAuthenticated && user?._id) {
        try {
          const history = await getWatchHistory(user._id);
          setWatchHistory(history.slice(0, 4));
        } catch (_error) {
          setWatchHistory([]);
        }
        return;
      }

      const guestHistory = getGuestWatchHistory();
      setWatchHistory(guestHistory.slice(0, 4));
    };

    void loadHistory();
  }, [isAuthenticated, user?._id]);

  useEffect(() => {
    const newest = animeData.items.filter((item) => item.releaseYear >= new Date().getFullYear()).slice(0, 2);
    const dismissed = localStorage.getItem(STORAGE_KEYS.releaseNotice) || "";

    if (!newest.length || newest.every((item) => dismissed.includes(item._id))) {
      setReleaseNotice([]);
      return;
    }

    setReleaseNotice(newest);
  }, [animeData.items]);

  const genres = useMemo(
    () => [...new Set(animeData.items.flatMap((item) => item.genres || []))].slice(0, 8),
    [animeData.items]
  );

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setAnimeData((current) => ({ ...current, pagination: { ...current.pagination, page: 1 } }));
    if (key === "search" && !value) {
      setSuggestions([]);
    }
  };

  return (
    <div className="space-y-12">
      <section className="container-shell hero-grid overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/40 px-5 py-10 md:px-10 md:py-16 2xl:px-14">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] xl:items-center xl:gap-12">
          <div className="space-y-6 text-center xl:text-left">
            <span className="inline-flex rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-orange-200">
              {t("hero.eyebrow")}
            </span>
            <h1 className="mx-auto max-w-3xl font-[Space_Grotesk] text-4xl font-bold leading-tight text-white md:text-6xl xl:mx-0 xl:max-w-4xl">
              {t("hero.title")}
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-8 text-slate-300 md:text-lg xl:mx-0">
              {t("hero.description")}
            </p>
            <div className="flex flex-wrap justify-center gap-4 xl:justify-start">
              <a href="#catalog" className="rounded-full bg-gradient-to-r from-orange-500 to-amber-300 px-6 py-3 font-semibold text-slate-950 transition hover:scale-[1.02] focus-visible:outline-none">
                {t("hero.ctaPrimary")}
              </a>
              <Link to="/admin" className="rounded-full border border-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/5 focus-visible:outline-none">
                {t("hero.ctaSecondary")}
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {genres.map((genre, index) => (
              <div key={genre} className="panel-strong rounded-[28px] p-5 text-center sm:text-left" style={{ animationDelay: `${index * 60}ms` }}>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t("filters.genre")}</p>
                <p className="mt-3 font-[Space_Grotesk] text-2xl font-bold text-white">{genre}</p>
              </div>
            ))}
            {!genres.length ? (
              <div className="panel-strong rounded-[28px] p-6 text-sm text-slate-400 sm:col-span-2">
                Populate the catalog to see genre highlights here.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {releaseNotice.length ? (
        <section className="container-shell">
          <div className="panel flex flex-col gap-4 rounded-[28px] border border-cyan-400/20 bg-cyan-400/8 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <BellRing className="mt-1 text-cyan-300" />
              <div>
                <p className="font-[Space_Grotesk] text-xl font-bold text-white">{t("home.releaseTitle")}</p>
                <p className="text-sm text-slate-300">{releaseNotice.map((item) => item.title).join(", ")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(STORAGE_KEYS.releaseNotice, releaseNotice.map((item) => item._id).join(","));
                setReleaseNotice([]);
              }}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5 focus-visible:outline-none"
            >
              {t("common.close")}
            </button>
          </div>
        </section>
      ) : null}

      {watchHistory.length ? (
        <section className="container-shell space-y-4">
          <div className="flex items-center gap-3">
            <PlayCircle className="text-orange-300" />
            <h2 className="font-[Space_Grotesk] text-2xl font-bold text-white">{t("home.watchContinue")}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {watchHistory.map((entry) => (
              <Link key={entry._id || `${entry.animeId}-${entry.episodeId}`} to={`/anime/${entry.animeId?._id || entry.animeId}`} className="panel rounded-[28px] p-4 transition hover:-translate-y-1 focus-visible:outline-none">
                <img
                  src={entry.animeId?.posterURL || entry.posterURL}
                  alt={entry.animeId?.title || entry.title || "Anime poster"}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[3/4] w-full rounded-[22px] object-cover"
                />
                <p className="mt-4 font-semibold text-white">{entry.animeId?.title || entry.title}</p>
                <p className="text-sm text-slate-400">Episode {entry.episodeId?.episodeNumber || entry.episodeNumber}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section id="catalog" className="container-shell space-y-6">
        <div className="space-y-2">
          <h2 className="font-[Space_Grotesk] text-3xl font-bold text-white">{t("home.sectionTitle")}</h2>
          <p className="text-slate-400">{t("home.sectionSubtitle")}</p>
        </div>
        <SearchBar
          filters={filters}
          onChange={handleFilterChange}
          suggestions={suggestions}
          onPickSuggestion={(anime) => {
            setFilters((current) => ({ ...current, search: anime.title }));
            setSuggestions([]);
          }}
        />
        {error ? <div className="panel rounded-[28px] border border-red-400/20 p-6 text-sm text-red-200">{error}</div> : null}
        {isLoading ? <PageLoader /> : null}
        {!isLoading && !error && !animeData.items.length ? (
          <div className="panel rounded-[28px] p-8 text-center text-slate-400">{t("home.empty")}</div>
        ) : null}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {animeData.items.map((anime) => (
            <AnimeCard key={anime._id} anime={anime} />
          ))}
        </div>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={animeData.pagination.page <= 1}
            onClick={() => setAnimeData((current) => ({ ...current, pagination: { ...current.pagination, page: current.pagination.page - 1 } }))}
            className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/5 focus-visible:outline-none disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-400">
            {animeData.pagination.page} / {animeData.pagination.totalPages || 1}
          </span>
          <button
            type="button"
            disabled={animeData.pagination.page >= animeData.pagination.totalPages}
            onClick={() => setAnimeData((current) => ({ ...current, pagination: { ...current.pagination, page: current.pagination.page + 1 } }))}
            className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/5 focus-visible:outline-none disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
