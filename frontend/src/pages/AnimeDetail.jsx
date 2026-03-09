import { Heart, Sparkles } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import AnimeCard from "../components/AnimeCard.jsx";
import CommentList from "../components/CommentList.jsx";
import EpisodeList from "../components/EpisodeList.jsx";
import PageLoader from "../components/PageLoader.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { getAnimeById, getAnimeList } from "../services/animeService.js";
import { createComment, deleteComment, getCommentsByAnimeId, reactToComment } from "../services/commentService.js";
import { getGuestAnimeProgress, saveGuestWatchProgress, saveWatchProgress } from "../services/watchHistoryService.js";
import { formatDuration } from "../utils/formatters.js";

const AnimeDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user, isAuthenticated, isFavorite, toggleFavorite } = useContext(AuthContext);
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [comments, setComments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [resumeTime, setResumeTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadAnime = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const animeData = await getAnimeById(id);
        setAnime(animeData.anime);
        setEpisodes(animeData.episodes || []);

        const guestProgress = !isAuthenticated ? getGuestAnimeProgress(id) : null;
        const resumeEpisodeId = animeData.continueWatching?.episodeId?._id || guestProgress?.episodeId;
        const selected = (animeData.episodes || []).find((episode) => episode._id === resumeEpisodeId) || animeData.episodes?.[0] || null;
        setCurrentEpisode(selected);
        setResumeTime(animeData.continueWatching?.lastWatchedTimestamp || guestProgress?.lastWatchedTimestamp || 0);

        const primaryGenre = animeData.anime?.genres?.[0] || "";
        const [commentsResult, recommendationsResult] = await Promise.allSettled([
          getCommentsByAnimeId(id),
          getAnimeList({ limit: 8, ...(primaryGenre ? { genre: primaryGenre } : { sort: "rating" }) })
        ]);

        setComments(commentsResult.status === "fulfilled" ? commentsResult.value || [] : []);
        setRecommendations(
          recommendationsResult.status === "fulfilled"
            ? ((recommendationsResult.value.items || []).filter((item) => item._id !== animeData.anime._id)).slice(0, 4)
            : []
        );
      } catch (error) {
        setAnime(null);
        setEpisodes([]);
        setComments([]);
        setRecommendations([]);
        setCurrentEpisode(null);
        setResumeTime(0);
        setLoadError(error.response?.data?.message || "Anime detail could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadAnime();
  }, [id, isAuthenticated]);

  const handleCreateComment = async (content) => {
    const comment = await createComment({ animeId: id, content });
    setComments((current) => [comment, ...current]);
  };

  const handleReact = async (commentId, type) => {
    const updated = await reactToComment(commentId, type);
    setComments((current) => current.map((comment) => (comment._id === commentId ? updated : comment)));
  };

  const handleDelete = async (commentId) => {
    await deleteComment(commentId);
    setComments((current) => current.filter((comment) => comment._id !== commentId));
  };

  const handleProgressSave = async ({ animeId, episodeId, lastWatchedTimestamp, episodeNumber, title }) => {
    if (isAuthenticated) {
      await saveWatchProgress({ animeId, episodeId, lastWatchedTimestamp });
      return;
    }

    saveGuestWatchProgress({
      animeId,
      episodeId,
      lastWatchedTimestamp,
      episodeNumber,
      title: anime?.title,
      posterURL: anime?.posterURL,
      updatedAt: new Date().toISOString()
    });
  };

  const metadata = useMemo(
    () => [
      { label: t("anime.releaseYear"), value: anime?.releaseYear },
      { label: t("anime.rating"), value: anime?.rating?.toFixed?.(1) || anime?.rating },
      { label: t("anime.episodes"), value: episodes.length },
      { label: t("filters.duration"), value: anime?.averageDuration ? formatDuration(anime.averageDuration) : "-" }
    ],
    [anime?.averageDuration, anime?.rating, anime?.releaseYear, episodes.length, t]
  );

  if (isLoading) {
    return <PageLoader />;
  }

  if (!anime) {
    return (
      <div className="container-shell">
        <section className="panel rounded-[32px] p-8 text-center">
          <h1 className="font-[Space_Grotesk] text-3xl font-bold text-white">Anime topilmadi</h1>
          <p className="mt-3 text-slate-400">{loadError || "Bu sahifa uchun ma'lumotni yuklab bo'lmadi."}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="container-shell space-y-8">
      <section className="overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/40">
        <div className="relative min-h-[380px] overflow-hidden">
          <img
            src={anime.bannerURL}
            alt={`${anime.title} banner`}
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          <div className="relative grid gap-8 p-6 md:p-10 lg:grid-cols-[minmax(220px,280px)_1fr] lg:items-end">
            <img
              src={anime.posterURL}
              alt={`${anime.title} poster`}
              loading="eager"
              decoding="async"
              className="aspect-[3/4] w-full max-w-[280px] rounded-[30px] object-cover shadow-2xl"
            />
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {(anime.genres || []).map((genre) => (
                  <span key={genre} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-200">
                    {genre}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-[Space_Grotesk] text-4xl font-bold text-white md:text-5xl">{anime.title}</h1>
                <button
                  type="button"
                  onClick={isAuthenticated ? () => toggleFavorite(anime._id) : undefined}
                  disabled={!isAuthenticated}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none ${
                    isFavorite(anime._id)
                      ? "border-pink-400/40 bg-pink-500/15 text-pink-200"
                      : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  } ${!isAuthenticated ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <Heart size={16} fill={isFavorite(anime._id) ? "currentColor" : "none"} />
                  {t("profile.favoriteAction")}
                </button>
              </div>
              <p className="max-w-3xl text-base leading-8 text-slate-300 md:text-lg">{anime.description}</p>
              <div className="grid gap-4 md:grid-cols-4">
                {metadata.map((item) => (
                  <div key={item.label} className="panel rounded-[24px] p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{item.label}</p>
                    <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
              {currentEpisode && resumeTime > 0 ? (
                <p className="text-sm text-orange-200">{t("anime.continue", { time: formatDuration(resumeTime) })}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <VideoPlayer
        animeId={anime._id}
        currentEpisode={currentEpisode}
        episodes={episodes}
        resumeTime={resumeTime}
        onEpisodeChange={(episode) => {
          setCurrentEpisode(episode);
          setResumeTime(0);
        }}
        onProgressSave={handleProgressSave}
      />

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <EpisodeList
          episodes={episodes}
          currentEpisodeId={currentEpisode?._id}
          onSelect={(episode) => {
            setCurrentEpisode(episode);
            setResumeTime(0);
          }}
        />
        <CommentList
          comments={comments}
          currentUser={user}
          onCreate={handleCreateComment}
          onDelete={handleDelete}
          onReact={handleReact}
        />
      </div>

      {recommendations.length ? (
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <Sparkles className="text-cyan-300" />
            <h2 className="font-[Space_Grotesk] text-2xl font-bold text-white">{t("anime.recommendations")}</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {recommendations.slice(0, 4).map((item) => (
              <AnimeCard key={item._id} anime={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default AnimeDetail;
