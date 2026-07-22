import "../fictiveco/wallet-polyfill";
import "./fictive-municipality.css";
import { Route, Routes } from "react-router-dom";
import { I18nProvider } from "./i18n";
import { CompanyProvider } from "./CompanyContext";
import MunicipalityHomePage from "./MunicipalityHomePage";
import ProductPage from "./ProductPage";
import LoginPage from "./LoginPage";
import ApplicationPage from "./ApplicationPage";
import ConfirmationPage from "./ConfirmationPage";
import AdminPage from "./AdminPage";

const FictiveMunicipalityPage = () => (
  <div className="fictive-municipality-scope">
    <I18nProvider>
      <CompanyProvider>
        <Routes>
          <Route path="/" element={<MunicipalityHomePage />} />
          <Route path="/market-stall-permit" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/application" element={<ApplicationPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </CompanyProvider>
    </I18nProvider>
  </div>
);

export default FictiveMunicipalityPage;
