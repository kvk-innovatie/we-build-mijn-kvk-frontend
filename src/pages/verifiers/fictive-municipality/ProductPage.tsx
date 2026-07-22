import { Link } from "react-router-dom";
import { useI18n } from "./i18n";
import { SiteHeader, SiteFooter } from "./components";
import { PATHS } from "./paths";

const ProductPage = () => {
  const { t } = useI18n();
  return (
    <>
      <SiteHeader activePage="vergunningen" />
      <main className="main-content" style={{ maxWidth: 780 }}>
        <h1 className="page-title">{t("product.title")}</h1>
        <p style={{ fontSize: 18, marginBottom: 24 }}>{t("product.lead")}</p>
        <Link
          to={PATHS.login}
          id="apply"
          data-testid="apply"
          className="btn btn-primary btn-large btn-block"
          style={{ marginBottom: 40, fontSize: 20, padding: 20 }}
        >
          {t("product.apply")}
        </Link>
        <h2>{t("product.know.title")}</h2>
        <p>{t("product.know.lead")}</p>
        <ul>
          <li>{t("product.know.item1")}</li>
          <li>{t("product.know.item2")}</li>
          <li>{t("product.know.item3")}</li>
        </ul>
        <h2>{t("product.conditions.title")}</h2>
        <p>{t("product.conditions.text")}</p>
        <h2>{t("product.cost.title")}</h2>
        <p>{t("product.cost.text")}</p>
        <h2>{t("product.duration.title")}</h2>
        <p>{t("product.duration.text")}</p>
      </main>
      <SiteFooter />
    </>
  );
};

export default ProductPage;
