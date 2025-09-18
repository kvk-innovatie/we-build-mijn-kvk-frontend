import KVKHeader from "@/components/KVKHeader";
import CompanyCard from "@/components/CompanyCard";
import ActionButton from "@/components/ActionButton";
import WalletConnectButton from "wallet-connect-button-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, User, Building2, Phone, Mail, Globe, Calendar, MapPin, RotateCcw } from "lucide-react";

interface WalletAttributes {
  family_name?: string;
  given_name?: string;
  birthdate?: string;
  nationalities?: string[];
  legal_entity_name?: string;
  representative_legal_authority_rule?: string;
  representative_post?: string;
  representative_birth_date?: string;
  representative_full_name?: string;
  legal_entity_contact_email?: string;
  legal_entity_contact_telephone?: string;
  legal_entity_contact_page?: string;
  legal_entity_activity_code?: string;
  legal_entity_activity_description?: string;
  legal_entity_status?: string;
  legal_entity_registration_date?: string;
  legal_entity_registered_address_admin_unit_level1?: string;
  legal_entity_registered_address_post_office_box?: string;
  legal_entity_registered_address_post_name?: string;
  legal_entity_registered_address_post_code?: string;
  legal_entity_registered_address_locator_designator?: string;
  legal_entity_registered_address_thoroughfare?: string;
  legal_entity_registration_member_state?: string;
  legal_entity_form_type?: string;
  legal_entity_id?: string;
  street_address?: string;
  house_number?: string;
  postal_code?: string;
  locality?: string;
  country?: string;
  [key: string]: any;
}

const Index = () => {
  const [walletData, setWalletData] = useState<WalletAttributes | null>(null);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [buttonKey, setButtonKey] = useState(0); // Key to force re-render of button

  const handleWalletSuccess = (attributes: WalletAttributes | undefined) => {
    console.log('Wallet transaction successful:', attributes);
    if (attributes) {
      setWalletData(attributes);
      setTransactionSuccess(true);
    }
  };

  const resetWalletButton = () => {
    setButtonKey(prev => prev + 1); // Force re-render by changing key
    setTransactionSuccess(false);
    // Keep the walletData so user can still see previously received data
  };

  const companyActivities = (
    <div>
      <p className="mb-1">NACE code: C10.6.1</p>
      <p>Fabricage van graanmolenproducten</p>
    </div>
  );

  const visitingAddress = (
    <div>
      <p className="mb-1">Sint Jacobslaan 300</p>
      <p>3511AH Utrecht</p>
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

          {/* Company Details - List Item Style */}
          <div className="bg-card border border-kvk-border rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-kvk-text-primary mb-2">Nieuwlaar</h3>
                <div className="space-y-1 text-kvk-text-secondary">
                  <p>KVK number: 12345678</p>
                  <p>Position: Owner</p>
                </div>
              </div>
            </div>

            {/* Company Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
                content="(+31) 0612345678"
                clickable 
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-kvk-border">
              {/* Wallet Connect Button styled as ActionButton */}
              <div className="wallet-connect-wrapper">
                <WalletConnectButton
                  key={buttonKey} // Force re-render when key changes
                  issuance
                  label="Receive credentials"
                  clientId="nlw_2fe35d507c90c42aaa355cba14c3c8ed"
                  helpBaseUrl="https://example.com/"
                  lang="en"
                  onSuccess={handleWalletSuccess}
                />
                {transactionSuccess && (
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 border-green-200 inline-flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Data received
                  </Badge>
                )}
              </div>
              <ActionButton>Change details</ActionButton>
              <ActionButton>Deregister sole proprietorship (eenmanszaak)</ActionButton>
            </div>

            {/* Reset Button Section - only shown when transaction is successful */}
            {transactionSuccess && (
              <div className="mt-4 flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetWalletButton}
                  className="text-kvk-blue hover:text-kvk-blue"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset Button
                </Button>
              </div>
            )}

            {/* Wallet Data Display Section */}
            {walletData && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="text-md font-semibold text-kvk-text-primary mb-4">Received Wallet Data</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Personal Information */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Personal Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {walletData.given_name && (
                          <div>
                            <span className="font-medium">First Name:</span> {walletData.given_name}
                          </div>
                        )}
                        {walletData.family_name && (
                          <div>
                            <span className="font-medium">Last Name:</span> {walletData.family_name}
                          </div>
                        )}
                        {walletData.birthdate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="font-medium">Birth Date:</span> {walletData.birthdate}
                          </div>
                        )}
                        {walletData.nationalities && (
                          <div>
                            <span className="font-medium">Nationalities:</span> {walletData.nationalities.join(', ')}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Legal Entity Information */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Legal Entity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {walletData.legal_entity_name && (
                          <div>
                            <span className="font-medium">Name:</span> {walletData.legal_entity_name}
                          </div>
                        )}
                        {walletData.legal_entity_id && (
                          <div>
                            <span className="font-medium">ID:</span> {walletData.legal_entity_id}
                          </div>
                        )}
                        {walletData.legal_entity_form_type && (
                          <div>
                            <span className="font-medium">Type:</span> {walletData.legal_entity_form_type}
                          </div>
                        )}
                        {walletData.legal_entity_status && (
                          <div>
                            <span className="font-medium">Status:</span> {walletData.legal_entity_status}
                          </div>
                        )}
                        {walletData.legal_entity_registration_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="font-medium">Registration:</span> {walletData.legal_entity_registration_date}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {walletData.legal_entity_contact_email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span className="font-medium">Email:</span> {walletData.legal_entity_contact_email}
                          </div>
                        )}
                        {walletData.legal_entity_contact_telephone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span className="font-medium">Phone:</span> {walletData.legal_entity_contact_telephone}
                          </div>
                        )}
                        {walletData.legal_entity_contact_page && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            <span className="font-medium">Website:</span> {walletData.legal_entity_contact_page}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Address Information */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Address Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {walletData.street_address && (
                          <div>
                            <span className="font-medium">Street:</span> {walletData.street_address} {walletData.house_number}
                          </div>
                        )}
                        {walletData.postal_code && (
                          <div>
                            <span className="font-medium">Postal Code:</span> {walletData.postal_code}
                          </div>
                        )}
                        {walletData.locality && (
                          <div>
                            <span className="font-medium">City:</span> {walletData.locality}
                          </div>
                        )}
                        {walletData.country && (
                          <div>
                            <span className="font-medium">Country:</span> {walletData.country}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Activity Information */}
                    {(walletData.legal_entity_activity_code || walletData.legal_entity_activity_description) && (
                      <Card className="md:col-span-2">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Business Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {walletData.legal_entity_activity_code && (
                            <div>
                              <span className="font-medium">Activity Code:</span> {walletData.legal_entity_activity_code}
                            </div>
                          )}
                          {walletData.legal_entity_activity_description && (
                            <div>
                              <span className="font-medium">Description:</span> {walletData.legal_entity_activity_description}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Representative Information */}
                    {(walletData.representative_full_name || walletData.representative_post) && (
                      <Card className="md:col-span-2">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Representative Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {walletData.representative_full_name && (
                            <div>
                              <span className="font-medium">Name:</span> {walletData.representative_full_name}
                            </div>
                          )}
                          {walletData.representative_post && (
                            <div>
                              <span className="font-medium">Position:</span> {walletData.representative_post}
                            </div>
                          )}
                          {walletData.representative_legal_authority_rule && (
                            <div>
                              <span className="font-medium">Authority:</span> {walletData.representative_legal_authority_rule}
                            </div>
                          )}
                          {walletData.representative_birth_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span className="font-medium">Birth Date:</span> {walletData.representative_birth_date}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
