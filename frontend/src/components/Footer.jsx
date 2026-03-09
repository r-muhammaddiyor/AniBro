import { Github, Globe, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/10 py-10">
      <div className="container-shell flex flex-col items-center gap-6 text-center text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between lg:text-left">
        <div className="max-w-2xl">
          <p className="font-[Space_Grotesk] text-lg font-semibold text-white">AniBro</p>
          <p className="mt-2 leading-7">{t("footer.tagline")}</p>
        </div>

        <div className="flex flex-col items-center gap-4 lg:items-end">
          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
            <a href="mailto:hello@anibro.dev" className="ui-pill ui-link text-sm focus-visible:outline-none">
              <Mail size={15} />
              hello@anibro.dev
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="ui-pill ui-link text-sm focus-visible:outline-none">
              <Github size={15} />
              GitHub
            </a>
            <a href="https://vercel.com" target="_blank" rel="noreferrer" className="ui-pill ui-link text-sm focus-visible:outline-none">
              <Globe size={15} />
              Vercel
            </a>
          </div>
          <p className="text-xs uppercase tracking-[0.26em] text-slate-500">React + Vite + Tailwind v4 + Express + MongoDB Atlas</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
