import { ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const assetOrigin = apiBaseUrl.replace(/\/api\/?$/, "");

const resolveAvatarUrl = (value) => {
  if (!value) {
    return "https://placehold.co/80x80/png";
  }

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:image/")) {
    return value;
  }

  return `${assetOrigin}${value.startsWith("/") ? value : `/${value}`}`;
};

const CommentItem = ({ comment, currentUser, onReact, onDelete }) => {
  const { t } = useTranslation();
  const canDelete = currentUser && (currentUser.role === "admin" || currentUser._id === comment.userId?._id);

  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={resolveAvatarUrl(comment.userId?.avatarURL)}
            alt={comment.userId?.username || "User avatar"}
            loading="lazy"
            decoding="async"
            className="h-11 w-11 rounded-2xl object-cover"
          />
          <div>
            <p className="font-semibold text-white">{comment.userId?.username || "User"}</p>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
          </div>
        </div>
        {canDelete ? (
          <button type="button" onClick={() => onDelete(comment._id)} className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:text-red-300 focus-visible:outline-none">
            <Trash2 size={16} />
          </button>
        ) : null}
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-300">{comment.content}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => onReact(comment._id, "like")} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5 focus-visible:outline-none">
          <span className="inline-flex items-center gap-2">
            <ThumbsUp size={16} />
            {t("comments.like")} ({comment.likes})
          </span>
        </button>
        <button type="button" onClick={() => onReact(comment._id, "dislike")} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5 focus-visible:outline-none">
          <span className="inline-flex items-center gap-2">
            <ThumbsDown size={16} />
            {t("comments.dislike")} ({comment.dislikes})
          </span>
        </button>
      </div>
    </article>
  );
};

export default CommentItem;
