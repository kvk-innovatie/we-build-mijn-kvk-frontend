import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import WalletConnectButton from "wallet-connect-button-react";

const BankIssuancePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#004D40] to-[#00352C]">
      {/* ABN AMRO header */}
      <header className="bg-[#004D40]/80 backdrop-blur-sm border-b border-[#FFD54F]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFD54F] rounded-lg flex items-center justify-center">
                <span className="text-[#004D40] font-bold text-lg">AB</span>
              </div>
              <h1 className="text-2xl font-bold text-white">ABN AMRO</h1>
            </div>
            <Link to="/issuers">
              <Button 
                variant="ghost" 
                className="text-white/90 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to overview
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Yellow accent line */}
      <div className="h-1 bg-gradient-to-r from-[#FFD54F] via-[#FFECB3] to-[#FFD54F]" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FFD54F] shadow-xl shadow-[#FFD54F]/20 mb-6">
            <CreditCard className="w-10 h-10 text-[#004D40]" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Bank IBAN Credential
          </h2>
          <p className="text-xl text-[#A5D6A7] max-w-2xl mx-auto">
            Receive your IBAN number as a verifiable credential in your wallet
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-gradient-to-b from-white to-[#F5F5F5] shadow-2xl border-0 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#004D40] via-[#00695C] to-[#004D40]" />
          
          <CardHeader className="text-center pb-2 pt-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CreditCard className="w-6 h-6 text-[#004D40]" />
              <CardTitle className="text-2xl text-[#004D40]">
                IBAN Registration
              </CardTitle>
            </div>
            <CardDescription className="text-base text-gray-600">
              Your official IBAN number from ABN AMRO
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 px-8 pb-10">
            {/* Wallet Connect Button */}
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-gray-500">
                Click below to add this credential to your business wallet
              </p>
              <div className="wallet-connect-wrapper bank">
                <WalletConnectButton
                  issuance
                  label="Add IBAN to Business Wallet"
                  clientId="nlw_fb684e48449d241c0e2957ce34a32e80"
                  business
                  helpBaseUrl="https://example.com/"
                  lang="en"
                  onSuccess={() => {}}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="mt-10 text-center">
          <p className="text-sm text-[#A5D6A7]/80">
            By using this service, you agree to share your bank account details 
            with your digital wallet provider.
          </p>
        </div>
      </main>

      <style>{`
        .wallet-connect-wrapper.bank nl-wallet-button::part(button) {
          background: linear-gradient(135deg, #004D40 0%, #00695C 100%);
          border-radius: 10px;
          padding: 16px 36px;
          margin: 4px;
          font-size: 16px;
          font-weight: 600;
          border: 2px solid #FFD54F;
          box-shadow: 0 4px 14px rgba(0, 77, 64, 0.4);
          transition: all 0.3s ease;
        }
        .wallet-connect-wrapper.bank nl-wallet-button::part(button):hover {
          background: linear-gradient(135deg, #00695C 0%, #00897B 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 77, 64, 0.5);
        }
        .wallet-connect-wrapper.bank nl-wallet-button::part(button-span) {
          font-weight: 600;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default BankIssuancePage;
