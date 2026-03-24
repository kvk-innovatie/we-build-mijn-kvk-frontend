import { useState } from "react";
import { Bell, Home, Activity, CreditCard, RefreshCw, MapPin, Settings, ShoppingCart, FileText, ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import VerificationDialog from "./VerificationDialog";

const GooglePlayConsole = () => {
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  const handleGetStartedClick = () => {
    console.log("Get started button clicked");
    console.log("Current dialog state:", verificationDialogOpen);
    setVerificationDialogOpen(true);
    console.log("Dialog should now be open");
  };

  const handleVerificationSubmitted = () => {
    setVerificationSubmitted(true);
    setVerificationDialogOpen(false);
  };

  const menuItems = [
    { icon: Home, label: "Home", active: true },
    { icon: Activity, label: "Activity" },
    { icon: CreditCard, label: "Payment methods" },
    { icon: RefreshCw, label: "Subscriptions & services" },
    { icon: MapPin, label: "Addresses" },
    { icon: Settings, label: "Settings" },
    { icon: ShoppingCart, label: "Customer orders" },
    { icon: FileText, label: "Sales tax" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xl font-normal text-red-600">FictiveCo</span>
            <span className="text-xl font-normal text-gray-700 ml-1">Portal</span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </Button>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-white">W</span>
            </div>
          </div>
        </div>

        {/* Horizontal Menu */}
        <nav className="border-t border-gray-200">
          <div className="flex justify-center px-6">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b-2 ${
                  item.active
                    ? "border-google-blue text-google-blue font-medium"
                    : "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </header>

      <div className="flex justify-center">
        {/* Main Content */}
        <main className="w-full max-w-4xl p-8">
          {/* Profile Section */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h1 className="text-2xl font-normal text-gray-900">Witbaard</h1>
              <p className="text-sm text-gray-600"> • Account ID: 4232592605503000338</p>
            </div>
          </div>

          {/* Payment Threshold Card */}
          <Card className={`border-l-4 bg-white p-6 ${verificationSubmitted ? "border-l-green-500" : "border-l-google-border-accent"}`}>
            {verificationSubmitted ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-normal text-green-700">
                        Verification successful
                      </h2>
                      <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        Auto-approved
                      </span>
                    </div>
                    <p className="text-gray-700">
                      Only verified identity and organisation data was shared, so no further review is needed and payments are now enabled.
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm text-green-800 space-y-2">
                  <p className="font-medium">What to know</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your wallet data is trusted and accepted automatically.</li>
                    <li>Payments unlock instantly.</li>
                  </ul>
                </div>

              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-normal text-google-blue mb-2">
                    You have reached the threshold of earnings to get paid
                  </h2>
                  <p className="text-gray-600">
                    Your earnings have reached the €3,000 threshold for payment. To receive your payments, you need to verify your identity and organization documents to comply with our payment policies and regulatory requirements.
                  </p>
                </div>

                <div className="flex items-start gap-4 py-4">
                  <ArrowRight className="w-5 h-5 text-google-blue mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-google-blue mb-2">
                      Verify your identity and organisation
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload official documents to verify your identity and organization details. This process ensures secure payments and compliance with financial regulations. The verification process may take a few days.
                    </p>
                    <Button
                      className="bg-google-blue hover:bg-google-blue-hover text-white"
                      onClick={handleGetStartedClick}
                    >
                      Get started
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>

      <VerificationDialog
        open={verificationDialogOpen}
        onOpenChange={(open) => {
          console.log("Dialog onOpenChange called with:", open);
          setVerificationDialogOpen(open);
        }}
        onSubmitSuccess={handleVerificationSubmitted}
      />
    </div>
  );
};

export default GooglePlayConsole;
