import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/10 py-8">
      <div className="container-shell flex flex-col gap-3 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-[Space_Grotesk] text-lg font-semibold text-white">AniBro</p>
          <p>{t("footer.tagline")}</p>
        </div>
        <p>React + Vite + Tailwind v4 + Express + MongoDB Atlas</p>
      </div>
    </footer>
  );
};

export default Footer;
