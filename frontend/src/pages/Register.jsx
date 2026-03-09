import { Camera, Mail, Shield, Sparkles, UserRound } from "lucide-react";
import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", email: "", password: "", avatarURL: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarPreview = useMemo(() => form.avatarURL || "https://placehold.co/320x320/png", [form.avatarURL]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await register(form);
      navigate("/");
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || t("errors.generic"));
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
                Build your profile once, then keep updating it later from the profile modal.
              </p>
            </div>
          </aside>

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-200">Join</p>
                <p className="mt-2 text-slate-400">Clean inputs, better spacing, and avatar preview are now built in.</p>
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
                <span className="ui-label-text">{t("auth.password")}</span>
                <div className="relative">
                  <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
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
