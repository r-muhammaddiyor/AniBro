import { Camera, Mail, Shield, Sparkles, Upload, UserRound } from "lucide-react";
import { useContext, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { fileToDataUrl } from "../utils/fileToDataUrl.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ username: "", email: "", password: "", avatarURL: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarPreview = useMemo(() => form.avatarURL || "https://placehold.co/320x320/png", [form.avatarURL]);

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

  const validateForm = () => {
    if (form.username.trim().length < 3) {
      return "Username must be at least 3 characters long";
    }

    if (!emailPattern.test(form.email.trim())) {
      return "Please enter a valid email";
    }

    if (form.password.length < 8) {
      return "Password must be at least 8 characters long";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        avatarURL: form.avatarURL
      });
      navigate("/");
    } catch (submissionError) {
      setError(submissionError.message || t("errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-shell grid min-h-[72vh] place-items-center">
      <form onSubmit={handleSubmit} className="panel w-full max-w-2xl rounded-[32px] p-8 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1fr]">
          <aside className="panel-strong rounded-[28px] p-6">
            <div className="mx-auto h-36 w-36 overflow-hidden rounded-[26px] border border-white/10 bg-slate-950/60">
              <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
            </div>
            <div className="mt-5 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200">AniBro</p>
              <h1 className="mt-4 font-[Space_Grotesk] text-3xl font-bold text-white">{t("auth.createAccount")}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Create your account and set your profile image right away.
              </p>
            </div>
          </aside>

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-200">Join</p>
                <p className="mt-2 text-slate-400">Required fields plus optional avatar upload are supported here.</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-cyan-300">
                <Sparkles size={28} />
              </div>
            </div>

            <div className="mt-8 grid gap-5">
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

              <label className="ui-label">
                <span className="ui-label-text">{t("auth.password")}</span>
                <div className="relative">
                  <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    className="ui-input has-icon"
                    minLength={8}
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
            </div>

            {error ? <p className="mt-4 rounded-[20px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

            <button type="submit" disabled={isSubmitting} className="mt-6 w-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-300 px-5 py-3 font-semibold text-slate-950 disabled:opacity-70">
              {t("auth.signUp")}
            </button>

            <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <span>{t("auth.haveAccount")}</span>
              <Link className="inline-flex items-center gap-2 font-semibold text-cyan-300" to="/login">
                <UserRound size={15} />
                {t("auth.signIn")}
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;
