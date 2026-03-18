import { Link } from "react-router-dom";
import KVKHeader from "@/components/KVKHeader";
import CompanyCard from "@/components/CompanyCard";
import ActionButton from "@/components/ActionButton";
import CredentialIssuanceDialog from "@/components/CredentialIssuanceDialog";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building2, Phone, Mail, Globe, Calendar, MapPin, RotateCcw, ArrowLeft, Wallet, Shield, Briefcase, Users } from "lucide-react";
import type {
  EuccRegisteredAddress,
  EuccLegalPersonActivity,
  EuccLegalRepresentative,
  EuccShareCapital,
  EuccDigitalContactPoint,
} from "@/types/eucc";

interface WalletAttributes {
  // Existing fields (PoA / EBWOID / legacy)
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

  // EUCC-specific fields (Rulebook v1.1)
  attestation_legal_category?: string;
  legal_person_name?: string;
  legal_person_id?: string;
  legal_form_type?: string;
  registration_member_state?: string;
  registered_address?: EuccRegisteredAddress;
  registration_date?: string;
  legal_person_status?: string;
  legal_person_activity?: EuccLegalPersonActivity;
  legal_representative?: EuccLegalRepresentative[];
  share_capital?: EuccShareCapital;
  legal_person_duration?: string;
  digital_contact_point?: EuccDigitalContactPoint;
  issuing_country?: string;
}

const KVKIssuerPage = () => {
  const [walletData, setWalletData] = useState<WalletAttributes | null>(null);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [buttonKey, setButtonKey] = useState(0);

  const handleWalletSuccess = (attributes: Record<string, unknown>) => {
    console.log('Wallet transaction successful:', attributes);
    setWalletData(attributes as WalletAttributes);
    setTransactionSuccess(true);
  };

  const resetWalletButton = () => {
    setButtonKey(prev => prev + 1);
    setTransactionSuccess(false);
  };

  const isEuccData = (data: WalletAttributes) =>
    !!data.legal_person_name || !!data.attestation_legal_category;

  const companyActivities = (
    <div>
      <p className="mb-1">NACE code: 47.78</p>
      <p>Retail sale of new goods in specialised stores</p>
    </div>
  );

  const visitingAddress = (
    <div>
      <p className="mb-1">Bikini Bottom 3</p>
      <p>3511AH Utrecht</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <KVKHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back navigation */}
        <div className="mb-6">
          <Link to="/issuers" className="inline-flex items-center text-kvk-blue hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to issuers
          </Link>
        </div>

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
                <h3 className="text-xl font-semibold text-kvk-text-primary mb-2">Krusty Krab</h3>
                <div className="space-y-1 text-kvk-text-secondary">
                  <p>KVK number: 90001356</p>
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
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-kvk-border">
              <CredentialIssuanceDialog
                buttonKey={buttonKey}
                onWalletSuccess={handleWalletSuccess}
                trigger={
                  <Button className="bg-kvk-blue hover:bg-kvk-blue/90 text-white font-medium gap-2">
                    <Wallet className="w-4 h-4" />
                    Receive credentials
                  </Button>
                }
              />
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

                {isEuccData(walletData) ? (
                  /* EUCC-specific display */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Company Identity */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Company Identity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {walletData.legal_person_name && (
                          <div>
                            <span className="font-medium">Name:</span> {walletData.legal_person_name}
                          </div>
                        )}
                        {walletData.legal_person_id && (
                          <div>
                            <span className="font-medium">EUID:</span> {walletData.legal_person_id}
                          </div>
                        )}
                        {walletData.legal_form_type && (
                          <div>
                            <span className="font-medium">Legal Form:</span> {walletData.legal_form_type}
                          </div>
                        )}
                        {walletData.attestation_legal_category && (
                          <div>
                            <span className="font-medium">Category:</span> {walletData.attestation_legal_category}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Registration */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Registration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {walletData.registration_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="font-medium">Date:</span> {walletData.registration_date}
                          </div>
                        )}
                        {walletData.registration_member_state && (
                          <div>
                            <span className="font-medium">Member State:</span> {walletData.registration_member_state}
                          </div>
                        )}
                        {walletData.legal_person_status && (
                          <div>
                            <span className="font-medium">Status:</span> {walletData.legal_person_status}
                          </div>
                        )}
                        {walletData.issuing_country && (
                          <div>
                            <span className="font-medium">Issuing Country:</span> {walletData.issuing_country}
                          </div>
                        )}
                        {walletData.legal_person_duration && (
                          <div>
                            <span className="font-medium">Duration Until:</span> {walletData.legal_person_duration}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Registered Address */}
                    {walletData.registered_address && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Registered Address
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {walletData.registered_address.full_address && (
                            <div>
                              <span className="font-medium">Full Address:</span> {walletData.registered_address.full_address}
                            </div>
                          )}
                          {walletData.registered_address.thorough_fare && (
                            <div>
                              <span className="font-medium">Street:</span> {walletData.registered_address.thorough_fare} {walletData.registered_address.locator_designator}
                            </div>
                          )}
                          {walletData.registered_address.post_code && (
                            <div>
                              <span className="font-medium">Postal Code:</span> {walletData.registered_address.post_code}
                            </div>
                          )}
                          {walletData.registered_address.post_name && (
                            <div>
                              <span className="font-medium">City:</span> {walletData.registered_address.post_name}
                            </div>
                          )}
                          {walletData.registered_address.admin_unit_level_1 && (
                            <div>
                              <span className="font-medium">Country:</span> {walletData.registered_address.admin_unit_level_1}
                            </div>
                          )}
                          {walletData.registered_address.admin_unit_level_2 && (
                            <div>
                              <span className="font-medium">Region:</span> {walletData.registered_address.admin_unit_level_2}
                            </div>
                          )}
                          {walletData.registered_address.care_of && (
                            <div>
                              <span className="font-medium">c/o:</span> {walletData.registered_address.care_of}
                            </div>
                          )}
                          {walletData.registered_address.post_office_box && (
                            <div>
                              <span className="font-medium">PO Box:</span> {walletData.registered_address.post_office_box}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Business Activity */}
                    {walletData.legal_person_activity && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Business Activity
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {walletData.legal_person_activity.code && (
                            <div>
                              <span className="font-medium">NACE Code:</span> {walletData.legal_person_activity.code}
                            </div>
                          )}
                          {walletData.legal_person_activity.description && (
                            <div>
                              <span className="font-medium">Description:</span> {walletData.legal_person_activity.description}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Legal Representatives */}
                    {walletData.legal_representative && walletData.legal_representative.length > 0 && (
                      <Card className="md:col-span-2">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Legal Representatives
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                          {walletData.legal_representative.map((rep, index) => (
                            <div key={index} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                              {rep.natural_person && (
                                <div className="space-y-1">
                                  <div className="font-medium text-xs text-gray-500 uppercase">Natural Person</div>
                                  {rep.natural_person.full_name && (
                                    <div><span className="font-medium">Name:</span> {rep.natural_person.full_name}</div>
                                  )}
                                  {rep.natural_person.date_of_birth && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span className="font-medium">Date of Birth:</span> {rep.natural_person.date_of_birth}
                                    </div>
                                  )}
                                  {rep.natural_person.nationality && (
                                    <div><span className="font-medium">Nationality:</span> {rep.natural_person.nationality}</div>
                                  )}
                                  {rep.natural_person.signatory_rule && (
                                    <div><span className="font-medium">Signatory Rule:</span> {rep.natural_person.signatory_rule}</div>
                                  )}
                                </div>
                              )}
                              {rep.legal_person && (
                                <div className="space-y-1">
                                  <div className="font-medium text-xs text-gray-500 uppercase">Legal Person</div>
                                  {rep.legal_person.name && (
                                    <div><span className="font-medium">Name:</span> {rep.legal_person.name}</div>
                                  )}
                                  {rep.legal_person.id && (
                                    <div><span className="font-medium">ID:</span> {rep.legal_person.id}</div>
                                  )}
                                  {rep.legal_person.legal_form_type && (
                                    <div><span className="font-medium">Legal Form:</span> {rep.legal_person.legal_form_type}</div>
                                  )}
                                  {rep.legal_person.signatory_rule && (
                                    <div><span className="font-medium">Signatory Rule:</span> {rep.legal_person.signatory_rule}</div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Share Capital */}
                    {walletData.share_capital && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Share Capital</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Amount:</span> {walletData.share_capital.amount} {walletData.share_capital.currency}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Digital Contact Point */}
                    {walletData.digital_contact_point && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Contact
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {walletData.digital_contact_point.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span className="font-medium">Email:</span> {walletData.digital_contact_point.email}
                            </div>
                          )}
                          {walletData.digital_contact_point.website && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              <span className="font-medium">Website:</span> {walletData.digital_contact_point.website}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  /* Legacy / PoA / EBWOID display */
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
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default KVKIssuerPage;
