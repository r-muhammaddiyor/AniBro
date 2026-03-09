import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminStatsGrid, AnimeForm, CommentModerationPanel, EpisodeForm, UserTable } from "../components/AdminPanelComponents.jsx";
import PageLoader from "../components/PageLoader.jsx";
import { deleteCommentAsAdmin, getAdminStats, getAdminUsers, toggleUserBan } from "../services/adminService.js";
import { createAnime, deleteAnime, getAnimeList, updateAnime } from "../services/animeService.js";
import { getCommentsByAnimeId } from "../services/commentService.js";
import { createEpisode, deleteEpisode, getEpisodesByAnimeId, updateEpisode } from "../services/episodeService.js";

const initialAnimeForm = {
  title: "",
  description: "",
  posterURL: "",
  bannerURL: "",
  genres: "",
  releaseYear: "2025",
  rating: "8.5"
};

const initialEpisodeForm = {
  animeId: "",
  episodeNumber: "1",
  title: "",
  videoURL: "",
  duration: "1440",
  introEndTime: "0",
  thumbnailURL: ""
};

const actionButtonClass = "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10";
const dangerButtonClass = "rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [animeItems, setAnimeItems] = useState([]);
  const [animeEpisodes, setAnimeEpisodes] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedAnimeId, setSelectedAnimeId] = useState("");
  const [animeForm, setAnimeForm] = useState(initialAnimeForm);
  const [episodeForm, setEpisodeForm] = useState(initialEpisodeForm);
  const [editingAnimeId, setEditingAnimeId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [statsData, usersData, animeData] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAnimeList({ page: 1, limit: 50 })
      ]);

      setStats(statsData);
      setUsers(usersData);
      setAnimeItems(animeData.items);

      const firstAnimeId = selectedAnimeId || animeData.items[0]?._id || "";
      setSelectedAnimeId(firstAnimeId);

      if (firstAnimeId) {
        const [commentData, episodeData] = await Promise.all([
          getCommentsByAnimeId(firstAnimeId),
          getEpisodesByAnimeId(firstAnimeId)
        ]);
        setComments(commentData);
        setAnimeEpisodes(episodeData);
      } else {
        setComments([]);
        setAnimeEpisodes([]);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("errors.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    if (!selectedAnimeId) {
      setComments([]);
      setAnimeEpisodes([]);
      return;
    }

    setEpisodeForm((current) => (current._id ? current : { ...current, animeId: selectedAnimeId }));

    const loadScopedData = async () => {
      try {
        const [commentData, episodeData] = await Promise.all([
          getCommentsByAnimeId(selectedAnimeId),
          getEpisodesByAnimeId(selectedAnimeId)
        ]);
        setComments(commentData);
        setAnimeEpisodes(episodeData);
      } catch (_error) {
        setComments([]);
        setAnimeEpisodes([]);
      }
    };

    void loadScopedData();
  }, [selectedAnimeId]);

  const handleAnimeSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const payload = {
        ...animeForm,
        genres: animeForm.genres.split(",").map((item) => item.trim()).filter(Boolean),
        releaseYear: Number(animeForm.releaseYear),
        rating: Number(animeForm.rating)
      };

      if (editingAnimeId) {
        await updateAnime(editingAnimeId, payload);
      } else {
        await createAnime(payload);
      }

      setAnimeForm(initialAnimeForm);
      setEditingAnimeId("");
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("errors.generic"));
    }
  };

  const handleEpisodeSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const payload = {
        ...episodeForm,
        episodeNumber: Number(episodeForm.episodeNumber),
        duration: Number(episodeForm.duration),
        introEndTime: Number(episodeForm.introEndTime || 0)
      };

      if (episodeForm._id) {
        await updateEpisode(episodeForm._id, payload);
      } else {
        await createEpisode(payload);
      }

      setEpisodeForm({ ...initialEpisodeForm, animeId: selectedAnimeId || "" });
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("errors.generic"));
    }
  };

  const activeAnime = useMemo(
    () => animeItems.find((item) => item._id === selectedAnimeId),
    [animeItems, selectedAnimeId]
  );

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="container-shell space-y-8">
      <section className="rounded-[36px] border border-white/10 bg-slate-950/40 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-orange-200">Admin</p>
        <h1 className="mt-4 font-[Space_Grotesk] text-5xl font-bold text-white">{t("admin.title")}</h1>
        <p className="mt-3 max-w-3xl text-slate-400">{t("admin.subtitle")}</p>
      </section>

      {error ? <div className="panel rounded-[28px] border border-red-400/20 p-6 text-sm text-red-200">{error}</div> : null}

      <AdminStatsGrid stats={stats} />

      <div className="grid items-start gap-8 xl:grid-cols-2">
        <div className="min-w-0">
          <AnimeForm
            form={animeForm}
            isEditing={Boolean(editingAnimeId)}
            onChange={(key, value) => setAnimeForm((current) => ({ ...current, [key]: value }))}
            onSubmit={handleAnimeSubmit}
          />
        </div>
        <div className="min-w-0">
          <EpisodeForm
            form={episodeForm}
            animeOptions={animeItems}
            isEditing={Boolean(episodeForm._id)}
            onChange={(key, value) => setEpisodeForm((current) => ({ ...current, [key]: value }))}
            onSubmit={handleEpisodeSubmit}
          />
        </div>
      </div>

      <div className="panel min-w-0 rounded-[28px] p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-[Space_Grotesk] text-2xl font-bold text-white">{t("admin.animeManager")}</p>
            <p className="mt-1 text-sm text-slate-400">Choose an anime to scope comments and episode management below.</p>
          </div>
          <label className="ui-label w-full max-w-sm">
            <span className="ui-label-text">Current anime</span>
            <select
              value={selectedAnimeId}
              onChange={(event) => {
                setSelectedAnimeId(event.target.value);
                setEpisodeForm((current) => ({ ...current, animeId: event.target.value }));
              }}
              className="ui-select"
            >
              <option value="">Select anime</option>
              {animeItems.map((anime) => (
                <option key={anime._id} value={anime._id}>
                  {anime.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3">
          {animeItems.map((anime) => (
            <div key={anime._id} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-white">{anime.title}</p>
                <p className="truncate text-sm text-slate-400">{(anime.genres || []).join(", ")}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAnimeId(anime._id);
                    setAnimeForm({
                      title: anime.title,
                      description: anime.description,
                      posterURL: anime.posterURL,
                      bannerURL: anime.bannerURL,
                      genres: (anime.genres || []).join(", "),
                      releaseYear: String(anime.releaseYear),
                      rating: String(anime.rating)
                    });
                  }}
                  className={actionButtonClass}
                >
                  {t("common.edit")}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await deleteAnime(anime._id);
                      await loadDashboard();
                    } catch (requestError) {
                      setError(requestError.response?.data?.message || t("errors.generic"));
                    }
                  }}
                  className={dangerButtonClass}
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          ))}
          {!animeItems.length ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400">
              Catalog is empty right now. Create your first anime above.
            </div>
          ) : null}
        </div>
      </div>

      <div className="panel min-w-0 rounded-[28px] p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-[Space_Grotesk] text-2xl font-bold text-white">{t("admin.episodeManager")}</p>
            <p className="mt-1 text-sm text-slate-400">
              {activeAnime ? `Currently editing episodes for ${activeAnime.title}.` : "Select an anime above to manage episodes."}
            </p>
          </div>
          {activeAnime ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-300">
              {activeAnime.title}
            </span>
          ) : null}
        </div>

        <div className="grid gap-3">
          {animeEpisodes.map((episode) => (
            <div key={episode._id} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-white">
                  {episode.episodeNumber}. {episode.title}
                </p>
                <p className="truncate text-sm text-slate-400">{episode.videoURL}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEpisodeForm({
                      _id: episode._id,
                      animeId: episode.animeId,
                      episodeNumber: String(episode.episodeNumber),
                      title: episode.title,
                      videoURL: episode.videoURL,
                      duration: String(episode.duration),
                      introEndTime: String(episode.introEndTime || 0),
                      thumbnailURL: episode.thumbnailURL || ""
                    });
                  }}
                  className={actionButtonClass}
                >
                  {t("common.edit")}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await deleteEpisode(episode._id);
                      await loadDashboard();
                    } catch (requestError) {
                      setError(requestError.response?.data?.message || t("errors.generic"));
                    }
                  }}
                  className={dangerButtonClass}
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          ))}
          {!animeEpisodes.length ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400">
              No episodes yet for this anime.
            </div>
          ) : null}
        </div>
      </div>

      <UserTable
        users={users}
        onToggleBan={async (userId) => {
          try {
            const updatedUser = await toggleUserBan(userId);
            setUsers((current) => current.map((user) => (user._id === userId ? updatedUser : user)));
          } catch (requestError) {
            setError(requestError.response?.data?.message || t("errors.generic"));
          }
        }}
      />

      <CommentModerationPanel
        comments={comments}
        onDelete={async (commentId) => {
          try {
            await deleteCommentAsAdmin(commentId);
            setComments((current) => current.filter((comment) => comment._id !== commentId));
          } catch (requestError) {
            setError(requestError.response?.data?.message || t("errors.generic"));
          }
        }}
      />
    </div>
  );
};

export default AdminDashboard;
