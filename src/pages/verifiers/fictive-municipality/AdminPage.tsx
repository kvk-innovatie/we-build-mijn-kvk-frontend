import { Fragment, useState } from "react";
import { useI18n } from "./i18n";
import { SiteHeader, SiteFooter } from "./components";
import { labelForAttribute } from "./attributes";
import {
  clearApplications,
  listApplications,
  setApplicationStatus,
  type ApplicationStatus,
  type StoredApplication,
} from "./applications";

function formatDate(value: string, locale: string): string {
  if (!value) return "";
  const date = new Date(value);
  return isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

function formatDateTime(value: string, locale: string): string {
  if (!value) return "-";
  const date = new Date(value);
  return isNaN(date.getTime())
    ? value
    : date.toLocaleString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

const AdminPage = () => {
  const { lang, t } = useI18n();
  const [applications, setApplications] = useState<StoredApplication[]>(listApplications);
  const [expanded, setExpanded] = useState<string | null>(null);

  const locale = lang === "nl" ? "nl-NL" : "en-GB";

  const decide = (reference: string, status: ApplicationStatus) => {
    setApplications(setApplicationStatus(reference, status));
  };

  const handleClear = () => {
    if (window.confirm(t("admin.clear.confirm"))) {
      clearApplications();
      setApplications([]);
      setExpanded(null);
    }
  };

  const periodFor = (application: StoredApplication) => {
    const { startDate, endDate } = application.form;
    if (startDate && endDate) {
      return `${formatDate(startDate, locale)} ${t("bevestiging.periodSeparator")} ${formatDate(endDate, locale)}`;
    }
    return startDate ? formatDate(startDate, locale) : "-";
  };

  const assignmentLabel = (value: string) => {
    if (value === "fixed") return t("aanvraag.assignment.haveFixed");
    if (value === "temporary") return t("aanvraag.assignment.haveTemporary");
    if (value === "applied") return t("aanvraag.assignment.applied");
    return "-";
  };

  const pendingCount = applications.filter((a) => a.status === "pending").length;

  return (
    <>
      <SiteHeader activePage="admin" />
      <main className="main-content">
        <div className="admin-header">
          <div>
            <h1 className="page-title" style={{ marginBottom: 8 }}>
              {t("admin.title")}
            </h1>
            <p style={{ color: "var(--nij-gray-dark)" }}>{t("admin.lead")}</p>
          </div>
          {applications.length > 0 && (
            <button type="button" className="btn btn-secondary" onClick={handleClear}>
              {t("admin.clear")}
            </button>
          )}
        </div>

        {applications.length > 0 && (
          <p className="admin-count">
            {pendingCount} {t("admin.pendingSuffix")}
          </p>
        )}

        {applications.length === 0 ? (
          <div className="admin-empty">
            <p>
              <strong>{t("admin.empty")}</strong>
            </p>
            <p>{t("admin.emptyHint")}</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t("admin.col.ref")}</th>
                  <th>{t("admin.col.submitted")}</th>
                  <th>{t("admin.col.company")}</th>
                  <th>{t("admin.col.market")}</th>
                  <th>{t("admin.col.period")}</th>
                  <th>{t("admin.col.status")}</th>
                  <th>{t("admin.col.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => {
                  const isOpen = expanded === application.reference;
                  return (
                    <Fragment key={application.reference}>
                      <tr>
                        <td>
                          <strong>{application.reference}</strong>
                        </td>
                        <td>{formatDateTime(application.submittedAt, locale)}</td>
                        <td>
                          {application.company?.companyName || t("bevestiging.unknownCompany")}
                          <span className="admin-verified" title={t("admin.verified")}>
                            ✓ {t("admin.verified")}
                          </span>
                        </td>
                        <td>{application.form.market || "-"}</td>
                        <td>{periodFor(application)}</td>
                        <td>
                          <span className={`status-badge status-${application.status}`}>
                            {t(`admin.status.${application.status}`)}
                          </span>
                        </td>
                        <td>
                          <div className="admin-actions">
                            {application.status === "pending" && (
                              <>
                                <button
                                  type="button"
                                  className="btn-admin btn-approve"
                                  onClick={() => decide(application.reference, "approved")}
                                >
                                  {t("admin.action.approve")}
                                </button>
                                <button
                                  type="button"
                                  className="btn-admin btn-reject"
                                  onClick={() => decide(application.reference, "rejected")}
                                >
                                  {t("admin.action.reject")}
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              className="btn-admin btn-details"
                              aria-expanded={isOpen}
                              onClick={() => setExpanded(isOpen ? null : application.reference)}
                            >
                              {isOpen ? t("admin.action.hide") : t("admin.action.details")}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="admin-details-row">
                          <td colSpan={7}>
                            <div className="admin-details">
                              <section>
                                <h3>{t("admin.details.wallet")}</h3>
                                <dl>
                                  {application.walletFields.map(([key, value]) => (
                                    <div key={key}>
                                      <dt>{labelForAttribute(key, lang)}</dt>
                                      <dd>{value}</dd>
                                    </div>
                                  ))}
                                  {application.walletFields.length === 0 && (
                                    <div>
                                      <dd>{t("aanvraag.noWalletData")}</dd>
                                    </div>
                                  )}
                                </dl>
                              </section>
                              <section>
                                <h3>{t("admin.details.contact")}</h3>
                                <dl>
                                  <div>
                                    <dt>{t("aanvraag.email")}</dt>
                                    <dd>{application.form.email || "-"}</dd>
                                  </div>
                                  <div>
                                    <dt>{t("aanvraag.phone")}</dt>
                                    <dd>{application.form.phone || "-"}</dd>
                                  </div>
                                </dl>
                                <h3>{t("admin.details.trader")}</h3>
                                <dl>
                                  <div>
                                    <dt>{t("aanvraag.trader.name")}</dt>
                                    <dd>{application.form.traderName || "-"}</dd>
                                  </div>
                                  <div>
                                    <dt>{t("aanvraag.trader.birthdate")}</dt>
                                    <dd>
                                      {application.form.traderBirthdate
                                        ? formatDate(application.form.traderBirthdate, locale)
                                        : "-"}
                                    </dd>
                                  </div>
                                </dl>
                              </section>
                              <section>
                                <h3>{t("admin.details.stall")}</h3>
                                <dl>
                                  <div>
                                    <dt>{t("aanvraag.stall.location")}</dt>
                                    <dd>{application.form.location || "-"}</dd>
                                  </div>
                                  <div>
                                    <dt>{t("aanvraag.stall.startTime")}</dt>
                                    <dd>{application.form.startTime || "-"}</dd>
                                  </div>
                                  <div>
                                    <dt>{t("aanvraag.stall.endTime")}</dt>
                                    <dd>{application.form.endTime || "-"}</dd>
                                  </div>
                                  <div>
                                    <dt>{t("aanvraag.stall.pitchSize")}</dt>
                                    <dd>{application.form.pitchSize || "-"}</dd>
                                  </div>
                                  <div>
                                    <dt>{t("aanvraag.stall.goods")}</dt>
                                    <dd>{application.form.goods || "-"}</dd>
                                  </div>
                                </dl>
                                <h3>{t("admin.details.assignment")}</h3>
                                <dl>
                                  <div>
                                    <dt>{t("aanvraag.assignment.question")}</dt>
                                    <dd>{assignmentLabel(application.form.assignment)}</dd>
                                  </div>
                                  <div>
                                    <dt>{t("aanvraag.assignment.refNumber")}</dt>
                                    <dd>{application.form.assignmentNr || "-"}</dd>
                                  </div>
                                  {application.decidedAt && (
                                    <div>
                                      <dt>{t("admin.decidedAt")}</dt>
                                      <dd>{formatDateTime(application.decidedAt, locale)}</dd>
                                    </div>
                                  )}
                                </dl>
                              </section>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
};

export default AdminPage;
