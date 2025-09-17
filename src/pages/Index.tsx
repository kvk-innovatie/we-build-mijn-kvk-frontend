import KVKHeader from "@/components/KVKHeader";
import CompanyCard from "@/components/CompanyCard";
import ActionButton from "@/components/ActionButton";

const Index = () => {
  const companyActivities = (
    <div>
      <p className="mb-1">SBI code: 62100</p>
      <p>Computer programming activities</p>
    </div>
  );

  const visitingAddress = (
    <div>
      <p className="mb-1">Van Sijpesteijnkade 17 D</p>
      <p>3521AH Utrecht</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <KVKHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-kvk-text-primary">My KVK</h1>
        </div>

        {/* Company Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-kvk-blue mb-6">Your companies and organisations</h2>
          <p className="text-kvk-text-secondary mb-6">
            In these companies and organisations, you as a natural person (human being) have a direct position.
          </p>

          {/* Company Details */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-kvk-text-primary mb-2">Nieuwlaar</h3>
            <div className="space-y-1 text-kvk-text-secondary mb-6">
              <p>KVK number: 70123101</p>
              <p>Position: Owner</p>
            </div>

            {/* Company Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <CompanyCard 
                title="Company activities" 
                content={companyActivities}
                clickable 
              />
              <CompanyCard 
                title="Visiting address" 
                content={visitingAddress}
                clickable 
              />
              <CompanyCard 
                title="Phone number" 
                content="(+31) 0645957523"
                clickable 
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <ActionButton>Change details</ActionButton>
              <ActionButton>Deregister sole proprietorship (eenmanszaak)</ActionButton>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
