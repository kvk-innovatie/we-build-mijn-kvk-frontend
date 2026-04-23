import { Link } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Wallet } from "lucide-react";
import VatIdIssuanceDialog from "@/components/VatIdIssuanceDialog";

const TaxRegistrationPage = () => {
  const [buttonKey] = useState(0);
  const handleWalletSuccess = (attributes: Record<string, unknown>) => {
    console.log("VAT ID wallet transaction successful:", attributes);
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Belastingdienst header - clean white style */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#154273]">Belastingdienst</h1>
            <Link to="/issuers">
              <Button variant="outline" className="border-[#154273] text-[#154273] hover:bg-[#154273] hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to overview
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Blue accent line */}
      <div className="h-1 bg-[#154273]" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#154273] shadow-lg mb-6">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-[#154273] mb-4">
            VAT Number Credential
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Receive your VAT number as a verifiable credential in your wallet
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-white shadow-lg border border-gray-200 overflow-hidden">
          <div className="h-1 bg-[#154273]" />
          
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-[#154273]" />
              <CardTitle className="text-2xl text-[#154273]">
                VAT Registration
              </CardTitle>
            </div>
            <CardDescription className="text-base">
              Your official VAT number from the Belastingdienst
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 px-8 pb-8">
            {/* Wallet Connect Button */}
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-gray-600">
                Click below to add this credential to your personal or business wallet
              </p>
              <VatIdIssuanceDialog
                buttonKey={buttonKey}
                onWalletSuccess={handleWalletSuccess}
                trigger={
                  <Button className="bg-[#154273] hover:bg-[#154273]/90 text-white font-medium gap-2">
                    <Wallet className="w-4 h-4" />
                    Receive VAT ID
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By using this service, you agree to share your tax registration details 
            with your digital wallet provider.
          </p>
        </div>
      </main>

      <style>{`
        .wallet-connect-wrapper.tax nl-wallet-button::part(button) {
          background: #154273;
          border-radius: 6px;
          padding: 16px 32px;
          margin: 4px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          box-shadow: 0 2px 8px rgba(21, 66, 115, 0.2);
          transition: all 0.3s ease;
        }
        .wallet-connect-wrapper.tax nl-wallet-button::part(button):hover {
          background: #1e5a9e;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(21, 66, 115, 0.3);
        }
        .wallet-connect-wrapper.tax nl-wallet-button::part(button-span) {
          font-weight: 600;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default TaxRegistrationPage;
