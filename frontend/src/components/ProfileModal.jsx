import { Award, Camera, Heart, Link2, Mail, Save, Shield, Upload, UserRound, X } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { getWatchHistory } from "../services/watchHistoryService.js";
import { fileToDataUrl } from "../utils/fileToDataUrl.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ProfileModal = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, favorites, updateProfile } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ username: "", email: "", avatarURL: "", password: "" });
  const [history, setHistory] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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

    const loadHistory = async () => {
      try {
        const items = await getWatchHistory(user._id);
        setHistory(items);
      } catch (_error) {
        setHistory([]);
      }
    };

    void loadHistory();
  }, [user]);

  const badges = useMemo(() => {
    const badgeItems = [];

    if (history.length >= 1) badgeItems.push(t("profile.badgeStarter"));
    if (history.length >= 5) badgeItems.push(t("profile.badgeMarathon"));
    if (favorites.length >= 3) badgeItems.push(t("profile.badgeCollector"));

    return badgeItems;
  }, [favorites.length, history.length, t]);

  const handleAvatarSelect = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(t("auth.avatarTypeError"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(t("auth.avatarSizeError"));
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((current) => ({ ...current, avatarURL: dataUrl }));
      setError("");
    } catch (_error) {
      setError(t("errors.generic"));
    }
  };

  const closeModal = () => {
    if (location.state?.backgroundLocation) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  const validateProfile = () => {
    if (form.username.trim().length < 3) {
      return "Username must be at least 3 characters long";
    }

    if (!emailPattern.test(form.email.trim())) {
      return "Please enter a valid email";
    }

    if (form.password && form.password.length < 8) {
      return "Password must be at least 8 characters long";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    const validationError = validateProfile();

    if (validationError) {
      setError(validationError);
      setIsSaving(false);
      return;
    }

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
      setError(requestError.message || t("errors.generic"));
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
          <button type="button" onClick={closeModal} className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-100 focus-visible:outline-none">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-8 p-6 md:grid-cols-[280px_1fr]">
          <aside className="space-y-5">
            <div className="panel-strong rounded-[30px] p-6">
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
            </div>

            <div className="panel-strong rounded-[30px] p-6">
              <p className="font-[Space_Grotesk] text-xl font-bold text-white">{t("profile.badges")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {badges.length ? (
                  badges.map((badge) => (
                    <span key={badge} className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                      <Award size={14} />
                      {badge}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">{t("profile.badgesEmpty")}</p>
                )}
              </div>
            </div>
          </aside>

          <div className="grid gap-5">
            <form onSubmit={handleSubmit} className="grid gap-5 rounded-[30px] border border-white/10 bg-slate-950/35 p-6">
              <p className="text-sm text-slate-400">{t("profile.subtitle")}</p>

              <label className="ui-label">
                <span className="ui-label-text">{t("auth.username")}</span>
                <div className="relative">
                  <UserRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={form.username}
                    onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                    className="ui-input has-icon"
                    minLength={3}
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
                    className="ui-input has-icon"
                    required
                  />
                </div>
              </label>

              <div className="ui-label">
                <span className="ui-label-text">{t("auth.avatar")}</span>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-[3.25rem] w-full items-center gap-3 rounded-[1.2rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-left text-slate-200 transition hover:bg-white/5 focus-visible:outline-none"
                >
                  <Camera size={16} className="text-slate-500" />
                  <span className="flex-1">{form.avatarURL ? t("auth.avatarSelected") : t("auth.avatarPick")}</span>
                  <Upload size={16} className="text-cyan-300" />
                </button>
              </div>

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
                <button type="button" onClick={closeModal} className="rounded-full border border-white/10 px-5 py-3 font-semibold text-slate-200 focus-visible:outline-none">
                  {t("common.close")}
                </button>
              </div>
            </form>

            <section className="rounded-[30px] border border-white/10 bg-slate-950/35 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Heart size={18} className="text-pink-300" />
                <h3 className="font-[Space_Grotesk] text-xl font-bold text-white">{t("profile.favorites")}</h3>
              </div>
              <div className="grid gap-3">
                {favorites.length ? (
                  favorites.slice(0, 4).map((anime) => (
                    <Link key={anime._id} to={`/anime/${anime._id}`} state={{ backgroundLocation: location.state?.backgroundLocation || { pathname: "/" } }} className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/5 p-3 transition hover:bg-white/8 focus-visible:outline-none">
                      <img src={anime.posterURL} alt={anime.title} className="h-16 w-12 rounded-xl object-cover" loading="lazy" decoding="async" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{anime.title}</p>
                        <p className="line-clamp-2 text-sm text-slate-400">{anime.description}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">{t("profile.favoritesEmpty")}</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfileModal;
