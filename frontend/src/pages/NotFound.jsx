import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="container-shell grid min-h-[70vh] place-items-center">
      <div className="panel rounded-[36px] p-10 text-center">
        <p className="text-sm uppercase tracking-[0.45em] text-orange-200">404</p>
        <h1 className="mt-4 font-[Space_Grotesk] text-5xl font-bold text-white">{t("errors.notFound")}</h1>
        <Link className="mt-8 inline-flex rounded-full bg-gradient-to-r from-orange-500 to-amber-300 px-5 py-3 font-semibold text-slate-950" to="/">
          {t("nav.home")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
