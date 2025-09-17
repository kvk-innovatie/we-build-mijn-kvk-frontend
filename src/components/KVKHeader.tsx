import { ChevronLeft, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const KVKHeader = () => {
  return (
    <header className="bg-card border-b border-kvk-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Back button and Logo */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-kvk-text-secondary hover:text-kvk-text-primary">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-kvk-blue">KVK</div>
              <span className="text-kvk-text-primary font-medium">My KVK</span>
            </div>
          </div>

          {/* Right side - Navigation */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-kvk-text-secondary hover:text-kvk-text-primary">
              <HelpCircle className="w-4 h-4 mr-1" />
              FAQ
            </Button>
            <Button variant="ghost" size="sm" className="text-kvk-text-secondary hover:text-kvk-text-primary">
              🇳🇱 Nederlands
            </Button>
            <Button variant="ghost" size="sm" className="text-kvk-text-secondary hover:text-kvk-text-primary">
              <LogOut className="w-4 h-4 mr-1" />
              Log out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default KVKHeader;