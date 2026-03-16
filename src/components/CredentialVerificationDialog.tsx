import { useState, useEffect, useRef, useCallback } from "react";
import {
  requestVerification,
  getVerificationStatus,
} from "@/services/verification";
import type { VerifiableCredentialType } from "@/services/verification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Copy,
  ClipboardCheck,
  Shield,
  Building2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type VerificationStep =
  | "select-credential"
  | "verifying"
  | "url-display"
  | "success"
  | "error";

const TYPE_LABELS: Record<VerifiableCredentialType, string> = {
  ebwoid: "EBWOID",
  eucc: "EUCC",
  both: "EBWOID + EUCC",
};

interface CredentialVerificationDialogProps {
  onVerificationSuccess: (credential: Record<string, unknown>) => void;
  trigger: React.ReactNode;
  defaultCredentialType?: VerifiableCredentialType;
}

const CredentialVerificationDialog = ({
  onVerificationSuccess,
  trigger,
  defaultCredentialType,
}: CredentialVerificationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<VerificationStep>("select-credential");
  const hasAutoStarted = useRef(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [verifiedCredential, setVerifiedCredential] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedType, setSelectedType] =
    useState<VerifiableCredentialType | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  useEffect(() => {
    if (open && defaultCredentialType && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      handleVerifyClick(defaultCredentialType);
    }
  }, [open, defaultCredentialType]);

  const handleVerifyClick = async (credentialType: VerifiableCredentialType) => {
    setStep("verifying");
    setSelectedType(credentialType);
    setErrorMessage(null);
    setVerificationUrl(null);
    setUrlCopied(false);
    setVerifiedCredential(null);

    try {
      const result = await requestVerification({ credentialType });
      setVerificationUrl(result.verificationUrl);
      setStep("url-display");
      setStatusMessage("Waiting for wallet holder to present credential...");

      // Start polling
      pollingRef.current = setInterval(async () => {
        try {
          const status = await getVerificationStatus(
            result.presentationExchangeId
          );
          if (status.status === "request_received") {
            setStatusMessage("Credential received, verifying...");
          } else if (status.status === "presentation_acked") {
            stopPolling();
            setVerifiedCredential(status.credential || {});
            setStep("success");
          } else if (status.status === "failed") {
            stopPolling();
            setErrorMessage(status.error || "Verification failed");
            setStep("error");
          }
        } catch (err) {
          stopPolling();
          setErrorMessage(
            err instanceof Error ? err.message : "Polling failed"
          );
          setStep("error");
        }
      }, 3000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to start verification"
      );
      setStep("error");
    }
  };

  const handleDialogClose = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      stopPolling();
      setStep("select-credential");
      setSelectedType(null);
      setVerificationUrl(null);
      setUrlCopied(false);
      setStatusMessage("");
      setVerifiedCredential(null);
      setErrorMessage(null);
      hasAutoStarted.current = false;
    }
  };

  const handleDone = () => {
    if (verifiedCredential) {
      onVerificationSuccess(verifiedCredential);
    }
    handleDialogClose(false);
  };

  const getDialogDescription = () => {
    switch (step) {
      case "select-credential":
        return "Choose which credentials to verify.";
      case "verifying":
        return "Creating verification request...";
      case "url-display":
        return "Copy the URL below and paste it in the wallet to present the credential.";
      case "success":
        return "The credentials have been successfully verified.";
      case "error":
        return "An error occurred during verification.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl credential-dialog">
        <DialogHeader>
          <DialogTitle>
            {step === "select-credential"
              ? "Verify credentials"
              : step === "success"
                ? "Verification successful"
                : step === "error"
                  ? "Verification failed"
                  : "Verify credentials"}
          </DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        {/* Step 1: Select credential type */}
        {step === "select-credential" && (
          <div className="space-y-4">
            {/* Combined verification - primary option */}
            <section className="border-2 border-kvk-blue rounded-2xl p-5 space-y-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-white shadow-sm">
              <Badge
                variant="outline"
                className="w-fit border-kvk-blue bg-kvk-blue/10 text-kvk-blue"
              >
                Full verification
              </Badge>
              <div>
                <h3 className="text-lg font-semibold text-kvk-text-primary">
                  Verify Both (EBWOID + EUCC)
                </h3>
                <p className="text-sm text-kvk-text-secondary">
                  Request both credentials in a single verification request to
                  verify wallet operator identity and company registration data
                  at once.
                </p>
              </div>
              <Button
                onClick={() => handleVerifyClick("both")}
                className="bg-kvk-blue hover:bg-kvk-blue/90 text-white"
              >
                <Shield className="w-4 h-4 mr-2" />
                Verify Both
              </Button>
            </section>

            {/* Individual options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <section className="border border-kvk-border rounded-2xl p-4 space-y-3 bg-gradient-to-br from-blue-50 to-white shadow-sm">
                <Badge
                  variant="outline"
                  className="w-fit border-blue-200 bg-blue-100/80 text-blue-900 text-xs"
                >
                  Wallet operator identification
                </Badge>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900">
                    EBWOID
                  </h3>
                  <p className="text-xs text-blue-700">
                    Wallet operator ID, name, and issuing authority.
                  </p>
                </div>
                <Button
                  onClick={() => handleVerifyClick("ebwoid")}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-900 hover:bg-blue-50"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Verify EBWOID
                </Button>
              </section>

              <section className="border border-kvk-border rounded-2xl p-4 space-y-3 bg-gradient-to-br from-indigo-50 to-white shadow-sm">
                <Badge
                  variant="outline"
                  className="w-fit border-indigo-200 bg-indigo-100/80 text-indigo-900 text-xs"
                >
                  Company registration data
                </Badge>
                <div>
                  <h3 className="text-sm font-semibold text-indigo-900">
                    EUCC
                  </h3>
                  <p className="text-xs text-indigo-700">
                    Legal form, address, representatives, and activities.
                  </p>
                </div>
                <Button
                  onClick={() => handleVerifyClick("eucc")}
                  variant="outline"
                  size="sm"
                  className="border-indigo-300 text-indigo-900 hover:bg-indigo-50"
                >
                  <Building2 className="w-3 h-3 mr-1" />
                  Verify EUCC
                </Button>
              </section>
            </div>
          </div>
        )}

        {/* Step 2: Loading */}
        {step === "verifying" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-kvk-blue" />
            <p className="text-lg font-medium text-kvk-text-primary">
              Creating verification request...
            </p>
          </div>
        )}

        {/* Step 3: URL display + polling */}
        {step === "url-display" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Shield className="h-10 w-10 text-kvk-blue" />
            <p className="text-lg font-semibold text-kvk-text-primary">
              Verification request created
            </p>
            <p className="text-sm text-gray-600 text-center max-w-md">
              Copy the verification URL below and paste it in the organisation
              wallet to present the{" "}
              {selectedType ? TYPE_LABELS[selectedType] : ""} credential
              {selectedType === "both" ? "s" : ""}.
            </p>
            <div className="w-full max-w-lg">
              <div className="relative">
                <textarea
                  readOnly
                  value={verificationUrl || ""}
                  className="w-full h-24 p-3 pr-20 border border-gray-300 rounded-lg text-xs font-mono bg-gray-50 resize-none"
                />
                <Button
                  onClick={() => {
                    if (verificationUrl) {
                      navigator.clipboard.writeText(verificationUrl);
                      setUrlCopied(true);
                      setTimeout(() => setUrlCopied(false), 2000);
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  {urlCopied ? (
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
            <div className="flex items-center gap-2 text-sm text-kvk-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin" />
              {statusMessage}
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === "success" && verifiedCredential && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
            <p className="text-lg font-semibold text-green-900">
              {selectedType === "both"
                ? "Both credentials verified successfully"
                : "Credential verified successfully"}
            </p>

            {/* Display verified credential data */}
            <div className="w-full max-w-lg bg-green-50 border border-green-200 rounded-lg p-4 space-y-1 text-sm max-h-80 overflow-y-auto">
              {Object.entries(verifiedCredential)
                .filter(
                  ([key]) =>
                    ![
                      "cnf",
                      "iss",
                      "iat",
                      "vct",
                      "sub",
                      "nbf",
                      "jti",
                      "status",
                    ].includes(key)
                )
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between py-1.5 border-b border-green-100 last:border-0"
                  >
                    <span className="font-medium text-green-900 capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-green-800 text-right max-w-[60%]">
                      {key === "exp" && typeof value === "number"
                        ? new Date(value * 1000).toLocaleDateString()
                        : typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                    </span>
                  </div>
                ))}
            </div>

            <Button
              onClick={handleDone}
              className="bg-kvk-blue hover:bg-kvk-blue/90 text-white"
            >
              Done
            </Button>
          </div>
        )}

        {/* Step 5: Error */}
        {step === "error" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
            <p className="text-lg font-semibold text-red-900">
              Verification failed
            </p>
            {errorMessage && (
              <p className="text-sm text-red-700 max-w-md text-center">
                {errorMessage}
              </p>
            )}
            <Button
              onClick={() => {
                setStep("select-credential");
                setErrorMessage(null);
              }}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Try again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CredentialVerificationDialog;
