import { useNavigate } from "react-router-dom";
import WalletConnectButton from "wallet-connect-button-react";
import { useI18n } from "./i18n";
import { useCompany } from "./CompanyContext";
import { SiteHeader, SiteFooter } from "./components";
import { PATHS } from "./paths";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAttributes } = useCompany();
  const { lang, t } = useI18n();

  return (
    <>
      <SiteHeader activePage="vergunningen" />
      <main className="main-content" style={{ maxWidth: 560, margin: "40px auto", textAlign: "center" }}>
        <h1 className="page-title">{t("login.title")}</h1>
        <p style={{ marginBottom: 32, color: "var(--nij-gray-dark)" }}>{t("login.lead")}</p>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <WalletConnectButton
            key={lang}
            clientId="nlw_77d34f3864cc898c440c1a08a42409ca"
            apiKey="a7558d34673fd2d776910fbc07f6d61864e71e62bef4907d3f7be32340be26eb"
            business
            label={t("login.button")}
            lang={lang}
            onSuccess={(attrs: Record<string, unknown>) => {
              setAttributes(attrs);
              navigate(PATHS.application);
            }}
          />
        </div>
        <p style={{ color: "var(--nij-gray-dark)", fontSize: 14 }}>{t("login.hint")}</p>
      </main>
      <SiteFooter />
    </>
  );
};

export default LoginPage;
