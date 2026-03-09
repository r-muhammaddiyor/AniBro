import { PlayCircle } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import AnimeCard from "../components/AnimeCard.jsx";
import PageLoader from "../components/PageLoader.jsx";
import SearchBar from "../components/SearchBar.jsx";
import useDebounce from "../hooks/useDebounce.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { getAnimeList } from "../services/animeService.js";
import { getWatchHistory } from "../services/watchHistoryService.js";

const Home = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [filters, setFilters] = useState({ search: "", genre: "", rating: "", year: "" });
  const [animeData, setAnimeData] = useState({ items: [], pagination: { page: 1, totalPages: 1 } });
  const [watchHistory, setWatchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const debouncedSearch = useDebounce(filters.search, 400);

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
  }, [animeData.pagination.page, debouncedSearch, filters.genre, filters.rating, filters.year, t]);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      setWatchHistory([]);
      return;
    }

    const loadHistory = async () => {
      try {
        const history = await getWatchHistory(user._id);
        setWatchHistory(history.slice(0, 4));
      } catch (_error) {
        setWatchHistory([]);
      }
    };

    void loadHistory();
  }, [isAuthenticated, user?._id]);

  const genres = useMemo(
    () => [...new Set(animeData.items.flatMap((item) => item.genres || []))].slice(0, 8),
    [animeData.items]
  );

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setAnimeData((current) => ({ ...current, pagination: { ...current.pagination, page: 1 } }));
  };

  return (
    <div className="space-y-12">
      <section className="container-shell hero-grid overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/40 px-6 py-12 md:px-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-orange-200">
              {t("hero.eyebrow")}
            </span>
            <h1 className="max-w-3xl font-[Space_Grotesk] text-5xl font-bold leading-tight text-white md:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">{t("hero.description")}</p>
            <div className="flex flex-wrap gap-4">
              <a href="#catalog" className="rounded-full bg-gradient-to-r from-orange-500 to-amber-300 px-6 py-3 font-semibold text-slate-950">
                {t("hero.ctaPrimary")}
              </a>
              <Link to="/admin" className="rounded-full border border-white/10 px-6 py-3 font-semibold text-white">
                {t("hero.ctaSecondary")}
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {genres.map((genre, index) => (
              <div key={genre} className="panel-strong rounded-[28px] p-5" style={{ animationDelay: `${index * 80}ms` }}>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Genre</p>
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

      {watchHistory.length ? (
        <section className="container-shell space-y-4">
          <div className="flex items-center gap-3">
            <PlayCircle className="text-orange-300" />
            <h2 className="font-[Space_Grotesk] text-2xl font-bold text-white">{t("home.watchContinue")}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {watchHistory.map((entry) => (
              <Link key={entry._id} to={`/anime/${entry.animeId?._id}`} className="panel rounded-[28px] p-4 transition hover:-translate-y-1">
                <img src={entry.animeId?.posterURL} alt={entry.animeId?.title} className="aspect-[3/4] w-full rounded-[22px] object-cover" />
                <p className="mt-4 font-semibold text-white">{entry.animeId?.title}</p>
                <p className="text-sm text-slate-400">Episode {entry.episodeId?.episodeNumber}</p>
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
        <SearchBar filters={filters} onChange={handleFilterChange} />
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
            className="rounded-full border border-white/10 px-5 py-3 text-sm text-white disabled:opacity-40"
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
            className="rounded-full border border-white/10 px-5 py-3 text-sm text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
