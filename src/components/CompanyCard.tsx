import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CompanyCardProps {
  title: string;
  content: string | React.ReactNode;
  clickable?: boolean;
}

const CompanyCard = ({ title, content, clickable = false }: CompanyCardProps) => {
  return (
    <Card className={`p-6 border border-kvk-border hover:shadow-md transition-shadow ${
      clickable ? 'cursor-pointer hover:border-kvk-blue/30' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-kvk-text-primary mb-3">{title}</h3>
          <div className="text-kvk-text-secondary space-y-1">
            {typeof content === 'string' ? (
              <p>{content}</p>
            ) : (
              content
            )}
          </div>
        </div>
        {clickable && (
          <ChevronRight className="w-5 h-5 text-kvk-text-secondary ml-4 flex-shrink-0" />
        )}
      </div>
    </Card>
  );
};

export default CompanyCard;