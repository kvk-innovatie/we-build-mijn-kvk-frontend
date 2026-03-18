import WalletConnectButton from "wallet-connect-button-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { issueCredential, getIssuanceStatus } from "@/services/ebwoid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Copy,
  ClipboardCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type DialogStep =
  | "select-credential"
  | "select-wallet-natural"
  | "select-wallet-business"
  | "select-wallet-ebwoid"
  | "select-wallet-eucc"
  | "select-wallet-ubo"
  | "select-wallet-eu-poa";

interface CredentialIssuanceDialogProps {
  buttonKey: number;
  onWalletSuccess: (attributes: Record<string, unknown>) => void;
  trigger: React.ReactNode;
}

const CredentialIssuanceDialog = ({
  buttonKey,
  onWalletSuccess,
  trigger,
}: CredentialIssuanceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<DialogStep>("select-credential");
  const [selectedWalletType, setSelectedWalletType] = useState<"natural" | "business">("natural");

  // Issuance state (shared between EBWOID and EUCC — only one active at a time)
  const [issuanceStatus, setIssuanceStatus] = useState<
    "idle" | "issuing" | "polling" | "success" | "error"
  >("idle");
  const [issuanceError, setIssuanceError] = useState<string | null>(null);
  const [issuanceId, setIssuanceId] = useState<string | null>(null);
  const [credentialOffer, setCredentialOffer] = useState<string | null>(null);
  const [offerCopied, setOfferCopied] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const walletTypeOptions = [
    { value: "natural", label: "Natural person wallet", accent: "bg-blue-600", muted: "text-blue-600" },
    { value: "business", label: "Business wallet", accent: "bg-purple-600", muted: "text-purple-600" },
  ] as const;

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleIGrantClick = async (credentialType: "ebwoid" | "eucc") => {
    setIssuanceStatus("issuing");
    setIssuanceError(null);
    setCredentialOffer(null);
    setOfferCopied(false);

    try {
      const result = await issueCredential({
        provider: "igrant",
        credentialType,
        subject: {
          identifier: "NLNHR.90001356",
          legalName: "Krusty Krab",
        },
      });

      if (result.credentialOffer) {
        const offerText =
          typeof result.credentialOffer === "string"
            ? result.credentialOffer
            : JSON.stringify(result.credentialOffer);
        setCredentialOffer(offerText);
        setIssuanceStatus("success");
      } else {
        setIssuanceId(result.issuanceId);
        setIssuanceStatus("polling");

        pollingRef.current = setInterval(async () => {
          try {
            const status = await getIssuanceStatus(result.issuanceId);
            if (status.status === "accepted") {
              stopPolling();
              setIssuanceStatus("success");
            } else if (status.status === "failed") {
              stopPolling();
              setIssuanceStatus("error");
              setIssuanceError(status.error || "Issuance failed");
            }
          } catch (err) {
            stopPolling();
            setIssuanceStatus("error");
            setIssuanceError(
              err instanceof Error ? err.message : "Polling failed"
            );
          }
        }, 3000);
      }
    } catch (err) {
      setIssuanceStatus("error");
      setIssuanceError(
        err instanceof Error ? err.message : "Failed to start issuance"
      );
    }
  };

  const handleDialogClose = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setDialogStep("select-credential");
      stopPolling();
      setIssuanceStatus("idle");
      setIssuanceError(null);
      setIssuanceId(null);
      setCredentialOffer(null);
      setOfferCopied(false);
    }
  };

  const handleGoBack = () => {
    setDialogStep("select-credential");
    stopPolling();
    setIssuanceStatus("idle");
    setIssuanceError(null);
    setCredentialOffer(null);
    setOfferCopied(false);
  };

  const handleWalletSuccess = (attributes: Record<string, unknown> | undefined) => {
    if (attributes) {
      onWalletSuccess(attributes);
      handleDialogClose(false);
    }
  };

  const getDialogDescription = () => {
    switch (dialogStep) {
      case "select-credential":
        return "Choose the credential type you want to issue to your wallet.";
      case "select-wallet-natural":
        return "Select the wallet you want to use to receive your Power of Representation.";
      case "select-wallet-ebwoid":
        return "Select the wallet you want to use to receive your EBWOID credential.";
      case "select-wallet-eucc":
        return "Select the wallet you want to use to receive your EUCC credential.";
      case "select-wallet-ubo":
        return "Select the wallet you want to use to receive your UBO credential.";
      case "select-wallet-eu-poa":
        return "Select the wallet you want to use to receive your EU Power of Attorney.";
      case "select-wallet-business":
        return "Select the wallet you want to use to receive your EUCC credential.";
    }
  };

  // Reusable sub-components for wallet options
  const NLWalletFlag = () => (
    <div className="flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden shadow-sm flex-shrink-0">
      <svg viewBox="0 0 9 6" className="w-full h-full">
        <rect width="9" height="2" fill="#AE1C28" />
        <rect y="2" width="9" height="2" fill="#FFFFFF" />
        <rect y="4" width="9" height="2" fill="#21468B" />
      </svg>
    </div>
  );

  const IGrantOption = ({
    onClick,
    disabled,
  }: {
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <section
      onClick={disabled ? undefined : onClick}
      className={cn(
        "border rounded-2xl p-5 shadow-sm",
        disabled
          ? "border-gray-200 bg-gradient-to-br from-gray-100 to-gray-50 opacity-50 cursor-not-allowed"
          : "border-purple-100 bg-gradient-to-br from-purple-50 to-white cursor-pointer hover:border-purple-300 transition-colors"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden shadow-sm flex-shrink-0",
            disabled && "grayscale"
          )}
        >
          <img
            src="/igrantio_logo.jpg"
            alt="iGrant.io"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3
            className={cn(
              "text-lg font-semibold",
              disabled ? "text-gray-400" : "text-purple-900"
            )}
          >
            iGrant.io
          </h3>
          <p className={cn("text-sm", disabled ? "text-gray-400" : "text-purple-700")}>
            {disabled ? "Coming soon" : "Business wallet"}
          </p>
        </div>
      </div>
    </section>
  );

  const ProcivisOption = () => (
    <section className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-gray-100 to-gray-50 shadow-sm opacity-50 cursor-not-allowed">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden shadow-sm flex-shrink-0 grayscale">
          <img
            src="/procivis.png"
            alt="Procivis"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-400">Procivis</h3>
          <p className="text-sm text-gray-400">Coming soon</p>
        </div>
      </div>
    </section>
  );

  const IssuanceLoadingState = ({ credentialName }: { credentialName: string }) => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      <p className="text-lg font-medium text-purple-900">
        {issuanceStatus === "issuing"
          ? `Issuing ${credentialName} credential to iGrant.io wallet...`
          : "Waiting for wallet to accept credential..."}
      </p>
    </div>
  );

  const IssuanceSuccessState = ({ credentialName }: { credentialName: string }) => (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <CheckCircle2 className="h-10 w-10 text-green-600" />
      <p className="text-lg font-semibold text-green-900">
        Credential offer created!
      </p>
      <p className="text-sm text-gray-600 text-center max-w-md">
        Copy the credential offer below and paste it in your organisation wallet
        to receive the {credentialName} credential.
      </p>
      <div className="w-full max-w-lg">
        <div className="relative">
          <textarea
            readOnly
            value={credentialOffer || ""}
            className="w-full h-24 p-3 pr-20 border border-gray-300 rounded-lg text-xs font-mono bg-gray-50 resize-none"
          />
          <Button
            onClick={() => {
              if (credentialOffer) {
                navigator.clipboard.writeText(credentialOffer);
                setOfferCopied(true);
                setTimeout(() => setOfferCopied(false), 2000);
              }
            }}
            variant="outline"
            size="sm"
            className="absolute top-2 right-2"
          >
            {offerCopied ? (
              <>
                <ClipboardCheck className="w-3 h-3 mr-1" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" /> Copy
              </>
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
  );

  const IssuanceErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <AlertCircle className="h-12 w-12 text-red-600" />
      <p className="text-lg font-semibold text-red-900">Issuance failed</p>
      {issuanceError && (
        <p className="text-sm text-red-700 max-w-md text-center">
          {issuanceError}
        </p>
      )}
      <Button
        onClick={() => {
          setIssuanceStatus("idle");
          setIssuanceError(null);
        }}
        variant="outline"
        className="border-red-300 text-red-700 hover:bg-red-50"
      >
        Try again
      </Button>
    </div>
  );

  const IGrantIssuanceFlow = ({ credentialName }: { credentialName: string }) => (
    <>
      {(issuanceStatus === "issuing" || issuanceStatus === "polling") && (
        <IssuanceLoadingState credentialName={credentialName} />
      )}
      {issuanceStatus === "success" && credentialOffer && (
        <IssuanceSuccessState credentialName={credentialName} />
      )}
      {issuanceStatus === "error" && <IssuanceErrorState />}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
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
              <DialogDescription>{getDialogDescription()}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step 1: Select credential type */}
        {dialogStep === "select-credential" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="inline-flex rounded-full bg-muted/60 p-1">
                {walletTypeOptions.map((option) => {
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
              <div className="space-y-4">
                <section className="border border-blue-100 rounded-2xl p-5 space-y-4 bg-gradient-to-br from-blue-50 to-white shadow-sm">
                  <Badge
                    variant="outline"
                    className="w-fit border-blue-200 bg-blue-100/80 text-blue-900"
                  >
                    Natural person wallet credential
                  </Badge>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">
                      Power of Representation
                    </h3>
                    <p className="text-sm text-blue-700">
                      Prove that you are authorised to represent Krusty Krab
                      Feestartikelen as an individual.
                    </p>
                  </div>
                  <Button
                    onClick={() => setDialogStep("select-wallet-natural")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Receive Power of Representation
                  </Button>
                </section>

                <section className="border border-blue-100 rounded-2xl p-5 space-y-4 bg-gradient-to-br from-blue-50 to-white shadow-sm">
                  <Badge
                    variant="outline"
                    className="w-fit border-blue-200 bg-blue-100/80 text-blue-900"
                  >
                    Natural person wallet credential
                  </Badge>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">
                      EU Power of Attorney
                    </h3>
                    <p className="text-sm text-blue-700">
                      Receive an EU Power of Attorney credential to prove your
                      representation authority across Europe.
                    </p>
                  </div>
                  <Button
                    onClick={() => setDialogStep("select-wallet-eu-poa")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Receive EU Power of Attorney
                  </Button>
                </section>
              </div>
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
                    <h3 className="text-lg font-semibold text-purple-900">
                      European Business Wallet Operator Identification Data
                      (EBWOID)
                    </h3>
                    <p className="text-sm text-purple-700">
                      Issue an EBWOID credential to a business wallet to verify
                      the wallet operator's identification data.
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
                    <h3 className="text-lg font-semibold text-purple-900">
                      European Company Certificate (EUCC)
                    </h3>
                    <p className="text-sm text-purple-700">
                      Issue an EUCC credential to a business wallet to share
                      verified company information across Europe.
                    </p>
                  </div>
                  <Button
                    onClick={() => setDialogStep("select-wallet-eucc")}
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
                    <h3 className="text-lg font-semibold text-purple-900">
                      Ultimate Beneficial Owner (UBO)
                    </h3>
                    <p className="text-sm text-purple-700">
                      Issue a UBO credential to a business wallet to share
                      verified beneficial ownership information.
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
                <NLWalletFlag />
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

        {/* Step 2a2: Select wallet for EU Power of Attorney (NL-wallet only) */}
        {dialogStep === "select-wallet-eu-poa" && (
          <div className="space-y-6">
            <section className="border border-blue-100 rounded-2xl p-5 bg-gradient-to-br from-blue-50 to-white shadow-sm">
              <div className="flex items-center gap-4">
                <NLWalletFlag />
                <div className="wallet-connect-wrapper natural flex-1">
                  <WalletConnectButton
                    key={`eu-poa-${buttonKey}`}
                    issuance
                    label="NL-wallet"
                    clientId="nlw_45b8510259d2238b60ef561d0c608367"
                    helpBaseUrl="https://example.com/"
                    lang="en"
                    onSuccess={handleWalletSuccess}
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Step 2b: Select wallet for EBWOID (iGrant.io + Procivis) */}
        {dialogStep === "select-wallet-ebwoid" && (
          <div className="space-y-6">
            {issuanceStatus === "idle" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <IGrantOption onClick={() => handleIGrantClick("ebwoid")} />
                <ProcivisOption />
              </div>
            )}
            <IGrantIssuanceFlow credentialName="EBWOID" />
          </div>
        )}

        {/* Step 2c: Select wallet for EUCC (NL-wallet + iGrant.io + Procivis) */}
        {dialogStep === "select-wallet-eucc" && (
          <div className="space-y-6">
            {issuanceStatus === "idle" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NL-wallet option for EUCC */}
                <section className="border border-purple-100 rounded-2xl p-5 bg-gradient-to-br from-purple-50 to-white shadow-sm">
                  <div className="flex items-center gap-4">
                    <NLWalletFlag />
                    <div className="wallet-connect-wrapper business flex-1">
                      <WalletConnectButton
                        key={`eucc-${buttonKey}`}
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

                {/* iGrant.io option - enabled */}
                <IGrantOption onClick={() => handleIGrantClick("eucc")} />

                {/* Procivis - coming soon */}
                <ProcivisOption />
              </div>
            )}
            <IGrantIssuanceFlow credentialName="EUCC" />
          </div>
        )}

        {/* Step 2d: Select wallet for Business (legacy — kept for backwards compat) */}
        {dialogStep === "select-wallet-business" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="border border-purple-100 rounded-2xl p-5 bg-gradient-to-br from-purple-50 to-white shadow-sm">
                <div className="flex items-center gap-4">
                  <NLWalletFlag />
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
              <IGrantOption disabled />
              <ProcivisOption />
            </div>
          </div>
        )}

        {/* Step 2e: Select wallet for UBO */}
        {dialogStep === "select-wallet-ubo" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="border border-purple-100 rounded-2xl p-5 bg-gradient-to-br from-purple-50 to-white shadow-sm">
                <div className="flex items-center gap-4">
                  <NLWalletFlag />
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
              <IGrantOption disabled />
              <ProcivisOption />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CredentialIssuanceDialog;
