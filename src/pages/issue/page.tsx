import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CreditCard } from "lucide-react";

const issuers = [
  {
    title: "Bank IBAN",
    description: "Obtain your bank account IBAN number for your business wallet",
    icon: CreditCard,
    path: "/issue/bank",
    color: "from-green-500 to-yellow-400",
    available: true,
  },
  {
    title: "Tax Registration",
    description: "Get your VAT number from the Belastingdienst",
    icon: FileText,
    path: "/issue/tax-registration",
    color: "from-blue-800 to-blue-600",
    available: true,
  },
];

const IssueOverview = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Credential Issuance Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Add verified credentials to your digital wallet from trusted issuers. 
            Select a credential type below to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {issuers.map((issuer) => {
            const IconComponent = issuer.icon;
            return (
              <Link key={issuer.path} to={issuer.path} className="block">
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer">
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
          <p className="text-sm text-gray-500">
            All credentials are issued securely and stored in your digital wallet.
            <br />
            Your data remains under your control at all times.
          </p>
        </div>
      </main>
    </div>
  );
};

export default IssueOverview;
