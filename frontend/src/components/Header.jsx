import { Compass, Menu, Shield, UserRound, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
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

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2.5 text-sm font-medium transition ui-link focus-visible:outline-none ${
      isActive
        ? "bg-gradient-to-r from-orange-500 to-amber-300 text-slate-950 shadow-lg shadow-orange-500/20"
        : "text-slate-300 hover:bg-white/8 hover:text-white"
    }`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl">
      <div className="container-shell flex min-h-20 items-center justify-between gap-3 py-2">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-lg font-black text-slate-950 shadow-[0_0_30px_rgba(255,122,24,0.35)]"
            style={{ backgroundImage: "linear-gradient(135deg, var(--accent), var(--accent-2), var(--accent-cool))" }}
          >
            A
          </div>
          <div className="min-w-0">
            <p className="truncate font-[Space_Grotesk] text-base font-bold tracking-wide text-white sm:text-lg">AniBro</p>
            <p className="hidden text-[11px] uppercase tracking-[0.32em] text-slate-500 sm:block">Anime Platform</p>
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
                className="inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/12 focus-visible:outline-none"
              >
                <UserRound size={15} />
                <span className="max-w-[140px] truncate">{user?.username}</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] focus-visible:outline-none"
              >
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link className="rounded-full px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5 hover:text-white focus-visible:outline-none" to="/login">
                {t("nav.login")}
              </Link>
              <Link
                className="rounded-full bg-gradient-to-r from-orange-500 to-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] focus-visible:outline-none"
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
          className="rounded-full border border-white/10 bg-white/5 p-3 text-white transition hover:bg-white/10 focus-visible:outline-none lg:hidden"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`overflow-hidden border-t border-white/10 bg-slate-950/95 transition-all duration-200 ease-out lg:hidden ${
          isOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
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
              className="ui-pill focus-visible:outline-none"
            >
              <UserRound size={15} />
              {t("nav.profile")}
            </Link>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <LanguageSwitcher />
            <DarkModeToggle />
          </div>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 focus-visible:outline-none"
            >
              {t("nav.logout")}
            </button>
          ) : (
            <div className="grid gap-3">
              <Link className="rounded-full border border-white/10 px-4 py-3 text-center transition hover:bg-white/5 focus-visible:outline-none" to="/login">
                {t("nav.login")}
              </Link>
              <Link
                className="rounded-full bg-gradient-to-r from-orange-500 to-amber-300 px-4 py-3 text-center font-semibold text-slate-950 transition hover:scale-[1.01] focus-visible:outline-none"
                to="/register"
              >
                {t("nav.register")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
