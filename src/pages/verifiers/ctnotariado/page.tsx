import { useEffect, useMemo, useState, type ReactElement } from "react";
import { Link } from "react-router-dom";
import WalletConnectButton from "wallet-connect-button-react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Lock,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  Loader2,
  User,
  Video,
  VideoOff,
  Wallet,
} from "lucide-react";
import { downloadPurchaseContract, type PurchaseContractData } from "@/lib/purchaseContractPdf";

// CTNotariado brand palette (pulled from the live ctnotariado.com theme).
const NAVY = "#0D1F61";
const NAVY_DARK = "#091644";
const MID_NAVY = "#354376";
const AMBER = "#F6A016";
const AMBER_DARK = "#C58012";
const AMBER_LT = "#FEF5E5";
const BG = "#F3F4F7";
const BORDER = "#C8CCDA";
const MUTED = "#7B84A7";
const TEXT = "#272833";

const NOTARY_NAME = "Martí";
const NOTARY_TITLE = "Notari · Il·lustre Col·legi de Notaris de Catalunya";

type Stage = "login" | "share-business" | "review" | "call" | "validating" | "complete";

const PROCESS_STEPS: { key: Stage; label: string; icon: typeof Building2 }[] = [
  { key: "share-business", label: "Business data", icon: Building2 },
  { key: "call", label: "Notary call", icon: Video },
  { key: "validating", label: "Validation", icon: ShieldCheck },
  { key: "complete", label: "Purchase contract", icon: FileText },
];

const NAV_ITEMS = [
  "Inicio",
  "Sobre nosotros",
  "Soluciones tecnológicas",
  "Prestación de servicios de confianza",
  "Actualidad",
];

const pickString = (
  attrs: Record<string, unknown> | null,
  keys: string[],
  fallback: string,
): string => {
  if (attrs) {
    for (const key of keys) {
      const value = attrs[key];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return fallback;
};

const prettifyKey = (key: string) =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_.]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const formatPrimitive = (value: unknown): string => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

// A value counts as "empty" (and is hidden) when it is null/undefined, a blank
// string, or an array/object whose entries are all themselves empty.
const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.every(isEmptyValue);
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).every(isEmptyValue);
  }
  return false;
};

// Recursively render an attribute value: primitives inline, objects as a
// labelled list, arrays of objects as stacked cards — skipping every empty field.
const AttributeValue = ({ value }: { value: unknown }): ReactElement | null => {
  if (Array.isArray(value)) {
    const items = value.filter((v) => !isEmptyValue(v));
    if (items.length === 0) return null;
    const allPrimitive = items.every((v) => v === null || typeof v !== "object");
    if (allPrimitive) {
      return <span>{items.map((v) => formatPrimitive(v)).join(", ")}</span>;
    }
    return (
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-md border px-3 py-2"
            style={{ borderColor: BORDER, background: BG }}
          >
            <AttributeValue value={item} />
          </div>
        ))}
      </div>
    );
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, v]) => !isEmptyValue(v),
    );
    if (entries.length === 0) return null;
    return (
      <div className="space-y-1">
        {entries.map(([k, v]) => {
          const nested = v !== null && typeof v === "object";
          return (
            <div key={k} className={nested ? "" : "flex flex-wrap gap-x-1.5"}>
              <span className="font-semibold" style={{ color: MID_NAVY }}>
                {prettifyKey(k)}:
              </span>
              {nested ? (
                <div className="mt-1 ml-3">
                  <AttributeValue value={v} />
                </div>
              ) : (
                <span style={{ color: TEXT }}>{formatPrimitive(v)}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return <span>{formatPrimitive(value)}</span>;
};

const AttributeList = ({
  title,
  icon: Icon,
  attrs,
}: {
  title: string;
  icon: typeof Building2;
  attrs: Record<string, unknown> | null;
}) => {
  const entries = attrs
    ? Object.entries(attrs).filter(([, v]) => !isEmptyValue(v))
    : [];
  return (
    <div>
      <div
        className="flex items-center gap-2 mb-2 text-[12px] uppercase tracking-wider font-semibold"
        style={{ color: NAVY }}
      >
        <Icon className="w-4 h-4" />
        {title}
      </div>
      <div className="border rounded-lg overflow-hidden" style={{ borderColor: BORDER }}>
        {entries.length === 0 ? (
          <div className="px-4 py-3 text-[13px]" style={{ color: MUTED }}>
            No attributes received.
          </div>
        ) : (
          <table className="w-full text-[13px] border-collapse">
            <tbody>
              {entries.map(([key, value]) => (
                <tr key={key} className="border-b last:border-b-0" style={{ borderColor: BORDER }}>
                  <th
                    className="text-left py-2.5 px-4 font-semibold w-[45%] align-top"
                    style={{ color: MID_NAVY, background: BG }}
                  >
                    {prettifyKey(key)}
                  </th>
                  <td className="py-2.5 px-4 align-top break-words" style={{ color: TEXT }}>
                    <AttributeValue value={value} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const Wordmark = ({ light = false }: { light?: boolean }) => (
  <div className="flex items-center gap-2 leading-none">
    <span
      className="inline-flex items-center justify-center rounded-md font-bold text-white"
      style={{ backgroundColor: AMBER, width: 34, height: 34, fontSize: 15 }}
    >
      CT
    </span>
    <span className="text-[19px] font-bold tracking-tight" style={{ color: light ? "#fff" : NAVY }}>
      CT<span style={{ color: light ? "#fff" : NAVY, fontWeight: 600 }}>Notariado</span>
    </span>
  </div>
);

const CTNotariadoVerifierPage = () => {
  const [stage, setStage] = useState<Stage>("login");
  const [loginAttributes, setLoginAttributes] = useState<Record<string, unknown> | null>(null);
  const [businessAttributes, setBusinessAttributes] = useState<Record<string, unknown> | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [validated, setValidated] = useState(false);
  const [contractReceived, setContractReceived] = useState(false);

  // Live call timer while the notary call screen is on-screen.
  useEffect(() => {
    if (stage !== "call") return;
    const id = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [stage]);

  // Simulate the notary validating the shared information.
  useEffect(() => {
    if (stage !== "validating") return;
    setValidated(false);
    const id = setTimeout(() => setValidated(true), 2600);
    return () => clearTimeout(id);
  }, [stage]);

  const contractData: PurchaseContractData = useMemo(() => {
    const buyerName = pickString(
      businessAttributes,
      ["legal_entity_name", "legal_person_name", "legalName", "company_name"],
      "Krusty Krab B.V.",
    );
    const buyerId = pickString(
      businessAttributes,
      ["legal_entity_id", "legal_person_id", "legalId", "identifier"],
      "NLNHR.90001356",
    );
    const contractNumber =
      "CTN-2026-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const date = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return {
      contractNumber,
      date,
      notary: NOTARY_NAME,
      buyerName,
      buyerId,
      sellerName: "Bikini Bottom Holdings B.V.",
      sellerId: "NLNHR.12345678",
      propertyDescription: "Commercial premises — retail unit (NACE 47.78)",
      propertyAddress: "Bikini Bottom 3, 3511 AH Utrecht, Netherlands",
      price: "EUR 450,000.00",
    };
    // buyer identity is drawn from the shared business credential
  }, [businessAttributes]);

  const handleLoginSuccess = (attrs: Record<string, unknown>) => {
    setLoginAttributes(attrs);
    setStage("share-business");
  };

  const handleBusinessSuccess = (attrs: Record<string, unknown>) => {
    setBusinessAttributes(attrs);
    setStage("review");
  };

  const stepStage = stage === "review" ? "share-business" : stage;
  const currentStepIndex = PROCESS_STEPS.findIndex((s) => s.key === stepStage);
  const callTime = `${String(Math.floor(callSeconds / 60)).padStart(2, "0")}:${String(
    callSeconds % 60,
  ).padStart(2, "0")}`;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: BG, color: TEXT, fontFamily: "'Open Sans', system-ui, sans-serif" }}
    >
      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: BORDER }}>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="shrink-0">
            <Wordmark />
          </Link>
          <nav className="hidden xl:flex items-center gap-6 text-[13px] font-semibold" style={{ color: MID_NAVY }}>
            {NAV_ITEMS.map((item) => (
              <a key={item} href="#" className="hover:text-[#F6A016] transition-colors">
                {item}
              </a>
            ))}
          </nav>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2 rounded-md transition-colors"
            style={{ color: NAVY }}
          >
            <ArrowLeft className="w-4 h-4" />
            Overview
          </Link>
        </div>
      </header>

      {stage === "login" ? (
        /* ---------------- LOGIN VIEW ---------------- */
        <>
          <section style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)` }}>
            <div className="max-w-[1200px] mx-auto px-6 py-14 text-white">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-wider mb-4"
                style={{ backgroundColor: "rgba(246,160,22,0.15)", border: "1px solid rgba(246,160,22,0.4)", color: AMBER }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Portal Notarial · eIDAS 2.0
              </div>
              <h1 className="text-[34px] md:text-[44px] font-bold leading-tight max-w-[760px]">
                Signa la teva escriptura de compravenda en línia
              </h1>
              <p className="text-[16px] text-white/80 mt-4 max-w-[680px] leading-relaxed">
                Innovación y tecnología al servicio del Notariado. Identify yourself with your
                wallet to start a fully digital notarial purchase process.
              </p>
            </div>
          </section>

          <main className="flex-1">
            <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10">
              {/* Left: how it works */}
              <div>
                <h2 className="text-[22px] font-bold mb-6" style={{ color: NAVY }}>
                  How the digital deed works
                </h2>
                <ol className="space-y-5">
                  {[
                    {
                      title: "Identify with your wallet",
                      desc: "Log in securely by sharing verified data from your personal wallet.",
                    },
                    {
                      title: "Share your business credentials",
                      desc: "Provide your company data from your business wallet so the notary can prepare the deed.",
                    },
                    {
                      title: "Meet the notary online",
                      desc: "Hold a secure video call with the officiating notary to review and confirm the purchase.",
                    },
                    {
                      title: "Receive your Purchase Contract",
                      desc: "Once validated, receive the signed contract in your business wallet or download it as a PDF.",
                    },
                  ].map((s, i) => (
                    <li key={i} className="bg-white border rounded-lg p-5 flex gap-4" style={{ borderColor: BORDER }}>
                      <div
                        className="flex-shrink-0 w-9 h-9 rounded-full text-white font-bold flex items-center justify-center"
                        style={{ backgroundColor: NAVY }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-semibold mb-1" style={{ color: NAVY }}>
                          {s.title}
                        </div>
                        <p className="text-[14px] leading-relaxed" style={{ color: MUTED }}>
                          {s.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-8 bg-white border rounded-lg p-5" style={{ borderColor: BORDER }}>
                  <div className="text-[12px] font-semibold mb-3 uppercase tracking-wider" style={{ color: NAVY }}>
                    Secure &amp; certified
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { icon: ShieldCheck, label: "ISO 27001 certified" },
                      { icon: Lock, label: "End-to-end encrypted" },
                      { icon: Clock, label: "Fully remote" },
                    ].map(({ icon: Icon, label }, i) => (
                      <div key={i} className="flex items-center gap-2 text-[13px]" style={{ color: MUTED }}>
                        <Icon className="w-4 h-4" style={{ color: AMBER_DARK }} />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: login card */}
              <aside>
                <div className="bg-white border rounded-lg shadow-sm sticky top-6 overflow-hidden" style={{ borderColor: BORDER }}>
                  <div className="px-6 py-4" style={{ backgroundColor: NAVY }}>
                    <div className="text-white font-semibold text-[15px]">Access the notarial portal</div>
                  </div>
                  <div className="p-6">
                    <p className="text-[14px] leading-relaxed mb-6" style={{ color: MUTED }}>
                      Log in with your wallet to begin. You stay in control of exactly which
                      attributes you share.
                    </p>
                    <div className="wallet-connect-wrapper ctn amber flex justify-center">
                      <WalletConnectButton
                        clientId="nlw_acdc36f5539f802f2415a77e29435e97"
                        apiKey="764a865d4df8151acf610796c7ae5a5246b9d67a1b66fcac8f83a3f75e28a1d6"
                        label="Login with your personal wallet"
                        lang="en"
                        onSuccess={handleLoginSuccess}
                      />
                    </div>
                    <div className="mt-6 pt-4 border-t text-[12px] leading-relaxed" style={{ borderColor: BORDER, color: MUTED }}>
                      By continuing you agree to share the requested attributes with the Centre
                      Tecnològic del Notariat for identification purposes.
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </main>
        </>
      ) : (
        /* ---------------- PROCESS VIEW ---------------- */
        <main className="flex-1">
          <div className="max-w-[900px] mx-auto px-6 py-10">
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider" style={{ color: AMBER_DARK }}>
              Notarial purchase deed
            </div>
            <h1 className="text-[26px] md:text-[30px] font-bold mb-8" style={{ color: NAVY }}>
              Escriptura de compravenda
            </h1>

            {/* Stepper */}
            <div className="flex items-center mb-10">
              {PROCESS_STEPS.map((step, i) => {
                const Icon = step.icon;
                const active = i === currentStepIndex;
                const done = i < currentStepIndex;
                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors"
                        style={{
                          backgroundColor: done ? NAVY : active ? AMBER : "#fff",
                          borderColor: done ? NAVY : active ? AMBER : BORDER,
                          color: done || active ? "#fff" : MUTED,
                        }}
                      >
                        {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <div
                        className="mt-2 text-[11px] font-semibold max-w-[90px] leading-tight"
                        style={{ color: active ? NAVY : done ? MID_NAVY : MUTED }}
                      >
                        {step.label}
                      </div>
                    </div>
                    {i < PROCESS_STEPS.length - 1 && (
                      <div className="flex-1 h-[2px] mx-2 mb-5" style={{ backgroundColor: done ? NAVY : BORDER }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step content card */}
            <div className="bg-white border rounded-xl shadow-sm" style={{ borderColor: BORDER }}>
              {/* Step 1 — business wallet data */}
              {stage === "share-business" && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-6 h-6" style={{ color: NAVY }} />
                    <h2 className="text-[20px] font-bold" style={{ color: NAVY }}>
                      Share your business data
                    </h2>
                  </div>
                  <p className="text-[14px] leading-relaxed mb-6" style={{ color: MUTED }}>
                    Provide the company credentials from your business wallet. The notary needs these
                    verified details to draft your purchase contract.
                  </p>
                  <div
                    className="rounded-lg border p-6 flex flex-col items-center gap-4"
                    style={{ borderColor: BORDER, background: AMBER_LT }}
                  >
                    <div className="wallet-connect-wrapper ctn navy w-full max-w-[420px] flex justify-center">
                      <WalletConnectButton
                        clientId="nlw_4a6e83e81665490fe9bcdb6c151cd23d"
                        apiKey="d8f908e75048b8737a88611e8bbe60551e63d2790636071fdf6db40366f70939"
                        business
                        label="Share data with your business wallet"
                        lang="en"
                        onSuccess={handleBusinessSuccess}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1b — review shared data before the notary call */}
              {stage === "review" && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="w-6 h-6" style={{ color: NAVY }} />
                    <h2 className="text-[20px] font-bold" style={{ color: NAVY }}>
                      Review the data you will share
                    </h2>
                  </div>
                  <p className="text-[14px] leading-relaxed mb-6" style={{ color: MUTED }}>
                    You are about to share all of this data with the notary. Please review it
                    before continuing to your call.
                  </p>
                  <div className="space-y-6">
                    <AttributeList title="Personal wallet" icon={User} attrs={loginAttributes} />
                    <AttributeList title="Business wallet" icon={Building2} attrs={businessAttributes} />
                  </div>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setStage("share-business")}
                      className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold border transition-colors"
                      style={{ borderColor: BORDER, color: MID_NAVY }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={() => {
                        setCallSeconds(0);
                        setStage("call");
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold text-white transition-transform hover:-translate-y-0.5"
                      style={{ backgroundColor: NAVY, boxShadow: "0 6px 16px rgba(13,31,97,0.28)" }}
                    >
                      Confirm &amp; share with the notary
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 — notary video call */}
              {stage === "call" && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <Video className="w-6 h-6" style={{ color: NAVY }} />
                    <h2 className="text-[20px] font-bold" style={{ color: NAVY }}>
                      Call with the notary
                    </h2>
                  </div>
                  <p className="text-[14px] leading-relaxed mb-6" style={{ color: MUTED }}>
                    You are now in a secure video session with the officiating notary to review and
                    confirm the purchase. When you have finished, confirm below.
                  </p>

                  {/* Video call surface */}
                  <div
                    className="relative rounded-xl overflow-hidden"
                    style={{ background: `radial-gradient(120% 120% at 50% 0%, ${MID_NAVY} 0%, ${NAVY_DARK} 70%)`, minHeight: 340 }}
                  >
                    {/* top bar */}
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white bg-red-600/90 rounded px-2 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
                        </span>
                        <span className="text-white/80 text-[12px] font-mono">{callTime}</span>
                      </div>
                      <span className="text-white/70 text-[12px]">Encrypted · CTN Secure Meet</span>
                    </div>

                    {/* notary "video" */}
                    <div className="flex flex-col items-center justify-center h-full py-14">
                      <div
                        className="w-28 h-28 rounded-full flex items-center justify-center text-white text-[34px] font-bold shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${AMBER} 0%, ${AMBER_DARK} 100%)` }}
                      >
                        M
                      </div>
                      <div className="mt-4 text-white font-semibold text-[16px]">{NOTARY_NAME}</div>
                      <div className="text-white/60 text-[12px] mt-0.5">{NOTARY_TITLE}</div>
                    </div>

                    {/* self PiP */}
                    <div
                      className="absolute bottom-20 right-4 w-28 h-20 rounded-lg border border-white/20 flex items-center justify-center text-white/70 text-[11px]"
                      style={{ background: "rgba(0,0,0,0.45)" }}
                    >
                      {camOn ? "You" : <VideoOff className="w-5 h-5" />}
                    </div>

                    {/* controls */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 py-4" style={{ background: "linear-gradient(0deg, rgba(9,22,68,0.85), transparent)" }}>
                      <button
                        onClick={() => setMicOn((v) => !v)}
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-colors"
                        style={{ background: micOn ? "rgba(255,255,255,0.15)" : "#dc2626" }}
                        aria-label="Toggle microphone"
                      >
                        {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => setCamOn((v) => !v)}
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-colors"
                        style={{ background: camOn ? "rgba(255,255,255,0.15)" : "#dc2626" }}
                        aria-label="Toggle camera"
                      >
                        {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => setStage("validating")}
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white bg-red-600 hover:bg-red-700 transition-colors"
                        aria-label="End call"
                      >
                        <PhoneOff className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setStage("validating")}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold text-white transition-transform hover:-translate-y-0.5"
                    style={{ backgroundColor: NAVY, boxShadow: "0 6px 16px rgba(13,31,97,0.28)" }}
                  >
                    We had the call
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Step 3 — validation */}
              {stage === "validating" && (
                <div className="p-10 flex flex-col items-center text-center">
                  {!validated ? (
                    <>
                      <Loader2 className="w-14 h-14 animate-spin mb-5" style={{ color: NAVY }} />
                      <h2 className="text-[20px] font-bold mb-2" style={{ color: NAVY }}>
                        The notary is validating all information
                      </h2>
                      <p className="text-[14px] leading-relaxed max-w-[440px]" style={{ color: MUTED }}>
                        Please wait while {NOTARY_NAME} reviews your identity, your business
                        credentials and the terms of the purchase.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "#e6f7ec" }}>
                        <CheckCircle2 className="w-10 h-10" style={{ color: "#0a8a3a" }} />
                      </div>
                      <h2 className="text-[20px] font-bold mb-2" style={{ color: NAVY }}>
                        The notary has validated all information
                      </h2>
                      <p className="text-[14px] leading-relaxed max-w-[440px] mb-6" style={{ color: MUTED }}>
                        Your identity and business data have been verified and the purchase has been
                        approved. You can now proceed to receive your Purchase Contract.
                      </p>
                      <button
                        onClick={() => setStage("complete")}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold text-white transition-transform hover:-translate-y-0.5"
                        style={{ backgroundColor: NAVY, boxShadow: "0 6px 16px rgba(13,31,97,0.28)" }}
                      >
                        Continue to receive your contract
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Step 4 — completion */}
              {stage === "complete" && (
                <div className="p-8">
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#e6f7ec" }}>
                      <CheckCircle2 className="w-10 h-10" style={{ color: "#0a8a3a" }} />
                    </div>
                    <h2 className="text-[22px] font-bold mb-2" style={{ color: NAVY }}>
                      Process completed
                    </h2>
                    <p className="text-[14px] leading-relaxed max-w-[480px]" style={{ color: MUTED }}>
                      The notarial purchase deed has been executed. You can now receive your Purchase
                      Contract in your business wallet or download it as a PDF.
                    </p>
                    <div
                      className="mt-4 text-[12px] font-mono px-3 py-1.5 rounded"
                      style={{ background: AMBER_LT, color: AMBER_DARK }}
                    >
                      Contract no. {contractData.contractNumber}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Option A: receive in business wallet */}
                    <div className="border rounded-xl p-6 flex flex-col" style={{ borderColor: BORDER, background: AMBER_LT }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-5 h-5" style={{ color: NAVY }} />
                        <h3 className="font-bold text-[15px]" style={{ color: NAVY }}>
                          Receive in business wallet
                        </h3>
                      </div>
                      <p className="text-[13px] leading-relaxed mb-5 flex-1" style={{ color: MUTED }}>
                        Add the signed Purchase Contract as a verifiable credential to your business
                        wallet.
                      </p>
                      {contractReceived ? (
                        <div className="flex items-center gap-2 text-[14px] font-semibold" style={{ color: "#0a8a3a" }}>
                          <CheckCircle2 className="w-5 h-5" />
                          Added to your business wallet
                        </div>
                      ) : (
                        <div className="wallet-connect-wrapper ctn navy w-full flex justify-center">
                          <WalletConnectButton
                            issuance
                            label="Add Purchase Contract to your business wallet"
                            clientId="nlw_9ac84aa85c90a1b2639371b4cf432da6"
                            business
                            helpBaseUrl="https://example.com/"
                            lang="en"
                            onSuccess={() => setContractReceived(true)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Option B: download PDF */}
                    <div className="border rounded-xl p-6 flex flex-col" style={{ borderColor: BORDER }}>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5" style={{ color: NAVY }} />
                        <h3 className="font-bold text-[15px]" style={{ color: NAVY }}>
                          Download the contract
                        </h3>
                      </div>
                      <p className="text-[13px] leading-relaxed mb-5 flex-1" style={{ color: MUTED }}>
                        Download the full Purchase Contract as a PDF document for your own records.
                      </p>
                      <button
                        onClick={() => downloadPurchaseContract(contractData)}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-bold text-white transition-transform hover:-translate-y-0.5"
                        style={{ backgroundColor: AMBER, color: NAVY, boxShadow: "0 6px 16px rgba(246,160,22,0.30)" }}
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: NAVY_DARK }} className="text-white/70 text-[12px] mt-auto">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-8">
            <div>
              <Wordmark light />
              <p className="mt-3 max-w-[320px] leading-relaxed text-white/60">
                Centre Tecnològic del Notariat — Innovación y tecnología al servicio del Notariado.
              </p>
            </div>
            <div>
              <div className="text-white font-semibold mb-2">Madrid</div>
              <p className="leading-relaxed text-white/60">
                Paseo del General Martínez Campos, 46
                <br />
                28010 Madrid
              </p>
            </div>
            <div>
              <div className="text-white font-semibold mb-2">Barcelona</div>
              <p className="leading-relaxed text-white/60">
                Joan Miró, 19-21
                <br />
                08005 Barcelona
              </p>
            </div>
          </div>
          <div className="mt-8 pt-5 border-t border-white/10 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex gap-5">
              <a href="#" className="hover:text-white">Política de privacidad</a>
              <a href="#" className="hover:text-white">Política de cookies</a>
            </div>
            <p>© 2026 CTNotariado. Todos los derechos reservados</p>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap');
        .wallet-connect-wrapper.ctn nl-wallet-button::part(button) {
          border-radius: 6px;
          padding: 14px 24px;
          margin: 4px 0;
          border: none;
          width: 100%;
          font-family: 'Open Sans', system-ui, sans-serif;
          font-size: 15px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }
        .wallet-connect-wrapper.ctn nl-wallet-button::part(button-span) {
          font-weight: 700;
        }
        .wallet-connect-wrapper.ctn nl-wallet-button::part(button):hover {
          transform: translateY(-1px);
          filter: brightness(1.03);
        }
        .wallet-connect-wrapper.ctn.amber nl-wallet-button::part(button) {
          background: ${AMBER};
          color: ${NAVY};
          box-shadow: 0 6px 16px rgba(246, 160, 22, 0.30);
        }
        .wallet-connect-wrapper.ctn.amber nl-wallet-button::part(button-span) {
          color: ${NAVY};
        }
        .wallet-connect-wrapper.ctn.navy nl-wallet-button::part(button) {
          background: ${NAVY};
          color: #ffffff;
          box-shadow: 0 6px 16px rgba(13, 31, 97, 0.28);
        }
        .wallet-connect-wrapper.ctn.navy nl-wallet-button::part(button-span) {
          color: #ffffff;
        }
      `}</style>
    </div>
  );
};

export default CTNotariadoVerifierPage;
