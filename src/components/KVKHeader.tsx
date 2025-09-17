import { ChevronLeft, HelpCircle, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const KVKHeader = () => {
  return (
    <>
      {/* Top gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-orange-500"></div>
      
      <header className="bg-card border-b border-kvk-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and Logo */}
            <div className="flex items-center space-x-6">
              <Button variant="ghost" size="sm" className="text-kvk-text-secondary hover:text-kvk-text-primary hover:bg-transparent p-0">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <div className="text-2xl font-bold text-kvk-blue">KVK</div>
              </div>
            </div>

            {/* Right side - Navigation */}
            <div className="flex items-center space-x-6">
              <Button variant="ghost" size="sm" className="text-kvk-text-secondary hover:text-kvk-text-primary hover:bg-transparent p-0">
                <HelpCircle className="w-4 h-4 mr-2" />
                FAQ
              </Button>
              <Button variant="ghost" size="sm" className="text-kvk-text-secondary hover:text-kvk-text-primary hover:bg-transparent p-0">
                🌐 Nederlands
              </Button>
              <Button variant="ghost" size="sm" className="text-kvk-text-secondary hover:text-kvk-text-primary hover:bg-transparent p-0">
                <User className="w-4 h-4 mr-2" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default KVKHeader;