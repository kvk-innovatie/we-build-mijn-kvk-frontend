import { useState } from "react";
import { Link } from "react-router-dom";
import WalletConnectButton from "wallet-connect-button-react";
import { ArrowLeft } from "lucide-react";

const translations = {
  nl: {
    subtitle: "Log in om aangifte omzetbelasting (BTW) te doen",
    walletLabel: "Deel gegevens met uw zakelijke wallet",
    walletLang: "nl" as const,
  },
  en: {
    subtitle: "Log in to file your VAT (BTW) return",
    walletLabel: "Share data with your business wallet",
    walletLang: "en" as const,
  },
};

type Lang = keyof typeof translations;

const BelastingdienstVerifierPage = () => {
  const [lang, setLang] = useState<Lang>("nl");
  const [attributes, setAttributes] = useState<Record<string, unknown> | null>(null);

  const t = translations[lang];

  const handleSuccess = (attrs: Record<string, unknown>) => {
    setAttributes(attrs);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col items-center px-5 py-8">
      {/* Back navigation */}
      <div className="w-full max-w-[460px] mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-[#1a3a5c] hover:underline text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-md p-10 max-w-[460px] w-full text-center relative">
        {/* Language switcher */}
        <div className="absolute top-4 right-4 flex gap-1.5">
          {(["nl", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`border rounded-md px-2.5 py-1 text-[13px] cursor-pointer transition-all ${
                lang === l
                  ? "bg-[#1a3a5c] text-white border-[#1a3a5c]"
                  : "bg-transparent text-[#5a6a7a] border-[#dde1e6] hover:bg-[#f0f2f5]"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Logo / Title */}
        <div className="text-[28px] font-bold text-[#1a3a5c] mb-2">
          Belastingdienst
        </div>
        <p className="text-[#5a6a7a] text-[15px] mb-8 leading-relaxed">
          {t.subtitle}
        </p>

        {/* Wallet button */}
        {!attributes && (
          <div className="wallet-connect-wrapper belastingdienst">
            <WalletConnectButton
              clientId="nlw_bd2f376caef0d76a21c177181a9d1d89"
              apiKey="1a3e81b556e7716d8c7643fba10b09e57e8d6dedb340ec0e164ee31ce90eb4d4"
              business
              label={t.walletLabel}
              lang={t.walletLang}
              onSuccess={handleSuccess}
            />
          </div>
        )}

        {/* Attributes table */}
        {attributes && (
          <div className="mt-6 text-left">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {Object.entries(attributes).map(([key, value]) => (
                  <tr key={key} className="border-b border-[#eef0f3]">
                    <th className="text-left py-2.5 px-3 text-[#5a6a7a] font-semibold w-[40%]">
                      {key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </th>
                    <td className="py-2.5 px-3 text-[#1a1a1a]">
                      {String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BelastingdienstVerifierPage;
