import { useMemo } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useI18n } from "./i18n";
import { useCompany } from "./CompanyContext";
import { SiteHeader, SiteFooter, LoggedInBar } from "./components";
import { BASE_PATH, PATHS } from "./paths";
import type { ApplicationFormData } from "./ApplicationPage";

function formatDate(value: string, locale: string): string {
  if (!value) return "";
  const date = new Date(value);
  return isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

const ConfirmationPage = () => {
  const { attributes, company, representative } = useCompany();
  const { lang, t } = useI18n();
  const form = useLocation().state as ApplicationFormData | null;
  const reference = useMemo(
    () => `MSP-${new Date().getFullYear()}-${Math.floor(1e5 + Math.random() * 9e5)}`,
    []
  );

  if (!attributes || !form) {
    return <Navigate to={BASE_PATH} replace />;
  }

  const locale = lang === "nl" ? "nl-NL" : "en-GB";
  const companyName = company?.companyName || t("bevestiging.unknownCompany");
  const applicant =
    [representative?.name || "", companyName].filter(Boolean).join(` ${t("bevestiging.namens")} `) ||
    "-";
  const start = form.startDate;
  const end = form.endDate;
  const period =
    start && end
      ? `${formatDate(start, locale)} ${t("bevestiging.periodSeparator")} ${formatDate(end, locale)}`
      : start
        ? formatDate(start, locale)
        : "-";

  return (
    <>
      <SiteHeader activePage="vergunningen" />
      <LoggedInBar />
      <div className="breadcrumbs">
        <Link to={BASE_PATH}>{t("breadcrumb.home")}</Link> <span>›</span>
        <Link to={PATHS.product}>{t("breadcrumb.product")}</Link>{" "}
        <span>›</span>
        {t("breadcrumb.confirmation")}
      </div>
      <main className="main-content">
        <div className="success-container">
          <div className="step-indicator" style={{ maxWidth: 780, margin: "0 auto 40px" }}>
            <div className="step completed">
              <span className="step-num">✓</span> {t("aanvraag.step1")}
            </div>
            <div className="step completed">
              <span className="step-num">✓</span> {t("aanvraag.step2")}
            </div>
            <div className="step active">
              <span className="step-num">3</span> {t("aanvraag.step3")}
            </div>
          </div>
          <div className="success-icon">✓</div>
          <h1>{t("bevestiging.title")}</h1>
          <p style={{ fontSize: 18, color: "var(--nij-gray-dark)", marginBottom: 8 }}>
            {t("bevestiging.lead")}
          </p>
          <p style={{ color: "var(--nij-gray-dark)" }}>{t("bevestiging.email")}</p>
          <div className="success-details">
            <h2>{t("bevestiging.overview")}</h2>
            <dl>
              <dt>{t("bevestiging.ref")}</dt>
              <dd>
                <strong>{reference}</strong>
              </dd>
              <dt>{t("bevestiging.applicant")}</dt>
              <dd>{applicant}</dd>
              <dt>{t("bevestiging.market")}</dt>
              <dd>{form.market || "-"}</dd>
              <dt>{t("bevestiging.location")}</dt>
              <dd>{form.location || "-"}</dd>
              <dt>{t("bevestiging.period")}</dt>
              <dd>{period}</dd>
              <dt>{t("bevestiging.product")}</dt>
              <dd>{t("bevestiging.product.value")}</dd>
              <dt>{t("bevestiging.status")}</dt>
              <dd>
                <span style={{ color: "#f60", fontWeight: 600 }}>{t("bevestiging.status.value")}</span>
              </dd>
              <dt>{t("bevestiging.expected")}</dt>
              <dd>{t("bevestiging.expected.value")}</dd>
              <dt>{t("bevestiging.cost")}</dt>
              <dd>{t("bevestiging.cost.value")}</dd>
            </dl>
          </div>
          <div className="info-box" style={{ textAlign: "left" }}>
            <p>
              <strong>{t("bevestiging.next.title")}</strong>
            </p>
            <ul style={{ margin: "12px 0 0 20px" }}>
              <li>{t("bevestiging.next.item1")}</li>
              <li>{t("bevestiging.next.item2")}</li>
              <li>{t("bevestiging.next.item3")}</li>
              <li>{t("bevestiging.next.item4")}</li>
            </ul>
          </div>
          <div className="success-actions">
            <Link to={BASE_PATH} className="btn btn-primary">
              {t("bevestiging.toHome")}
            </Link>
            <Link to={PATHS.product} className="btn btn-secondary">
              {t("bevestiging.viewProduct")}
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
};

export default ConfirmationPage;
