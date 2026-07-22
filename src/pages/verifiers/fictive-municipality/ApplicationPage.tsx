import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useI18n } from "./i18n";
import { useCompany } from "./CompanyContext";
import { displayableAttributes, labelForAttribute } from "./attributes";
import { SiteHeader, SiteFooter, LoggedInBar } from "./components";
import { BASE_PATH, PATHS } from "./paths";

export interface ApplicationFormData {
  email: string;
  phone: string;
  market: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  pitchSize: string;
  goods: string;
  traderName: string;
  traderBirthdate: string;
  assignment: string;
  assignmentNr: string;
}

const ApplicationPage = () => {
  const navigate = useNavigate();
  const { attributes, flat, representative } = useCompany();
  const { t, lang } = useI18n();
  const [form, setForm] = useState<ApplicationFormData>({
    email: "",
    phone: "",
    market: "",
    location: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    pitchSize: "",
    goods: "",
    traderName: representative?.name || "",
    traderBirthdate: representative?.birthdate || "",
    assignment: "",
    assignmentNr: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});

  if (!attributes) {
    return <Navigate to={PATHS.login} replace />;
  }

  const walletFields = displayableAttributes(flat);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ApplicationFormData]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof ApplicationFormData];
        return next;
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
    if (!form.email.trim()) {
      newErrors.email = t("aanvraag.email.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = t("aanvraag.email.invalid");
    }
    if (!form.phone.trim()) {
      newErrors.phone = t("aanvraag.phone.required");
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstField = Object.keys(newErrors)[0];
      document.getElementById(firstField)?.focus();
      return;
    }
    navigate(PATHS.confirmation, { state: form });
  };

  return (
    <>
      <SiteHeader activePage="vergunningen" />
      <LoggedInBar />
      <div className="breadcrumbs">
        <Link to={BASE_PATH}>{t("breadcrumb.home")}</Link> <span>›</span>
        <Link to={PATHS.product}>{t("breadcrumb.product")}</Link> <span>›</span>
        {t("breadcrumb.application")}
      </div>
      <main className="main-content">
        <div className="form-container">
          <h1 className="page-title">{t("aanvraag.title")}</h1>
          <div className="step-indicator">
            <div className="step active">
              <span className="step-num">1</span> {t("aanvraag.step1")}
            </div>
            <div className="step">
              <span className="step-num">2</span> {t("aanvraag.step2")}
            </div>
            <div className="step">
              <span className="step-num">3</span> {t("aanvraag.step3")}
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>{t("aanvraag.yourDetails")}</h2>
              <p style={{ marginBottom: 16, color: "var(--nij-gray-dark)", fontSize: 14 }}>
                {t("aanvraag.yourDetails.lead")}
              </p>
              <div
                className="authorization-badge"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "var(--nij-green-light)",
                  border: "2px solid var(--nij-green)",
                  borderRadius: 6,
                  padding: "14px 18px",
                  marginBottom: 20,
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="11" fill="#39870c" />
                  <path
                    d="M7 12.5l3.5 3.5L17 9"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <strong style={{ color: "var(--nij-green-dark)" }}>
                    {t("aanvraag.authorized.title")}
                  </strong>
                  <div style={{ fontSize: 14, color: "var(--nij-text)" }}>
                    {t("aanvraag.authorized.text")}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                {walletFields.map(([key, value]) => (
                  <div className="form-group" key={key}>
                    <label>{labelForAttribute(key, lang)}</label>
                    <input
                      type="text"
                      value={String(value)}
                      readOnly
                      style={{ background: "var(--nij-gray-light)" }}
                    />
                  </div>
                ))}
                {walletFields.length === 0 && (
                  <p style={{ color: "var(--nij-gray-dark)" }}>{t("aanvraag.noWalletData")}</p>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">{t("aanvraag.email")}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={t("aanvraag.email.placeholder")}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    style={errors.email ? { borderColor: "var(--nij-red)" } : undefined}
                  />
                  {errors.email && (
                    <span
                      id="email-error"
                      className="field-error"
                      style={{ color: "var(--nij-red)", fontSize: 13, marginTop: 4, display: "block" }}
                    >
                      {errors.email}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">{t("aanvraag.phone")}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder={t("aanvraag.phone.placeholder")}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    style={errors.phone ? { borderColor: "var(--nij-red)" } : undefined}
                  />
                  {errors.phone && (
                    <span
                      id="phone-error"
                      className="field-error"
                      style={{ color: "var(--nij-red)", fontSize: 13, marginTop: 4, display: "block" }}
                    >
                      {errors.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="form-section">
              <h2>{t("aanvraag.stall.section")}</h2>
              <div className="form-group">
                <label htmlFor="market">{t("aanvraag.stall.market")}</label>
                <input
                  type="text"
                  id="market"
                  name="market"
                  value={form.market}
                  onChange={handleChange}
                  placeholder={t("aanvraag.stall.marketPlaceholder")}
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">{t("aanvraag.stall.location")}</label>
                <span className="hint">{t("aanvraag.stall.locationHint")}</span>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder={t("aanvraag.stall.locationPlaceholder")}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">{t("aanvraag.stall.startDate")}</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">{t("aanvraag.stall.endDate")}</label>
                  <span className="hint">{t("aanvraag.stall.endDateHint")}</span>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startTime">{t("aanvraag.stall.startTime")}</label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endTime">{t("aanvraag.stall.endTime")}</label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="pitchSize">{t("aanvraag.stall.pitchSize")}</label>
                <input
                  type="number"
                  id="pitchSize"
                  name="pitchSize"
                  value={form.pitchSize}
                  onChange={handleChange}
                  placeholder={t("aanvraag.stall.pitchSizePlaceholder")}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="goods">{t("aanvraag.stall.goods")}</label>
                <span className="hint">{t("aanvraag.stall.goodsHint")}</span>
                <textarea
                  id="goods"
                  name="goods"
                  value={form.goods}
                  onChange={handleChange}
                  placeholder={t("aanvraag.stall.goodsPlaceholder")}
                />
              </div>
            </div>
            <div className="form-section">
              <h2>{t("aanvraag.trader.section")}</h2>
              <p style={{ marginBottom: 16, color: "var(--nij-gray-dark)", fontSize: 14 }}>
                {t("aanvraag.trader.lead")}
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="traderName">{t("aanvraag.trader.name")}</label>
                  <input
                    type="text"
                    id="traderName"
                    name="traderName"
                    value={form.traderName}
                    onChange={handleChange}
                    placeholder={t("aanvraag.trader.namePlaceholder")}
                    readOnly={!!representative?.name}
                    style={representative?.name ? { background: "var(--nij-gray-light)" } : undefined}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="traderBirthdate">{t("aanvraag.trader.birthdate")}</label>
                  <input
                    type="date"
                    id="traderBirthdate"
                    name="traderBirthdate"
                    value={form.traderBirthdate}
                    onChange={handleChange}
                    readOnly={!!representative?.birthdate}
                    style={
                      representative?.birthdate ? { background: "var(--nij-gray-light)" } : undefined
                    }
                  />
                </div>
              </div>
            </div>
            <div className="form-section">
              <h2>{t("aanvraag.assignment.section")}</h2>
              <div className="form-group">
                <label htmlFor="assignment">{t("aanvraag.assignment.question")}</label>
                <select
                  id="assignment"
                  name="assignment"
                  value={form.assignment}
                  onChange={handleChange}
                >
                  <option value="">{t("aanvraag.assignment.choose")}</option>
                  <option value="fixed">{t("aanvraag.assignment.haveFixed")}</option>
                  <option value="temporary">{t("aanvraag.assignment.haveTemporary")}</option>
                  <option value="applied">{t("aanvraag.assignment.applied")}</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="assignmentNr">{t("aanvraag.assignment.refNumber")}</label>
                <input
                  type="text"
                  id="assignmentNr"
                  name="assignmentNr"
                  value={form.assignmentNr}
                  onChange={handleChange}
                  placeholder={t("aanvraag.assignment.refPlaceholder")}
                />
              </div>
            </div>
            <div className="info-box">
              <p>
                <strong>{t("aanvraag.costs.label")}</strong> {t("aanvraag.costs.text")}
              </p>
            </div>
            <div className="form-section">
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" id="agree-conditions" name="agree-conditions" />
                  <span>{t("aanvraag.agree.data")}</span>
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" id="agree-cost" name="agree-cost" />
                  <span>{t("aanvraag.agree.cost")}</span>
                </label>
              </div>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                id="submit-application"
                className="btn btn-primary btn-large"
                aria-label={t("aanvraag.submit")}
              >
                {t("aanvraag.submit")}
              </button>
              <Link to={PATHS.product} className="btn btn-secondary">
                {t("aanvraag.cancel")}
              </Link>
            </div>
          </form>
        </div>
      </main>
      <SiteFooter />
    </>
  );
};

export default ApplicationPage;
