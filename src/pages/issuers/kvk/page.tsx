import { Link } from "react-router-dom";
import KVKHeader from "@/components/KVKHeader";
import CompanyCard from "@/components/CompanyCard";
import ActionButton from "@/components/ActionButton";
import WalletConnectButton from "wallet-connect-button-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { issueCredential, getIssuanceStatus } from "@/services/ebwoid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, User, Building2, Phone, Mail, Globe, Calendar, MapPin, RotateCcw, ArrowLeft, Wallet, Loader2, AlertCircle, Copy, ClipboardCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
}

type DialogStep = "select-credential" | "select-wallet-natural" | "select-wallet-business" | "select-wallet-ebwoid" | "select-wallet-ubo";

const KVKIssuerPage = () => {
  const [walletData, setWalletData] = useState<WalletAttributes | null>(null);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [buttonKey, setButtonKey] = useState(0); // Key to force re-render of button
  const [credentialDialogOpen, setCredentialDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<DialogStep>("select-credential");
  const [selectedWalletType, setSelectedWalletType] = useState<"natural" | "business">("natural");
  const walletTypeOptions = [
    { value: "natural", label: "Natural person wallet", accent: "bg-blue-600", muted: "text-blue-600" },
    { value: "business", label: "Business wallet", accent: "bg-purple-600", muted: "text-purple-600" },
  ] as const;

  // EBWOID issuance state
  const [ebwoidIssuanceStatus, setEbwoidIssuanceStatus] = useState<
    "idle" | "issuing" | "polling" | "success" | "error"
  >("idle");
  const [ebwoidError, setEbwoidError] = useState<string | null>(null);
  const [ebwoidIssuanceId, setEbwoidIssuanceId] = useState<string | null>(null);
  const [credentialOffer, setCredentialOffer] = useState<string | null>(null);
  const [offerCopied, setOfferCopied] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleIGrantClick = async () => {
    setEbwoidIssuanceStatus("issuing");
    setEbwoidError(null);
    setCredentialOffer(null);
    setOfferCopied(false);

    try {
      const result = await issueCredential({
        provider: "igrant",
        credentialType: "ebwoid",
        subject: {
          identifier: "NLNHR.90001356",
          legalName: "Witbaard Feestartikelen",
        },
      });

      if (result.credentialOffer) {
        // Synchronous offer flow — display the offer for copy-paste
        const offerText = typeof result.credentialOffer === "string"
          ? result.credentialOffer
          : JSON.stringify(result.credentialOffer);
        setCredentialOffer(offerText);
        setEbwoidIssuanceStatus("success");
      } else {
        // Legacy background-task flow (fallback for other providers)
        setEbwoidIssuanceId(result.issuanceId);
        setEbwoidIssuanceStatus("polling");

        pollingRef.current = setInterval(async () => {
          try {
            const status = await getIssuanceStatus(result.issuanceId);
            if (status.status === "accepted") {
              stopPolling();
              setEbwoidIssuanceStatus("success");
            } else if (status.status === "failed") {
              stopPolling();
              setEbwoidIssuanceStatus("error");
              setEbwoidError(status.error || "Issuance failed");
            }
          } catch (err) {
            stopPolling();
            setEbwoidIssuanceStatus("error");
            setEbwoidError(err instanceof Error ? err.message : "Polling failed");
          }
        }, 3000);
      }
    } catch (err) {
      setEbwoidIssuanceStatus("error");
      setEbwoidError(err instanceof Error ? err.message : "Failed to start issuance");
    }
  };

  const handleDialogClose = (open: boolean) => {
    setCredentialDialogOpen(open);
    if (!open) {
      // Reset to first step when dialog is closed
      setDialogStep("select-credential");
      stopPolling();
      setEbwoidIssuanceStatus("idle");
      setEbwoidError(null);
      setEbwoidIssuanceId(null);
      setCredentialOffer(null);
      setOfferCopied(false);
    }
  };

  const handleGoBack = () => {
    setDialogStep("select-credential");
  };

  const handleWalletSuccess = (attributes: WalletAttributes | undefined) => {
    console.log('Wallet transaction successful:', attributes);
    if (attributes) {
      setWalletData(attributes);
      setTransactionSuccess(true);
      setCredentialDialogOpen(false);
      setDialogStep("select-credential");
    }
  };

  const resetWalletButton = () => {
    setButtonKey(prev => prev + 1); // Force re-render by changing key
    setTransactionSuccess(false);
    // Keep the walletData so user can still see previously received data
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
                <h3 className="text-xl font-semibold text-kvk-text-primary mb-2">Witbaard Feestartikelen</h3>
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-kvk-border">
              <Dialog open={credentialDialogOpen} onOpenChange={handleDialogClose}>
                <DialogTrigger asChild>
                  <Button className="bg-kvk-blue hover:bg-kvk-blue/90 text-white font-medium gap-2">
                    <Wallet className="w-4 h-4" />
                    Receive credentials
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl credential-dialog">
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      {dialogStep !== "select-credential" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleGoBack}
                          className="h-8 w-8 -ml-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      )}
                      <div>
                        <DialogTitle>
                          {dialogStep === "select-credential"
                            ? "Select a credential to receive"
                            : "Choose your wallet"}
                        </DialogTitle>
                        <DialogDescription>
                          {dialogStep === "select-credential"
                            ? "Choose the credential type you want to issue to your wallet."
                            : dialogStep === "select-wallet-natural"
                            ? "Select the wallet you want to use to receive your Power of Representation."
                            : dialogStep === "select-wallet-ebwoid"
                            ? "Select the wallet you want to use to receive your EBWOID credential."
                            : dialogStep === "select-wallet-ubo"
                            ? "Select the wallet you want to use to receive your UBO credential."
                            : "Select the wallet you want to use to receive your EUCC credential."}
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  {/* Step 1: Select credential type */}
                  {dialogStep === "select-credential" && (
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <div className="inline-flex rounded-full bg-muted/60 p-1">
                          {walletTypeOptions.map(option => {
                            const isActive = selectedWalletType === option.value;
                            return (
                              <button
                                type="button"
                                key={option.value}
                                onClick={() => setSelectedWalletType(option.value)}
                                className={cn(
                                  "px-4 py-2 rounded-full text-sm font-semibold transition-colors",
                                  isActive
                                    ? `${option.accent} text-white shadow`
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {selectedWalletType === "natural" && (
                        <section className="border border-blue-100 rounded-2xl p-5 space-y-4 bg-gradient-to-br from-blue-50 to-white shadow-sm">
                          <Badge
                            variant="outline"
                            className="w-fit border-blue-200 bg-blue-100/80 text-blue-900"
                          >
                            Natural person wallet credential
                          </Badge>
                          <div>
                            <h3 className="text-lg font-semibold text-blue-900">Power of Representation</h3>
                            <p className="text-sm text-blue-700">
                              Prove that you are authorised to represent Witbaard Feestartikelen as an individual.
                            </p>
                          </div>
                          <Button
                            onClick={() => setDialogStep("select-wallet-natural")}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Receive Power of Representation
                          </Button>
                        </section>
                      )}

                      {selectedWalletType === "business" && (
                        <div className="space-y-4">
                          <section className="border border-purple-100 rounded-2xl p-5 space-y-4 bg-gradient-to-br from-purple-50 to-white shadow-sm">
                            <Badge
                              variant="outline"
                              className="w-fit border-purple-200 bg-purple-100/80 text-purple-900"
                            >
                              Business wallet credential
                            </Badge>
                            <div>
                              <h3 className="text-lg font-semibold text-purple-900">European Business Wallet Operator Identification Data (EBWOID)</h3>
                              <p className="text-sm text-purple-700">
                                Issue an EBWOID credential to a business wallet to verify the wallet operator's identification data.
                              </p>
                            </div>
                            <Button
                              onClick={() => setDialogStep("select-wallet-ebwoid")}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Receive EBWOID
                            </Button>
                          </section>

                          <section className="border border-purple-100 rounded-2xl p-5 space-y-4 bg-gradient-to-br from-purple-50 to-white shadow-sm">
                            <Badge
                              variant="outline"
                              className="w-fit border-purple-200 bg-purple-100/80 text-purple-900"
                            >
                              Business wallet credential
                            </Badge>
                            <div>
                              <h3 className="text-lg font-semibold text-purple-900">European Company Certificate (EUCC)</h3>
                              <p className="text-sm text-purple-700">
                                Issue an EUCC credential to a business wallet to share verified company information across Europe.
                              </p>
                            </div>
                            <Button
                              onClick={() => setDialogStep("select-wallet-business")}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Receive EUCC
                            </Button>
                          </section>

                          <section className="border border-purple-100 rounded-2xl p-5 space-y-4 bg-gradient-to-br from-purple-50 to-white shadow-sm">
                            <Badge
                              variant="outline"
                              className="w-fit border-purple-200 bg-purple-100/80 text-purple-900"
                            >
                              Business wallet credential
                            </Badge>
                            <div>
                              <h3 className="text-lg font-semibold text-purple-900">Ultimate Beneficial Owner (UBO)</h3>
                              <p className="text-sm text-purple-700">
                                Issue a UBO credential to a business wallet to share verified beneficial ownership information.
                              </p>
                            </div>
                            <Button
                              onClick={() => setDialogStep("select-wallet-ubo")}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Receive UBO
                            </Button>
                          </section>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2a: Select wallet for Natural Person (NL-wallet only) */}
                  {dialogStep === "select-wallet-natural" && (
                    <div className="space-y-6">
                      <section className="border border-blue-100 rounded-2xl p-5 bg-gradient-to-br from-blue-50 to-white shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                            {/* Netherlands Flag */}
                            <svg viewBox="0 0 9 6" className="w-full h-full">
                              <rect width="9" height="2" fill="#AE1C28"/>
                              <rect y="2" width="9" height="2" fill="#FFFFFF"/>
                              <rect y="4" width="9" height="2" fill="#21468B"/>
                            </svg>
                          </div>
                          <div className="wallet-connect-wrapper natural flex-1">
                            <WalletConnectButton
                              key={`natural-${buttonKey}`}
                              issuance
                              label="NL-wallet"
                              clientId="nlw_2fe35d507c90c42aaa355cba14c3c8ed"
                              helpBaseUrl="https://example.com/"
                              lang="en"
                              onSuccess={handleWalletSuccess}
                            />
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* Step 2c: Select wallet for EBWOID (iGrant.io + Procivis only) */}
                  {dialogStep === "select-wallet-ebwoid" && (
                    <div className="space-y-6">
                      {ebwoidIssuanceStatus === "idle" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* iGrant.io option - clickable */}
                          <section
                            onClick={handleIGrantClick}
                            className="border border-purple-100 rounded-2xl p-5 bg-gradient-to-br from-purple-50 to-white shadow-sm cursor-pointer hover:border-purple-300 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                                <img src="/igrantio_logo.jpg" alt="iGrant.io" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-purple-900">
                                  iGrant.io
                                </h3>
                                <p className="text-sm text-purple-700">Business wallet</p>
                              </div>
                            </div>
                          </section>

                          {/* Procivis option - greyed out */}
                          <section className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-gray-100 to-gray-50 shadow-sm opacity-50 cursor-not-allowed">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden shadow-sm flex-shrink-0 grayscale">
                                <img src="/procivis.png" alt="Procivis" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-400">
                                  Procivis
                                </h3>
                                <p className="text-sm text-gray-400">Coming soon</p>
                              </div>
                            </div>
                          </section>
                        </div>
                      )}

                      {(ebwoidIssuanceStatus === "issuing" || ebwoidIssuanceStatus === "polling") && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                          <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                          <p className="text-lg font-medium text-purple-900">
                            {ebwoidIssuanceStatus === "issuing"
                              ? "Issuing EBWOID credential to iGrant.io wallet..."
                              : "Waiting for wallet to accept credential..."}
                          </p>
                        </div>
                      )}

                      {ebwoidIssuanceStatus === "success" && credentialOffer && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                          <CheckCircle2 className="h-10 w-10 text-green-600" />
                          <p className="text-lg font-semibold text-green-900">
                            Credential offer created!
                          </p>
                          <p className="text-sm text-gray-600 text-center max-w-md">
                            Copy the credential offer below and paste it in your organisation wallet to receive the EBWOID credential.
                          </p>
                          <div className="w-full max-w-lg">
                            <div className="relative">
                              <textarea
                                readOnly
                                value={credentialOffer}
                                className="w-full h-24 p-3 pr-20 border border-gray-300 rounded-lg text-xs font-mono bg-gray-50 resize-none"
                              />
                              <Button
                                onClick={() => {
                                  navigator.clipboard.writeText(credentialOffer);
                                  setOfferCopied(true);
                                  setTimeout(() => setOfferCopied(false), 2000);
                                }}
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2"
                              >
                                {offerCopied ? (
                                  <><ClipboardCheck className="w-3 h-3 mr-1" /> Copied</>
                                ) : (
                                  <><Copy className="w-3 h-3 mr-1" /> Copy</>
                                )}
                              </Button>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDialogClose(false)}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Done
                          </Button>
                        </div>
                      )}

                      {ebwoidIssuanceStatus === "error" && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                          <AlertCircle className="h-12 w-12 text-red-600" />
                          <p className="text-lg font-semibold text-red-900">
                            Issuance failed
                          </p>
                          {ebwoidError && (
                            <p className="text-sm text-red-700 max-w-md text-center">
                              {ebwoidError}
                            </p>
                          )}
                          <Button
                            onClick={() => {
                              setEbwoidIssuanceStatus("idle");
                              setEbwoidError(null);
                            }}
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            Try again
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2b: Select wallet for Business */}
                  {dialogStep === "select-wallet-business" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* NL-wallet option for business */}
                        <section className="border border-purple-100 rounded-2xl p-5 bg-gradient-to-br from-purple-50 to-white shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                              {/* Netherlands Flag */}
                              <svg viewBox="0 0 9 6" className="w-full h-full">
                                <rect width="9" height="2" fill="#AE1C28"/>
                                <rect y="2" width="9" height="2" fill="#FFFFFF"/>
                                <rect y="4" width="9" height="2" fill="#21468B"/>
                              </svg>
                            </div>
                            <div className="wallet-connect-wrapper business flex-1">
                              <WalletConnectButton
                                key={`business-${buttonKey}`}
                                issuance
                                label="NL-wallet"
                                clientId="nlw_a9d4896760690527ecd21759910a5fd6"
                                business
                                helpBaseUrl="https://example.com/"
                                lang="en"
                                onSuccess={handleWalletSuccess}
                              />
                            </div>
                          </div>
                        </section>

                        {/* iGrant.io option - greyed out */}
                        <section className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-gray-100 to-gray-50 shadow-sm opacity-50 cursor-not-allowed">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden shadow-sm flex-shrink-0 grayscale">
                              <img src="/igrantio_logo.jpg" alt="iGrant.io" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-400">
                                iGrant.io
                              </h3>
                              <p className="text-sm text-gray-400">Coming soon</p>
                            </div>
                          </div>
                        </section>

                        {/* Procivis option - greyed out */}
                        <section className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-gray-100 to-gray-50 shadow-sm opacity-50 cursor-not-allowed">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden shadow-sm flex-shrink-0 grayscale">
                              <img src="/procivis.png" alt="Procivis" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-400">
                                Procivis
                              </h3>
                              <p className="text-sm text-gray-400">Coming soon</p>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  )}

                  {/* Step 2d: Select wallet for UBO */}
                  {dialogStep === "select-wallet-ubo" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* NL-wallet option for UBO */}
                        <section className="border border-purple-100 rounded-2xl p-5 bg-gradient-to-br from-purple-50 to-white shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                              {/* Netherlands Flag */}
                              <svg viewBox="0 0 9 6" className="w-full h-full">
                                <rect width="9" height="2" fill="#AE1C28"/>
                                <rect y="2" width="9" height="2" fill="#FFFFFF"/>
                                <rect y="4" width="9" height="2" fill="#21468B"/>
                              </svg>
                            </div>
                            <div className="wallet-connect-wrapper business flex-1">
                              <WalletConnectButton
                                key={`ubo-${buttonKey}`}
                                issuance
                                label="NL-wallet"
                                clientId="nlw_ea46c7f31bac0a0d10f204f55c921445"
                                business
                                helpBaseUrl="https://example.com/"
                                lang="en"
                                onSuccess={handleWalletSuccess}
                              />
                            </div>
                          </div>
                        </section>

                        {/* iGrant.io option - greyed out */}
                        <section className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-gray-100 to-gray-50 shadow-sm opacity-50 cursor-not-allowed">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden shadow-sm flex-shrink-0 grayscale">
                              <img src="/igrantio_logo.jpg" alt="iGrant.io" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-400">
                                iGrant.io
                              </h3>
                              <p className="text-sm text-gray-400">Coming soon</p>
                            </div>
                          </div>
                        </section>

                        {/* Procivis option - greyed out */}
                        <section className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-gray-100 to-gray-50 shadow-sm opacity-50 cursor-not-allowed">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden shadow-sm flex-shrink-0 grayscale">
                              <img src="/procivis.png" alt="Procivis" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-400">
                                Procivis
                              </h3>
                              <p className="text-sm text-gray-400">Coming soon</p>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
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

export default KVKIssuerPage;
