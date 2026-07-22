import { Link } from "react-router-dom";
import { useI18n } from "./i18n";
import { SiteHeader, SiteFooter } from "./components";
import { PATHS } from "./paths";

const MunicipalityHomePage = () => {
  const { t } = useI18n();
  return (
    <>
      <SiteHeader activePage="home" />
      <section className="hero">
        <div className="hero-inner">
          <h1>{t("home.hero.title")}</h1>
          <p>{t("home.hero.lead")}</p>
        </div>
      </section>
      <main className="main-content">
        <section className="category-section">
          <h2>{t("home.permits.title")}</h2>
          <div className="service-grid">
            <div className="service-card" style={{ borderColor: "var(--nij-green)", borderWidth: 2 }}>
              <h3>
                <Link to={PATHS.product} data-testid="link-market-stall-permit">
                  {t("home.permits.stall.title")}
                </Link>
              </h3>
              <p>{t("home.permits.stall.desc")}</p>
            </div>
            <div className="service-card">
              <h3>{t("home.permits.event.title")}</h3>
              <p>{t("home.permits.event.desc")}</p>
            </div>
            <div className="service-card">
              <h3>{t("home.permits.alcoholLicence.title")}</h3>
              <p>{t("home.permits.alcoholLicence.desc")}</p>
            </div>
            <div className="service-card">
              <h3>{t("home.permits.terrace.title")}</h3>
              <p>{t("home.permits.terrace.desc")}</p>
            </div>
          </div>
        </section>
        <section className="category-section">
          <h2>{t("home.services.title")}</h2>
          <div className="service-grid">
            <div className="service-card">
              <h3>{t("home.services.passport.title")}</h3>
              <p>{t("home.services.passport.desc")}</p>
            </div>
            <div className="service-card">
              <h3>{t("home.services.move.title")}</h3>
              <p>{t("home.services.move.desc")}</p>
            </div>
            <div className="service-card">
              <h3>{t("home.services.parking.title")}</h3>
              <p>{t("home.services.parking.desc")}</p>
            </div>
            <div className="service-card">
              <h3>{t("home.services.building.title")}</h3>
              <p>{t("home.services.building.desc")}</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
};

export default MunicipalityHomePage;
