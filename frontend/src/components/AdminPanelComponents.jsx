import { Film, MessageSquareWarning, Radio, ShieldCheck, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

const cardClass = "panel min-w-0 overflow-hidden rounded-[30px] p-6 md:p-7";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-300 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-orange-500/20 transition hover:scale-[1.01] disabled:opacity-60";
const coolButtonClass =
  "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-sky-300 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] disabled:opacity-60";

export const AdminStatsGrid = ({ stats }) => {
  const { t } = useTranslation();

  const items = [
    { key: "users", icon: Users, value: stats?.users || 0 },
    { key: "anime", icon: Film, value: stats?.anime || 0 },
    { key: "episodes", icon: ShieldCheck, value: stats?.episodes || 0 },
    { key: "comments", icon: MessageSquareWarning, value: stats?.comments || 0 },
    { key: "activeWatchers", icon: Radio, value: stats?.activeWatchers || 0 }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article key={item.key} className={cardClass}>
            <div className="mb-4 inline-flex rounded-2xl bg-white/5 p-3 text-orange-300">
              <Icon size={20} />
            </div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t(`admin.${item.key}`)}</p>
            <p className="mt-3 font-[Space_Grotesk] text-4xl font-bold text-white">{item.value}</p>
          </article>
        );
      })}
    </div>
  );
};

const Input = ({ label, className = "", ...props }) => (
  <label className="ui-label min-w-0">
    <span className="ui-label-text">{label}</span>
    <input {...props} className={`ui-input ${className}`.trim()} />
  </label>
);

const TextArea = ({ label, className = "", ...props }) => (
  <label className="ui-label min-w-0">
    <span className="ui-label-text">{label}</span>
    <textarea {...props} className={`ui-textarea ${className}`.trim()} />
  </label>
);

const Select = ({ label, children, className = "", ...props }) => (
  <label className="ui-label min-w-0">
    <span className="ui-label-text">{label}</span>
    <select {...props} className={`ui-select ${className}`.trim()}>
      {children}
    </select>
  </label>
);

export const AnimeForm = ({ form, onChange, onSubmit, isEditing }) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className={`${cardClass} grid gap-5`}>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-orange-200">Catalog</p>
        <div className="space-y-2">
          <p className="font-[Space_Grotesk] text-2xl font-bold text-white">
            {isEditing ? t("admin.editAnime") : t("admin.newAnime")}
          </p>
          <p className="max-w-2xl text-sm leading-6 text-slate-400">
            Strong poster, banner, and clean genre metadata make the catalog feel much more polished.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Input label="Title" value={form.title} onChange={(event) => onChange("title", event.target.value)} required />
        <Input
          label="Release year"
          type="number"
          inputMode="numeric"
          value={form.releaseYear}
          onChange={(event) => onChange("releaseYear", event.target.value)}
          required
        />
      </div>

      <TextArea label="Description" value={form.description} onChange={(event) => onChange("description", event.target.value)} required />

      <div className="grid gap-5 lg:grid-cols-2">
        <Input
          label={t("admin.posterUrl")}
          value={form.posterURL}
          onChange={(event) => onChange("posterURL", event.target.value)}
          required
        />
        <Input
          label={t("admin.bannerUrl")}
          value={form.bannerURL}
          onChange={(event) => onChange("bannerURL", event.target.value)}
          required
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <Input
          label={t("admin.genresHint")}
          value={form.genres}
          onChange={(event) => onChange("genres", event.target.value)}
          placeholder="Action, Fantasy, Drama"
          required
        />
        <Input
          label="Rating"
          type="number"
          step="0.1"
          min="0"
          max="10"
          value={form.rating}
          onChange={(event) => onChange("rating", event.target.value)}
          required
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <button type="submit" className={primaryButtonClass}>
          {isEditing ? t("common.update") : t("common.create")}
        </button>
      </div>
    </form>
  );
};

export const EpisodeForm = ({ form, animeOptions, onChange, onSubmit, isEditing }) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className={`${cardClass} grid gap-5`}>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">Episodes</p>
        <div className="space-y-2">
          <p className="font-[Space_Grotesk] text-2xl font-bold text-white">
            {isEditing ? t("admin.editEpisode") : t("admin.newEpisode")}
          </p>
          <p className="max-w-2xl text-sm leading-6 text-slate-400">
            Episode inputs are stacked for clarity now, so long URLs and selectors stay inside the card.
          </p>
        </div>
      </div>

      <Select label="Anime" value={form.animeId} onChange={(event) => onChange("animeId", event.target.value)} required>
        <option value="">Select anime</option>
        {animeOptions.map((anime) => (
          <option key={anime._id} value={anime._id}>
            {anime.title}
          </option>
        ))}
      </Select>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)]">
        <Input
          label="Episode number"
          type="number"
          inputMode="numeric"
          value={form.episodeNumber}
          onChange={(event) => onChange("episodeNumber", event.target.value)}
          required
        />
        <Input label="Title" value={form.title} onChange={(event) => onChange("title", event.target.value)} required />
      </div>

      <Input label={t("admin.videoUrl")} value={form.videoURL} onChange={(event) => onChange("videoURL", event.target.value)} required />

      <div className="grid gap-5 xl:grid-cols-2">
        <Input
          label={t("admin.thumbnailUrl")}
          value={form.thumbnailURL}
          onChange={(event) => onChange("thumbnailURL", event.target.value)}
        />
        <Input
          label={t("admin.subtitleUrl")}
          value={form.subtitleURL}
          onChange={(event) => onChange("subtitleURL", event.target.value)}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Input
          label={t("admin.duration")}
          type="number"
          inputMode="numeric"
          value={form.duration}
          onChange={(event) => onChange("duration", event.target.value)}
          required
        />
        <Input
          label={t("admin.introEnd")}
          type="number"
          inputMode="numeric"
          value={form.introEndTime}
          onChange={(event) => onChange("introEndTime", event.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <button type="submit" className={coolButtonClass}>
          {isEditing ? t("common.update") : t("common.create")}
        </button>
      </div>
    </form>
  );
};

export const UserTable = ({ users, onToggleBan }) => {
  const { t } = useTranslation();

  return (
    <div className={cardClass}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-[Space_Grotesk] text-2xl font-bold text-white">{t("admin.userManager")}</p>
          <p className="mt-1 text-sm text-slate-400">Review account roles and moderate access without leaving the dashboard.</p>
        </div>
      </div>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user._id} className="flex min-w-0 flex-col gap-3 rounded-[24px] border border-white/10 bg-slate-950/45 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-white">{user.username}</p>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                  {user.role}
                </span>
              </div>
              <p className="truncate text-sm text-slate-400">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => onToggleBan(user._id)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
            >
              {user.isBanned ? t("admin.unban") : t("admin.ban")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CommentModerationPanel = ({ comments, onDelete }) => {
  const { t } = useTranslation();

  return (
    <div className={cardClass}>
      <div className="mb-5">
        <p className="font-[Space_Grotesk] text-2xl font-bold text-white">{t("admin.commentManager")}</p>
        <p className="mt-1 text-sm text-slate-400">Keep discussion clean and remove low-quality comments quickly.</p>
      </div>
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment._id} className="flex min-w-0 flex-col gap-3 rounded-[24px] border border-white/10 bg-slate-950/45 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-white">{comment.userId?.username || "User"}</p>
              <p className="line-clamp-2 break-words text-sm text-slate-400">{comment.content}</p>
            </div>
            <button
              type="button"
              onClick={() => onDelete(comment._id)}
              className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/20"
            >
              {t("common.delete")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
