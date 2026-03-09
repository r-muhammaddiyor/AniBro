import { Camera, Link2, Mail, Save, Shield, UserRound, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const ProfileModal = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", email: "", avatarURL: "", password: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      username: user.username || "",
      email: user.email || "",
      avatarURL: user.avatarURL || "",
      password: ""
    });
  }, [user]);

  const closeModal = () => {
    if (location.state?.backgroundLocation) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateProfile({
        username: form.username,
        email: form.email,
        avatarURL: form.avatarURL,
        ...(form.password ? { password: form.password } : {})
      });
      setForm((current) => ({ ...current, password: "" }));
      setSuccess(t("profile.saved"));
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("errors.generic"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="ui-modal-backdrop fade-in" onClick={closeModal}>
      <section className="panel ui-modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/85 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">{t("nav.profile")}</p>
            <h2 className="mt-2 font-[Space_Grotesk] text-3xl font-bold text-white">{t("profile.title")}</h2>
          </div>
          <button type="button" onClick={closeModal} className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-8 p-6 md:grid-cols-[280px_1fr]">
          <aside className="panel-strong rounded-[30px] p-6">
            <div className="mx-auto h-36 w-36 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60">
              <img
                src={form.avatarURL || "https://placehold.co/320x320/png"}
                alt={form.username || user?.username || "Profile avatar"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-5 space-y-3 text-center">
              <p className="font-[Space_Grotesk] text-2xl font-bold text-white">{form.username || user?.username}</p>
              <p className="text-sm text-slate-400">{user?.email}</p>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-300">
                <Shield size={14} />
                {user?.role}
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Link2 size={15} className="text-cyan-300" />
                <span>/profile</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-cyan-300" />
                <span className="truncate">{user?.email}</span>
              </div>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="grid gap-5 rounded-[30px] border border-white/10 bg-slate-950/35 p-6">
            <p className="text-sm text-slate-400">{t("profile.subtitle")}</p>

            <label className="ui-label">
              <span className="ui-label-text">{t("auth.username")}</span>
              <div className="relative">
                <UserRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={form.username}
                  onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                  className="ui-input pl-11"
                  required
                />
              </div>
            </label>

            <label className="ui-label">
              <span className="ui-label-text">{t("auth.email")}</span>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="ui-input pl-11"
                  required
                />
              </div>
            </label>

            <label className="ui-label">
              <span className="ui-label-text">{t("auth.avatar")}</span>
              <div className="relative">
                <Camera size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={form.avatarURL}
                  onChange={(event) => setForm((current) => ({ ...current, avatarURL: event.target.value }))}
                  className="ui-input pl-11"
                  placeholder="https://..."
                />
              </div>
            </label>

            <label className="ui-label">
              <span className="ui-label-text">{t("profile.newPassword")}</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="ui-input"
                placeholder={t("profile.passwordHint")}
              />
            </label>

            {error ? <div className="rounded-[20px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
            {success ? <div className="rounded-[20px] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div> : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" disabled={isSaving} className="rounded-full bg-gradient-to-r from-cyan-400 to-sky-300 px-5 py-3 font-semibold text-slate-950 disabled:opacity-70">
                <span className="inline-flex items-center gap-2">
                  <Save size={16} />
                  {t("common.save")}
                </span>
              </button>
              <button type="button" onClick={closeModal} className="rounded-full border border-white/10 px-5 py-3 font-semibold text-slate-200">
                {t("common.close")}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ProfileModal;
