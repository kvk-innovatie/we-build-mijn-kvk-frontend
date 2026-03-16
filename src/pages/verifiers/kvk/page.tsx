import { Link } from "react-router-dom";
import KVKHeader from "@/components/KVKHeader";
import CompanyCard from "@/components/CompanyCard";
import CredentialVerificationDialog from "@/components/CredentialVerificationDialog";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Shield, Calendar, Globe, ArrowLeft, MapPin, Users, Briefcase } from "lucide-react";

interface VerifiedData {
  // EBWOID fields
  id?: string;
  name?: string;
  attestation_legal_category?: string;
  issuing_authority?: string;
  issuing_country?: string;
  date_of_expiry?: string;
  trust_anchor?: string;
  // EUCC fields
  legal_person_name?: string;
  legal_person_id?: string;
  legal_form_type?: string;
  registration_member_state?: string;
  registration_date?: string;
  legal_person_status?: string;
  legal_person_activity?: { code?: string; description?: string };
  registered_address?: Record<string, string>;
  legal_representative?: Array<Record<string, unknown>>;
  share_capital?: { amount?: number; currency?: string };
  digital_contact_point?: { website?: string; email?: string };
  legal_person_duration?: string;
  [key: string]: unknown;
}

const KVKVerifierPage = () => {
  const [verifiedData, setVerifiedData] = useState<VerifiedData | null>(null);

  const handleVerificationSuccess = (credential: Record<string, unknown>) => {
    console.log("Verification successful:", credential);
    setVerifiedData(credential as VerifiedData);
  };

  const companyActivities = (
    <div>
      <p className="mb-1">NACE code: 47.78</p>
      <p>Retail sale of new goods in specialised stores</p>
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
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-kvk-blue hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-kvk-text-primary">
            Credential Verification
          </h1>
          <p className="text-kvk-text-secondary mt-2">
            KVK Relying Party - Verify business credentials
          </p>
        </div>

        {/* Company Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-kvk-blue mb-6">
            Company to verify
          </h2>
          <p className="text-kvk-text-secondary mb-6">
            Request and verify credentials from a business wallet to confirm
            company information.
          </p>

          <div className="bg-card border border-kvk-border rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-kvk-text-primary mb-2">
                  Witbaard Feestartikelen
                </h3>
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
              <CompanyCard
                title="Phone number"
                content="(+31) 0612345678"
                clickable
              />
            </div>

            {/* Verification Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-kvk-border">
              <CredentialVerificationDialog
                onVerificationSuccess={handleVerificationSuccess}
                trigger={
                  <Button className="bg-kvk-blue hover:bg-kvk-blue/90 text-white font-medium gap-2">
                    <Shield className="w-4 h-4" />
                    Verify credentials
                  </Button>
                }
              />
            </div>

            {/* Verified Data Display Section */}
            {verifiedData && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h5 className="text-md font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Verified Credential Data
                </h5>

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
                      {(verifiedData.name || verifiedData.legal_person_name) && (
                        <div>
                          <span className="font-medium">Name:</span>{" "}
                          {verifiedData.name || verifiedData.legal_person_name}
                        </div>
                      )}
                      {(verifiedData.id || verifiedData.legal_person_id) && (
                        <div>
                          <span className="font-medium">ID:</span>{" "}
                          {verifiedData.id || verifiedData.legal_person_id}
                        </div>
                      )}
                      {verifiedData.attestation_legal_category && (
                        <div>
                          <span className="font-medium">Category:</span>{" "}
                          {verifiedData.attestation_legal_category}
                        </div>
                      )}
                      {verifiedData.legal_form_type && (
                        <div>
                          <span className="font-medium">Legal Form:</span>{" "}
                          {verifiedData.legal_form_type}
                        </div>
                      )}
                      {verifiedData.legal_person_status && (
                        <div>
                          <span className="font-medium">Status:</span>{" "}
                          {verifiedData.legal_person_status}
                        </div>
                      )}
                      {verifiedData.registration_date && (
                        <div>
                          <span className="font-medium">Registration Date:</span>{" "}
                          {verifiedData.registration_date}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Issuer & Validity */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Issuer & Validity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {verifiedData.issuing_authority && (
                        <div>
                          <span className="font-medium">
                            Issuing Authority:
                          </span>{" "}
                          {verifiedData.issuing_authority}
                        </div>
                      )}
                      {(verifiedData.issuing_country || verifiedData.registration_member_state) && (
                        <div>
                          <span className="font-medium">Country:</span>{" "}
                          {verifiedData.issuing_country || verifiedData.registration_member_state}
                        </div>
                      )}
                      {verifiedData.date_of_expiry && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="font-medium">Expires:</span>{" "}
                          {verifiedData.date_of_expiry}
                        </div>
                      )}
                      {verifiedData.trust_anchor && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          <span className="font-medium">Trust Anchor:</span>{" "}
                          {verifiedData.trust_anchor}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Business Activity (EUCC) */}
                  {verifiedData.legal_person_activity && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Business Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {verifiedData.legal_person_activity.code && (
                          <div>
                            <span className="font-medium">NACE Code:</span>{" "}
                            {verifiedData.legal_person_activity.code}
                          </div>
                        )}
                        {verifiedData.legal_person_activity.description && (
                          <div>
                            <span className="font-medium">Description:</span>{" "}
                            {verifiedData.legal_person_activity.description}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Registered Address (EUCC) */}
                  {verifiedData.registered_address && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Registered Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {verifiedData.registered_address.full_address && (
                          <div>{verifiedData.registered_address.full_address}</div>
                        )}
                        {!verifiedData.registered_address.full_address && (
                          <>
                            {verifiedData.registered_address.thorough_fare && (
                              <div>
                                {verifiedData.registered_address.thorough_fare}{" "}
                                {verifiedData.registered_address.locator_designator}
                              </div>
                            )}
                            {verifiedData.registered_address.post_code && (
                              <div>
                                {verifiedData.registered_address.post_code}{" "}
                                {verifiedData.registered_address.post_name}
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Legal Representatives (EUCC) */}
                  {verifiedData.legal_representative && verifiedData.legal_representative.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Legal Representatives
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        {verifiedData.legal_representative.map((rep, i) => {
                          const person = (rep.natural_person || rep) as Record<string, unknown>;
                          return (
                            <div key={i} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                              {person.full_name && (
                                <div>
                                  <span className="font-medium">Name:</span>{" "}
                                  {String(person.full_name)}
                                </div>
                              )}
                              {person.role && (
                                <div>
                                  <span className="font-medium">Role:</span>{" "}
                                  {String(person.role)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}

                  {/* Share Capital (EUCC) */}
                  {verifiedData.share_capital && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Share Capital
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <div>
                          {verifiedData.share_capital.currency}{" "}
                          {verifiedData.share_capital.amount?.toLocaleString()}
                        </div>
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

export default KVKVerifierPage;
