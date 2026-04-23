import { useMemo, useState } from "react";
import WalletConnectButton from "wallet-connect-button-react";
import { Shield, Lock, CheckCircle2, Clock, User, Building2, ArrowLeft, Loader2 } from "lucide-react";

type Stage = "scan" | "review" | "submitting" | "success";

const PERSONAL_KEYS = new Set([
  "family_name",
  "given_name",
  "birthdate",
  "age_over_18",
  "nationalities",
  "familyName",
  "givenName",
  "ageOver18",
]);

const prettify = (key: string) =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatValue = (value: unknown) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
};

const makeReference = () =>
  "DB-KYC-" +
  Math.random().toString(36).slice(2, 6).toUpperCase() +
  "-" +
  Math.random().toString(36).slice(2, 6).toUpperCase();

const translations = {
  nl: {
    nav: {
      private: "Private Clients",
      business: "Business",
      corporate: "Corporate & Investment Bank",
      about: "About Us",
    },
    heroTitle: "Customer Identification (KYC)",
    heroSubtitle:
      "To comply with European anti-money laundering regulations, Deutsche Bank is required to verify the identity of all new and existing customers.",
    stepsTitle: "How it works",
    step1Title: "Start your verification",
    step1Desc: "Scan the QR code with your NL-wallet to securely share your identity attributes.",
    step2Title: "Review your data",
    step2Desc: "Confirm which information you want to share. You stay in control of your personal data.",
    step3Title: "Complete",
    step3Desc: "Your account is verified and ready to use. No paperwork, no waiting.",
    verifyTitle: "Begin Identity Verification",
    verifyDesc:
      "Use your NL-wallet (personal) to complete the KYC process in less than a minute.",
    walletLabel: "Verify with NL-wallet",
    walletLang: "nl" as const,
    trustTitle: "Secure & compliant",
    trust1: "AVG / GDPR compliant",
    trust2: "End-to-end encrypted",
    trust3: "Less than 60 seconds",
    reviewTitle: "Review & confirm",
    reviewDesc:
      "Please review the information received from your NL-wallet. By submitting, you authorise Deutsche Bank to use this data for customer identification.",
    personalSection: "Personal information",
    legalSection: "Legal entity information",
    submitBtn: "Submit & complete KYC",
    backBtn: "Scan again",
    submittingTitle: "Submitting your data",
    submittingDesc: "Securely transmitting your information to Deutsche Bank…",
    successTitle: "KYC completed",
    successDesc: "Your identity has been verified. Thank you for banking with Deutsche Bank.",
    successReference: "Reference number",
    successNext: "A confirmation email will be sent shortly. You may now close this window or continue to your dashboard.",
    successCta: "Continue to dashboard",
    restartCta: "Start new verification",
    footerDisclaimer:
      "Deutsche Bank AG is a credit institution supervised by the European Central Bank (ECB) and the German Federal Financial Supervisory Authority (BaFin).",
    footerCopy: "© 2026 Deutsche Bank AG. All rights reserved.",
  },
  en: {
    nav: {
      private: "Private Clients",
      business: "Business",
      corporate: "Corporate & Investment Bank",
      about: "About Us",
    },
    heroTitle: "Customer Identification (KYC)",
    heroSubtitle:
      "To comply with European anti-money laundering regulations, Deutsche Bank is required to verify the identity of all new and existing customers.",
    stepsTitle: "How it works",
    step1Title: "Start your verification",
    step1Desc: "Scan the QR code with your NL-wallet to securely share your identity attributes.",
    step2Title: "Review your data",
    step2Desc: "Confirm which information you want to share. You stay in control of your personal data.",
    step3Title: "Complete",
    step3Desc: "Your account is verified and ready to use. No paperwork, no waiting.",
    verifyTitle: "Begin Identity Verification",
    verifyDesc:
      "Use your NL-wallet (personal) to complete the KYC process in less than a minute.",
    walletLabel: "Verify with NL-wallet",
    walletLang: "en" as const,
    trustTitle: "Secure & compliant",
    trust1: "GDPR compliant",
    trust2: "End-to-end encrypted",
    trust3: "Less than 60 seconds",
    reviewTitle: "Review & confirm",
    reviewDesc:
      "Please review the information received from your NL-wallet. By submitting, you authorise Deutsche Bank to use this data for customer identification.",
    personalSection: "Personal information",
    legalSection: "Legal entity information",
    submitBtn: "Submit & complete KYC",
    backBtn: "Scan again",
    submittingTitle: "Submitting your data",
    submittingDesc: "Securely transmitting your information to Deutsche Bank…",
    successTitle: "KYC completed",
    successDesc: "Your identity has been verified. Thank you for banking with Deutsche Bank.",
    successReference: "Reference number",
    successNext: "A confirmation email will be sent shortly. You may now close this window or continue to your dashboard.",
    successCta: "Continue to dashboard",
    restartCta: "Start new verification",
    footerDisclaimer:
      "Deutsche Bank AG is a credit institution supervised by the European Central Bank (ECB) and the German Federal Financial Supervisory Authority (BaFin).",
    footerCopy: "© 2026 Deutsche Bank AG. All rights reserved.",
  },
};

type Lang = keyof typeof translations;

const DB_BLUE = "#0018a8";

const DeutscheBankVerifierPage = () => {
  const [lang, setLang] = useState<Lang>("en");
  const [stage, setStage] = useState<Stage>("scan");
  const [attributes, setAttributes] = useState<Record<string, unknown> | null>(null);
  const [reference, setReference] = useState<string>("");

  const t = translations[lang];

  const handleSuccess = (attrs: Record<string, unknown>) => {
    setAttributes(attrs);
    setStage("review");
  };

  const handleSubmit = () => {
    setStage("submitting");
    setTimeout(() => {
      setReference(makeReference());
      setStage("success");
    }, 1500);
  };

  const handleRestart = () => {
    setAttributes(null);
    setReference("");
    setStage("scan");
  };

  const { personalEntries, legalEntries } = useMemo(() => {
    const personal: [string, unknown][] = [];
    const legal: [string, unknown][] = [];
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "_");
        if (
          PERSONAL_KEYS.has(key) ||
          normalized.includes("family_name") ||
          normalized.includes("given_name") ||
          normalized.includes("birthdate") && !normalized.includes("representative") ||
          normalized.includes("age_over") ||
          normalized.includes("nationalit")
        ) {
          personal.push([key, value]);
        } else {
          legal.push([key, value]);
        }
      }
    }
    return { personalEntries: personal, legalEntries: legal };
  }, [attributes]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Top header bar */}
      <header className="border-b border-[#e5e7eb]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center px-3 py-2 rounded-sm"
              style={{ backgroundColor: DB_BLUE }}
            >
              <img
                src="/DBWM-logo.svg"
                alt="Deutsche Bank"
                className="h-8 w-auto"
              />
            </div>
            <div className="hidden md:block border-l border-[#e5e7eb] pl-3 ml-1">
              <div className="text-[11px] uppercase tracking-wider text-[#5a6a7a]">
                Secure Portal
              </div>
              <div className="text-[13px] font-semibold text-[#1a1a1a]">
                Customer Onboarding
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden lg:flex items-center gap-6 text-[13px] text-[#1a1a1a]">
              <a href="#" className="hover:text-[#0018a8]">{t.nav.private}</a>
              <a href="#" className="hover:text-[#0018a8]">{t.nav.business}</a>
              <a href="#" className="hover:text-[#0018a8]">{t.nav.corporate}</a>
              <a href="#" className="hover:text-[#0018a8]">{t.nav.about}</a>
            </nav>
            <div className="flex gap-1.5">
              {(["nl", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`border rounded-sm px-2.5 py-1 text-[12px] cursor-pointer transition-all ${
                    lang === l
                      ? "bg-[#0018a8] text-white border-[#0018a8]"
                      : "bg-transparent text-[#5a6a7a] border-[#dde1e6] hover:bg-[#f0f2f5]"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hero band */}
      <section
        className="border-b border-[#e5e7eb]"
        style={{
          background:
            "linear-gradient(135deg, #0018a8 0%, #001a73 60%, #000d4d 100%)",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6 py-14 text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-[11px] uppercase tracking-wider mb-4">
            <Shield className="w-3.5 h-3.5" />
            Anti-Money Laundering — EU Directive 2015/849
          </div>
          <h1 className="text-[36px] md:text-[44px] font-bold leading-tight max-w-[720px]">
            {t.heroTitle}
          </h1>
          <p className="text-[16px] text-white/80 mt-4 max-w-[680px] leading-relaxed">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Main content */}
      <main className="flex-1 bg-[#f5f7fa]">
        <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10">
          {/* Left: steps */}
          <div>
            <h2 className="text-[22px] font-bold text-[#1a1a1a] mb-6">
              {t.stepsTitle}
            </h2>

            <ol className="space-y-5">
              {[
                { title: t.step1Title, desc: t.step1Desc },
                { title: t.step2Title, desc: t.step2Desc },
                { title: t.step3Title, desc: t.step3Desc },
              ].map((s, i) => (
                <li
                  key={i}
                  className="bg-white border border-[#e5e7eb] rounded-md p-5 flex gap-4"
                >
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-full text-white font-bold flex items-center justify-center"
                    style={{ backgroundColor: DB_BLUE }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-[#1a1a1a] mb-1">
                      {s.title}
                    </div>
                    <p className="text-[14px] text-[#5a6a7a] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 bg-white border border-[#e5e7eb] rounded-md p-5">
              <div className="text-[13px] font-semibold text-[#1a1a1a] mb-3 uppercase tracking-wider">
                {t.trustTitle}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Shield, label: t.trust1 },
                  { icon: Lock, label: t.trust2 },
                  { icon: Clock, label: t.trust3 },
                ].map(({ icon: Icon, label }, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-[13px] text-[#5a6a7a]"
                  >
                    <Icon className="w-4 h-4" style={{ color: DB_BLUE }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: verification card */}
          <aside>
            <div className="bg-white border border-[#e5e7eb] rounded-md shadow-sm sticky top-6">
              <div
                className="px-6 py-4 border-b border-[#e5e7eb] rounded-t-md"
                style={{ backgroundColor: DB_BLUE }}
              >
                <div className="text-white font-semibold text-[15px]">
                  {t.verifyTitle}
                </div>
              </div>
              {/* Stage progress bar */}
              <div className="flex border-b border-[#e5e7eb] bg-[#fafbfc]">
                {(
                  [
                    { id: "scan", label: "1. Scan" },
                    { id: "review", label: "2. Review" },
                    { id: "success", label: "3. Done" },
                  ] as const
                ).map((s, i, arr) => {
                  const order = { scan: 0, review: 1, submitting: 1, success: 2 };
                  const currentIdx = order[stage];
                  const stepIdx = order[s.id as keyof typeof order];
                  const active = stepIdx === currentIdx;
                  const done = stepIdx < currentIdx;
                  return (
                    <div
                      key={s.id}
                      className={`flex-1 text-center py-2.5 text-[11px] uppercase tracking-wider font-semibold ${
                        active
                          ? "text-[#0018a8] border-b-2 border-[#0018a8] -mb-px"
                          : done
                          ? "text-[#0a8a3a]"
                          : "text-[#9ca3af]"
                      } ${i < arr.length - 1 ? "border-r border-[#e5e7eb]" : ""}`}
                    >
                      {s.label}
                    </div>
                  );
                })}
              </div>

              <div className="p-6">
                {stage === "scan" && (
                  <>
                    <p className="text-[14px] text-[#5a6a7a] leading-relaxed mb-6">
                      {t.verifyDesc}
                    </p>
                    <div className="wallet-connect-wrapper deutsche-bank">
                      <WalletConnectButton
                        clientId="nlw_70b7ace66124084377cbf564479f7d4e"
                        apiKey="3adf540970f1abaa32414d33525a3ab91de33241aa9b1835747054c66187dfff"
                        label={t.walletLabel}
                        lang={t.walletLang}
                        onSuccess={handleSuccess}
                      />
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#eef0f3] text-[12px] text-[#5a6a7a] leading-relaxed">
                      By continuing, you agree to share the requested
                      attributes with Deutsche Bank AG for the purpose of
                      customer identification under EU AML regulation.
                    </div>
                  </>
                )}

                {stage === "review" && attributes && (
                  <div>
                    <div className="mb-4">
                      <div className="font-semibold text-[#1a1a1a] text-[16px] mb-1">
                        {t.reviewTitle}
                      </div>
                      <p className="text-[13px] text-[#5a6a7a] leading-relaxed">
                        {t.reviewDesc}
                      </p>
                    </div>

                    {personalEntries.length > 0 && (
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-2 text-[11px] uppercase tracking-wider font-semibold text-[#0018a8]">
                          <User className="w-3.5 h-3.5" />
                          {t.personalSection}
                        </div>
                        <div className="border border-[#eef0f3] rounded-sm overflow-hidden">
                          <table className="w-full text-[13px] border-collapse">
                            <tbody>
                              {personalEntries.map(([key, value]) => (
                                <tr key={key} className="border-b border-[#eef0f3] last:border-b-0">
                                  <th className="text-left py-2 px-3 text-[#5a6a7a] font-semibold w-[45%] align-top bg-[#fafbfc]">
                                    {prettify(key)}
                                  </th>
                                  <td className="py-2 px-3 text-[#1a1a1a] align-top">
                                    {formatValue(value)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {legalEntries.length > 0 && (
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-2 text-[11px] uppercase tracking-wider font-semibold text-[#0018a8]">
                          <Building2 className="w-3.5 h-3.5" />
                          {t.legalSection}
                        </div>
                        <div className="border border-[#eef0f3] rounded-sm overflow-hidden">
                          <table className="w-full text-[13px] border-collapse">
                            <tbody>
                              {legalEntries.map(([key, value]) => (
                                <tr key={key} className="border-b border-[#eef0f3] last:border-b-0">
                                  <th className="text-left py-2 px-3 text-[#5a6a7a] font-semibold w-[45%] align-top bg-[#fafbfc]">
                                    {prettify(key)}
                                  </th>
                                  <td className="py-2 px-3 text-[#1a1a1a] align-top break-words">
                                    {formatValue(value)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleRestart}
                        className="flex items-center justify-center gap-1.5 px-4 py-3 text-[13px] font-semibold text-[#5a6a7a] border border-[#dde1e6] rounded-sm hover:bg-[#f0f2f5] transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {t.backBtn}
                      </button>
                      <button
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-white rounded-sm transition-all"
                        style={{
                          background:
                            "linear-gradient(135deg, #0020c8 0%, #0018a8 45%, #000d4d 100%)",
                          boxShadow: "0 6px 16px rgba(0, 24, 168, 0.28)",
                        }}
                      >
                        {t.submitBtn}
                      </button>
                    </div>
                  </div>
                )}

                {stage === "submitting" && (
                  <div className="py-10 flex flex-col items-center text-center">
                    <Loader2
                      className="w-10 h-10 animate-spin mb-4"
                      style={{ color: DB_BLUE }}
                    />
                    <div className="font-semibold text-[#1a1a1a] mb-1">
                      {t.submittingTitle}
                    </div>
                    <p className="text-[13px] text-[#5a6a7a]">
                      {t.submittingDesc}
                    </p>
                  </div>
                )}

                {stage === "success" && (
                  <div className="py-4 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-[#e6f7ec] flex items-center justify-center">
                        <CheckCircle2
                          className="w-10 h-10"
                          style={{ color: "#0a8a3a" }}
                        />
                      </div>
                    </div>
                    <div className="font-bold text-[#1a1a1a] text-[20px] mb-2">
                      {t.successTitle}
                    </div>
                    <p className="text-[13px] text-[#5a6a7a] leading-relaxed mb-5 max-w-[340px] mx-auto">
                      {t.successDesc}
                    </p>

                    <div className="bg-[#fafbfc] border border-[#eef0f3] rounded-sm p-4 mb-5 text-left">
                      <div className="text-[11px] uppercase tracking-wider text-[#5a6a7a] font-semibold mb-1">
                        {t.successReference}
                      </div>
                      <div className="font-mono text-[14px] font-bold text-[#0018a8]">
                        {reference}
                      </div>
                    </div>

                    <button
                      onClick={handleRestart}
                      className="w-full px-4 py-2.5 text-[12px] font-semibold text-[#5a6a7a] hover:text-[#0018a8] transition-colors"
                    >
                      {t.restartCta}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <style>{`
        @keyframes db-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes db-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(0, 24, 168, 0.45), 0 10px 24px rgba(0, 24, 168, 0.28); }
          70% { box-shadow: 0 0 0 14px rgba(0, 24, 168, 0), 0 10px 24px rgba(0, 24, 168, 0.28); }
          100% { box-shadow: 0 0 0 0 rgba(0, 24, 168, 0), 0 10px 24px rgba(0, 24, 168, 0.28); }
        }
        .wallet-connect-wrapper.deutsche-bank {
          display: flex;
          justify-content: center;
          width: 100%;
          padding: 4px;
        }
        .wallet-connect-wrapper.deutsche-bank nl-wallet-button {
          width: 100%;
          display: block;
        }
        .wallet-connect-wrapper.deutsche-bank nl-wallet-button::part(button) {
          position: relative;
          background: linear-gradient(135deg, #0020c8 0%, #0018a8 45%, #000d4d 100%);
          background-size: 200% 100%;
          border: 1px solid #0018a8;
          border-radius: 4px;
          padding: 18px 32px;
          width: 100%;
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
          box-shadow:
            0 10px 24px rgba(0, 24, 168, 0.28),
            0 2px 4px rgba(0, 24, 168, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.18);
          transition: transform 0.15s ease, box-shadow 0.25s ease, background-position 0.4s ease;
          cursor: pointer;
          animation: db-pulse-ring 2.4s ease-out infinite;
          overflow: hidden;
        }
        .wallet-connect-wrapper.deutsche-bank nl-wallet-button::part(button):hover {
          background-position: 100% 0;
          transform: translateY(-2px);
          box-shadow:
            0 16px 32px rgba(0, 24, 168, 0.38),
            0 4px 8px rgba(0, 24, 168, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.28);
          animation: none;
        }
        .wallet-connect-wrapper.deutsche-bank nl-wallet-button::part(button):active {
          transform: translateY(0);
          box-shadow:
            0 6px 14px rgba(0, 24, 168, 0.3),
            inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .wallet-connect-wrapper.deutsche-bank nl-wallet-button::part(button-span) {
          color: #ffffff;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 13px;
          letter-spacing: 1.2px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-white/70 text-[12px]">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
            <img
              src="/DBWM-logo.svg"
              alt="Deutsche Bank"
              className="h-8 w-auto opacity-90"
            />
            <div className="flex gap-5">
              <a href="#" className="hover:text-white">Imprint</a>
              <a href="#" className="hover:text-white">Privacy Notice</a>
              <a href="#" className="hover:text-white">Cookies</a>
              <a href="#" className="hover:text-white">Terms of Use</a>
            </div>
          </div>
          <p className="mt-5 max-w-[900px] leading-relaxed">
            {t.footerDisclaimer}
          </p>
          <p className="mt-3">{t.footerCopy}</p>
        </div>
      </footer>
    </div>
  );
};

export default DeutscheBankVerifierPage;
