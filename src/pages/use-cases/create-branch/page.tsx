import { Link } from "react-router-dom";
import KVKHeader from "@/components/KVKHeader";
import { ArrowLeft, GitBranch, Construction, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
                This is a video preview, a fully working demo is coming soon.
              </p>
            </CardContent>
          </Card>

          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center py-12">
              <Construction className="w-16 h-16 text-kvk-text-secondary mb-4" />
              <p className="text-kvk-text-secondary font-medium">Coming soon</p>
              <p className="text-sm text-kvk-text-secondary mt-2">
                This use case is currently under development.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateBranchPage;
