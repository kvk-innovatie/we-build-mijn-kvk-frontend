import { Link } from "react-router-dom";
import { useI18n } from "./i18n";
import { useCompany } from "./CompanyContext";
import { BASE_PATH, PATHS } from "./paths";

export function SiteHeader({ activePage }: { activePage: "home" | "vergunningen" | "admin" }) {
  const { lang, setLang, t } = useI18n();
  return (
    <header className="site-header">
      <div className="header-top">
        <Link to={BASE_PATH} className="logo">
          <svg className="logo-icon" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="6" fill="#c00" />
            <text x="10" y="34" fontSize="28" fontWeight="900" fill="white">
              F
            </text>
          </svg>
          <div className="logo-text">
            {t("header.logo.prefix")} <span>Fictive</span>
          </div>
        </Link>
        <div className="lang-toggle" role="group" aria-label={t("header.lang.aria")}>
          <button
            type="button"
            className={`lang-btn ${lang === "en" ? "active" : ""}`}
            aria-pressed={lang === "en"}
            onClick={() => setLang("en")}
          >
            EN
          </button>
          <span className="lang-sep" aria-hidden="true">
            /
          </span>
          <button
            type="button"
            className={`lang-btn ${lang === "nl" ? "active" : ""}`}
            aria-pressed={lang === "nl"}
            onClick={() => setLang("nl")}
          >
            NL
          </button>
        </div>
      </div>
      <nav className="site-nav" aria-label={t("header.nav.aria")}>
        <ul>
          <li>
            <Link to={BASE_PATH} className={activePage === "home" ? "active" : ""}>
              {t("header.nav.home")}
            </Link>
          </li>
          <li>
            <Link
              to={PATHS.product}
              className={activePage === "vergunningen" ? "active" : ""}
            >
              {t("header.nav.permits")}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-copy">{t("footer.copy")}</div>
        <ul className="footer-links">
          <li>
            <Link to={PATHS.admin}>{t("footer.admin")}</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export function LoggedInBar() {
  const { company, logout } = useCompany();
  const { t } = useI18n();
  if (!company) return null;
  return (
    <div className="logged-in-bar">
      <div className="inner">
        <span>
          {t("loggedin.label")}{" "}
          <strong>{company.companyName || t("bevestiging.unknownCompany")}</strong> (EUID:{" "}
          <span>{company.euid}</span>)
        </span>
        <Link to={PATHS.login} onClick={logout}>
          {t("loggedin.logout")}
        </Link>
      </div>
    </div>
  );
}
