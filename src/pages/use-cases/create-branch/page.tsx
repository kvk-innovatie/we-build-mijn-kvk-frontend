import { Link } from "react-router-dom";
import KVKHeader from "@/components/KVKHeader";
import { ArrowLeft, ArrowRight, Download, Wallet, Building2, ExternalLink, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Step = {
  num: number;
  title: string;
  icon: typeof Download;
  body: React.ReactNode;
};

const STEPS: Step[] = [
  {
    num: 1,
    title: "Download the Natural Person Wallet",
    icon: Download,
    body: (
      <>
        <p className="text-sm text-kvk-text-secondary mb-4">
          Start by installing the Natural Person Wallet on your device. This is where your
          credentials will be stored.
        </p>
        <a
          href="https://wallet-connect.eu/?mode=personal&lang=en"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-kvk-blue hover:underline font-medium"
        >
          Go to wallet-connect.eu
          <ExternalLink className="w-4 h-4" />
        </a>
      </>
    ),
  },
  {
    num: 2,
    title: "Obtain your EU PoA and EUCC credentials",
    icon: Wallet,
    body: (
      <>
        <p className="text-sm text-kvk-text-secondary mb-4">
          Visit the KVK issuer page and click <span className="font-medium">Receive credentials</span>.
          You need to run the issuance flow <span className="font-medium">twice</span> — once for the
          EU PoA and once for the EUCC — so both credentials end up in your wallet.
        </p>
        <Link
          to="/issuers/kvk"
          className="inline-flex items-center gap-2 text-kvk-blue hover:underline font-medium"
        >
          Go to the KVK issuer page
          <ArrowRight className="w-4 h-4" />
        </Link>
      </>
    ),
  },
  {
    num: 3,
    title: "Open a company branch in France",
    icon: Building2,
    body: (
      <>
        <p className="text-sm text-kvk-text-secondary mb-4">
          Once both credentials are in your wallet, head over to Infogreffe and follow the steps on
          their page to open a company branch in France.
        </p>
        <Link
          to="/verifiers/infogreffe"
          className="inline-flex items-center gap-2 text-kvk-blue hover:underline font-medium"
        >
          Go to the Infogreffe verifier page
          <ArrowRight className="w-4 h-4" />
        </Link>
      </>
    ),
  },
];

const CreateBranchPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <KVKHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center text-kvk-blue hover:underline mb-8 block">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>
        <div className="text-center">
          <Badge variant="outline" className="mb-4">BU2</Badge>
          <h1 className="text-3xl font-bold text-kvk-text-primary mb-4">Create Company Branch</h1>
          <p className="text-kvk-text-secondary mb-8">
            Register a new company branch using verified business credentials.
          </p>
          {/* Video Preview */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardContent className="pt-6">
              <div className="aspect-video rounded-lg overflow-hidden mb-4">
                <iframe
                  src="https://player.vimeo.com/video/1174913767"
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="Create Company Branch Demo Preview"
                />
              </div>
              <p className="text-sm text-kvk-text-secondary flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                Watch the demo preview, then follow the steps below to try it yourself.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-kvk-text-primary mb-2">How to run the demo</h2>
          <p className="text-kvk-text-secondary">
            Follow these three steps to open a company branch in France using verifiable credentials.
          </p>
        </div>

        <div className="space-y-4">
          {STEPS.map(({ num, title, icon: Icon, body }) => (
            <Card key={num}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-kvk-blue text-white font-bold flex-shrink-0">
                    {num}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-kvk-blue" />
                      <h3 className="text-lg font-semibold text-kvk-text-primary">{title}</h3>
                    </div>
                    {body}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CreateBranchPage;
