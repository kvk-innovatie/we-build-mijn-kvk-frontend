import { Link } from "react-router-dom";
import KVKHeader from "@/components/KVKHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CreditCard, Building2, ArrowLeft } from "lucide-react";

const issuers = [
  {
    title: "KVK",
    description: "Issue credentials from the Netherlands Chamber of Commerce",
    icon: Building2,
    path: "/issuers/kvk",
    color: "from-purple-500 to-orange-500",
    available: true,
  },
  {
    title: "Bank",
    description: "Obtain your bank account IBAN number",
    icon: CreditCard,
    path: "/issuers/bank",
    color: "from-green-500 to-yellow-400",
    available: true,
  },
  {
    title: "Tax Authority",
    description: "Get your VAT number",
    icon: FileText,
    path: "/issuers/tax-registration",
    color: "from-blue-800 to-blue-600",
    available: true,
  },
];

const IssuersOverview = () => {
  return (
    <div className="min-h-screen bg-background">
      <KVKHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center text-kvk-blue hover:underline mb-6 block">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-kvk-text-primary mb-4">
            Credential Issuance Portal
          </h1>
          <p className="text-xl text-kvk-text-secondary max-w-2xl mx-auto">
            Add verified credentials to your digital wallet from trusted issuers.
            Select a credential type below to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {issuers.map((issuer) => {
            const IconComponent = issuer.icon;
            return (
              <Link key={issuer.path} to={issuer.path} className="block">
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer h-full">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${issuer.color}`} />
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${issuer.color} text-white shadow-lg`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-xl">{issuer.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {issuer.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-kvk-text-secondary">
            All credentials are issued securely and stored in your digital wallet.
            <br />
            Your data remains under your control at all times.
          </p>
        </div>
      </main>
    </div>
  );
};

export default IssuersOverview;
