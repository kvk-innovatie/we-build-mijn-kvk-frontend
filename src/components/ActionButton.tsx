import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const ActionButton = ({ children, onClick }: ActionButtonProps) => {
  return (
    <Button 
      variant="ghost" 
      className="text-kvk-blue hover:text-kvk-blue hover:bg-kvk-blue-light/20 justify-start p-0 h-auto font-normal"
      onClick={onClick}
    >
      <ChevronRight className="w-4 h-4 mr-1" />
      {children}
    </Button>
  );
};

export default ActionButton;