import { Link } from "react-router-dom";
import KVKHeader from "@/components/KVKHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowRight, Shield, GitBranch, CreditCard, FileText } from "lucide-react";

const issuers = [
  {
    title: "KVK",
    description: "Issue company credentials from the Chamber of Commerce (EBWOID, EUCC, Power of Representation)",
    icon: Building2,
    path: "/issuers/kvk",
    color: "from-purple-500 to-orange-500",
  },
  {
    title: "Bank IBAN",
    description: "Obtain your bank account IBAN number for your business wallet",
    icon: CreditCard,
    path: "/issuers/bank",
    color: "from-green-500 to-yellow-400",
  },
  {
    title: "Tax Registration",
    description: "Get your VAT number from the Belastingdienst",
    icon: FileText,
    path: "/issuers/tax-registration",
    color: "from-blue-800 to-blue-600",
  },
];

const useCases = [
  {
    id: "BU1",
    title: "KYC / KYS",
    description: "Know Your Customer / Know Your Supplier verification using verifiable credentials",
    icon: Shield,
    path: "/use-cases/kyc-kys",
    color: "from-blue-600 to-blue-400",
  },
  {
    id: "BU2",
    title: "Create Company Branch",
    description: "Register a new company branch using verified business credentials",
    icon: GitBranch,
    path: "/use-cases/create-branch",
    color: "from-purple-500 to-orange-500",
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <KVKHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-kvk-text-primary mb-2">
              WE BUILD Consortium
            </h1>
            <p className="text-xl text-kvk-text-secondary max-w-2xl mx-auto">
              Official KVK pilot environment for the WE BUILD Consortium.
            </p>
          </div>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-purple-500 to-orange-500 rounded-full" />
        </section>

        {/* Issuers Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-kvk-blue">Issuers</h2>
            <Link
              to="/issuers"
              className="text-kvk-blue hover:underline inline-flex items-center gap-1 font-medium"
            >
              View all issuers <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-kvk-text-secondary mb-6">
            Trusted organisations that issue verifiable credentials to your digital wallet.
          </p>
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
        </section>

        {/* Use Cases Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-kvk-blue mb-6">Use Cases</h2>
          <p className="text-kvk-text-secondary mb-6">
            Explore real-world applications of verifiable credentials in business processes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((useCase) => {
              const IconComponent = useCase.icon;
              return (
                <Link key={useCase.path} to={useCase.path} className="block">
                  <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer h-full">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${useCase.color}`} />
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${useCase.color} text-white shadow-lg`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-2">{useCase.id}</Badge>
                          <CardTitle className="text-xl">{useCase.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {useCase.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
