import { MessageSquareText } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CommentItem from "./CommentItem.jsx";

const CommentList = ({ comments, currentUser, onCreate, onReact, onDelete }) => {
  const { t } = useTranslation();
  const [content, setContent] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    await onCreate(content.trim());
    setContent("");
  };

  return (
    <section className="panel rounded-[28px] p-5 md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <MessageSquareText size={20} className="text-orange-300" />
        <h2 className="font-[Space_Grotesk] text-2xl font-bold text-white">{t("comments.title")}</h2>
      </div>
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3">
          <label className="ui-label">
            <span className="ui-label-text">Comment</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={t("comments.placeholder")}
              className="ui-textarea"
            />
          </label>
          <button type="submit" className="rounded-full bg-gradient-to-r from-orange-500 to-amber-300 px-5 py-3 font-semibold text-slate-950">
            {t("comments.post")}
          </button>
        </form>
      ) : (
        <div className="mb-6 rounded-3xl border border-dashed border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400">
          {t("comments.loginPrompt")}
        </div>
      )}
      <div className="space-y-4">
        {comments.length ? (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUser={currentUser}
              onDelete={onDelete}
              onReact={onReact}
            />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/30 p-6 text-sm text-slate-400">
            {t("comments.empty")}
          </div>
        )}
      </div>
    </section>
  );
};

export default CommentList;
