import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import CommentList from "../components/CommentList.jsx";
import EpisodeList from "../components/EpisodeList.jsx";
import PageLoader from "../components/PageLoader.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { getAnimeById } from "../services/animeService.js";
import { createComment, deleteComment, getCommentsByAnimeId, reactToComment } from "../services/commentService.js";
import { saveWatchProgress } from "../services/watchHistoryService.js";
import { formatDuration } from "../utils/formatters.js";

const AnimeDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [comments, setComments] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [resumeTime, setResumeTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnime = async () => {
      setIsLoading(true);
      try {
        const [animeData, commentData] = await Promise.all([getAnimeById(id), getCommentsByAnimeId(id)]);
        setAnime(animeData.anime);
        setEpisodes(animeData.episodes);
        setComments(commentData);

        const resumeEpisodeId = animeData.continueWatching?.episodeId?._id;
        const selected = animeData.episodes.find((episode) => episode._id === resumeEpisodeId) || animeData.episodes[0] || null;
        setCurrentEpisode(selected);
        setResumeTime(animeData.continueWatching?.lastWatchedTimestamp || 0);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAnime();
  }, [id]);

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

  const handleProgressSave = async ({ animeId, episodeId, lastWatchedTimestamp }) => {
    if (!isAuthenticated) {
      return;
    }

    await saveWatchProgress({ animeId, episodeId, lastWatchedTimestamp });
  };

  const metadata = useMemo(
    () => [
      { label: t("anime.releaseYear"), value: anime?.releaseYear },
      { label: t("anime.rating"), value: anime?.rating?.toFixed?.(1) || anime?.rating },
      { label: t("anime.episodes"), value: episodes.length }
    ],
    [anime?.rating, anime?.releaseYear, episodes.length, t]
  );

  if (isLoading) {
    return <PageLoader />;
  }

  if (!anime) {
    return null;
  }

  return (
    <div className="container-shell space-y-8">
      <section className="overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/40">
        <div className="relative min-h-[380px] overflow-hidden">
          <img src={anime.bannerURL} alt={anime.title} className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          <div className="relative grid gap-8 p-6 md:p-10 lg:grid-cols-[280px_1fr] lg:items-end">
            <img src={anime.posterURL} alt={anime.title} className="aspect-[3/4] w-full max-w-[280px] rounded-[30px] object-cover shadow-2xl" />
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((genre) => (
                  <span key={genre} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-200">
                    {genre}
                  </span>
                ))}
              </div>
              <h1 className="font-[Space_Grotesk] text-4xl font-bold text-white md:text-5xl">{anime.title}</h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-300">{anime.description}</p>
              <div className="grid gap-4 md:grid-cols-3">
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
        isAuthenticated={isAuthenticated}
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
    </div>
  );
};

export default AnimeDetail;
