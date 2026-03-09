import { Compass, Menu, Shield, UserRound, X } from "lucide-react";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import DarkModeToggle from "./DarkModeToggle.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin, logout, user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-gradient-to-r from-orange-500 to-amber-300 text-slate-950 shadow-lg shadow-orange-500/20"
        : "text-slate-300 hover:bg-white/8 hover:text-white"
    }`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl">
      <div className="container-shell flex min-h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-300 to-cyan-400 text-lg font-black text-slate-950 shadow-[0_0_30px_rgba(255,122,24,0.35)]">
            A
          </div>
          <div>
            <p className="font-[Space_Grotesk] text-lg font-bold tracking-wide text-white">AniBro</p>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Anime Platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 lg:flex">
          <NavLink className={navLinkClass} to="/">
            <span className="inline-flex items-center gap-2">
              <Compass size={15} />
              {t("nav.home")}
            </span>
          </NavLink>
          {isAdmin ? (
            <NavLink className={navLinkClass} to="/admin">
              <span className="inline-flex items-center gap-2">
                <Shield size={15} />
                {t("nav.admin")}
              </span>
            </NavLink>
          ) : null}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <DarkModeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 pr-1.5">
              <Link
                to="/profile"
                state={{ backgroundLocation: location }}
                className="inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/12"
              >
                <UserRound size={15} />
                {user?.username}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
              >
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link className="rounded-full px-4 py-2 text-sm text-slate-200" to="/login">
                {t("nav.login")}
              </Link>
              <Link
                className="rounded-full bg-gradient-to-r from-orange-500 to-amber-300 px-4 py-2 text-sm font-semibold text-slate-950"
                to="/register"
              >
                {t("nav.register")}
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="rounded-full border border-white/10 bg-white/5 p-3 text-white lg:hidden"
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-white/10 bg-slate-950/95 lg:hidden">
          <div className="container-shell flex flex-col gap-3 py-4">
            <NavLink className={navLinkClass} onClick={() => setIsOpen(false)} to="/">
              {t("nav.home")}
            </NavLink>
            {isAdmin ? (
              <NavLink className={navLinkClass} onClick={() => setIsOpen(false)} to="/admin">
                {t("nav.admin")}
              </NavLink>
            ) : null}
            {isAuthenticated ? (
              <Link
                to="/profile"
                state={{ backgroundLocation: location }}
                onClick={() => setIsOpen(false)}
                className="ui-pill"
              >
                <UserRound size={15} />
                {t("nav.profile")}
              </Link>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <LanguageSwitcher />
              <DarkModeToggle />
            </div>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950"
              >
                {t("nav.logout")}
              </button>
            ) : (
              <div className="grid gap-3">
                <Link className="rounded-full border border-white/10 px-4 py-3 text-center" to="/login">
                  {t("nav.login")}
                </Link>
                <Link
                  className="rounded-full bg-gradient-to-r from-orange-500 to-amber-300 px-4 py-3 text-center font-semibold text-slate-950"
                  to="/register"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
