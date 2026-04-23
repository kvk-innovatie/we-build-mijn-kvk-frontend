import { Link } from "react-router-dom";
import KVKHeader from "@/components/KVKHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Shield, GitBranch, CreditCard, FileText, Store, Wallet, Smartphone, Briefcase } from "lucide-react";

const useCases = [
  {
    id: "BU1",
    title: "KYC / KYS",
    description: "Know Your Customer / Know Your Supplier verification",
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

const issuers = [
  {
    title: "KVK",
    description: "Issue credentials from the Netherlands Chamber of Commerce",
    icon: Building2,
    path: "/issuers/kvk",
    color: "from-purple-500 to-orange-500",
    credentials: ["PoA", "EBWOID", "EUCC", "UBO"],
  },
  {
    title: "Bank",
    description: "Obtain your bank account IBAN number",
    icon: CreditCard,
    path: "/issuers/bank",
    color: "from-green-500 to-yellow-400",
    credentials: ["IBAN"],
  },
  {
    title: "Tax Authority",
    description: "Get your VAT number",
    icon: FileText,
    path: "/issuers/tax-registration",
    color: "from-blue-800 to-blue-600",
    credentials: ["Tax ID"],
  },
];

const relyingParties = [
  {
    title: "KVK",
    description: "Verify business credentials issued by the Netherlands Chamber of Commerce",
    icon: Building2,
    path: "/verifiers/kvk",
    color: "from-purple-500 to-orange-500",
    credentials: ["EBWOID"],
  },
  {
    title: "Infogreffe",
    description: "French commercial court registry — create a company branch using verified credentials",
    icon: Building2,
    path: "/verifiers/infogreffe",
    color: "from-[#1a2b57] to-[#2d5ea0]",
    credentials: ["EUCC"],
  },
  {
    title: "Belastingdienst",
    description: "Dutch Tax Authority — file your VAT return using verified business credentials",
    icon: FileText,
    path: "/verifiers/belastingdienst",
    color: "from-[#1a3a5c] to-[#2d5ea0]",
    credentials: ["EBWOID"],
  },
  {
    title: "Deutsche Bank",
    description: "Complete your KYC process by scanning a QR code with your NL-wallet personal wallet",
    icon: CreditCard,
    path: "/verifiers/deutsche-bank",
    color: "from-[#0018a8] to-[#3b82f6]",
    credentials: ["Personal ID"],
  },
  {
    title: "FictiveCo",
    description: "Verify your identity and organization to receive payments",
    icon: Store,
    path: "/verifiers/fictiveco",
    color: "from-red-600 to-red-500",
    credentials: ["EBWOID", "EUCC"],
  },
];

const naturalPersonWallets = [
  {
    title: "NL-wallet",
    description: "The Dutch government digital identity wallet for citizens",
    icon: Smartphone,
    color: "from-[#2563eb] to-[#3b82f6]",
    href: "https://wallet-connect.eu/?mode=personal&lang=en",
  },
];

const businessWallets = [
  {
    title: "Generic Business Wallet",
    description: "A generic business wallet for organisational credentials",
    icon: Briefcase,
    color: "from-[#aa418c] to-[#c45da6]",
    href: "https://wallet-connect.eu/?mode=business&lang=en",
  },
  {
    title: "iGrant",
    description: "iGrant.io organisational wallet for business credentials",
    icon: Wallet,
    color: "from-[#6366f1] to-[#8b5cf6]",
    path: "/wallets/igrant",
  },
  {
    title: "Procivis",
    description: "Coming soon",
    icon: Wallet,
    color: "from-black to-gray-800",
    comingSoon: true,
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

        {/* Relying Parties Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-kvk-blue mb-6">Relying Parties</h2>
          <p className="text-kvk-text-secondary mb-6">
            Organisations that verify and accept verifiable credentials.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relyingParties.map((rp) => {
              const IconComponent = rp.icon;
              return (
                <Link key={rp.title} to={rp.path} className="block">
                  <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer h-full">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${rp.color}`} />
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${rp.color} text-white shadow-lg`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl">{rp.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base mb-3">
                        {rp.description}
                      </CardDescription>
                      <ul className="flex flex-wrap gap-2">
                        {rp.credentials.map((cred) => (
                          <li key={cred}>
                            <Badge variant="secondary">{cred}</Badge>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Issuers Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-kvk-blue">Issuers</h2>
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
                      <CardDescription className="text-base mb-3">
                        {issuer.description}
                      </CardDescription>
                      <ul className="flex flex-wrap gap-2">
                        {issuer.credentials.map((cred) => (
                          <li key={cred}>
                            <Badge variant="secondary">{cred}</Badge>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Wallets Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-kvk-blue mb-6">Wallets</h2>
          <p className="text-kvk-text-secondary mb-6">
            Digital wallets for storing and presenting verifiable credentials.
          </p>

          {/* Natural Person Wallets */}
          <h3 className="text-lg font-semibold text-kvk-text-primary mb-4">Natural Person Wallets</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {naturalPersonWallets.map((wallet) => {
              const IconComponent = wallet.icon;
              return (
                <a key={wallet.title} href={wallet.href} target="_blank" rel="noopener noreferrer" className="block">
                  <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer h-full">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${wallet.color}`} />
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${wallet.color} text-white shadow-lg`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl">{wallet.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {wallet.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>

          {/* Business Wallets */}
          <h3 className="text-lg font-semibold text-kvk-text-primary mb-4">Business Wallets</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {businessWallets.map((wallet) => {
              const IconComponent = wallet.icon;
              if (wallet.comingSoon) {
                return (
                  <Card key={wallet.title} className="relative overflow-hidden transition-all duration-300 h-full opacity-75">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${wallet.color}`} />
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${wallet.color} text-white shadow-lg`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{wallet.title}</CardTitle>
                          <Badge variant="secondary" className="mt-1">Coming soon</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {wallet.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              }
              const walletCard = (
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer h-full">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${wallet.color}`} />
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${wallet.color} text-white shadow-lg`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-xl">{wallet.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {wallet.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
              if (wallet.path) {
                return (
                  <Link key={wallet.title} to={wallet.path} className="block">
                    {walletCard}
                  </Link>
                );
              }
              return (
                <a key={wallet.title} href={wallet.href} target="_blank" rel="noopener noreferrer" className="block">
                  {walletCard}
                </a>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
