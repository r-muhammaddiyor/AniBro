import { LogIn, Mail, Shield, UserRound } from "lucide-react";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/");
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || t("errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-shell grid min-h-[72vh] place-items-center">
      <form onSubmit={handleSubmit} className="panel w-full max-w-xl rounded-[32px] p-8 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-orange-200">AniBro</p>
            <h1 className="mt-4 font-[Space_Grotesk] text-4xl font-bold text-white">{t("auth.welcomeBack")}</h1>
            <p className="mt-3 max-w-xl text-slate-400">{t("auth.demoAdmin")}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-orange-300">
            <LogIn size={28} />
          </div>
        </div>

        <div className="mt-8 grid gap-5">
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
        </div>

        {error ? <p className="mt-4 rounded-[20px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

        <button type="submit" disabled={isSubmitting} className="mt-6 w-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300 px-5 py-3 font-semibold text-slate-950 disabled:opacity-70">
          {t("auth.signIn")}
        </button>

        <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <span>{t("auth.needAccount")}</span>
          <Link className="inline-flex items-center gap-2 font-semibold text-orange-300" to="/register">
            <UserRound size={15} />
            {t("auth.signUp")}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
