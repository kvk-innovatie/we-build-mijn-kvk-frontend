import WalletConnectButton from "wallet-connect-button-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
  | "select-wallet-business";

interface VatIdIssuanceDialogProps {
  buttonKey: number;
  onWalletSuccess: (attributes: Record<string, unknown>) => void;
  trigger: React.ReactNode;
}

const VatIdIssuanceDialog = ({
  buttonKey,
  onWalletSuccess,
  trigger,
}: VatIdIssuanceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<DialogStep>("select-credential");
  const [selectedWalletType, setSelectedWalletType] = useState<"natural" | "business">("natural");

  const walletTypeOptions = [
    { value: "natural", label: "Natural person wallet", accent: "bg-[#154273]", muted: "text-[#154273]" },
    { value: "business", label: "Business wallet", accent: "bg-purple-600", muted: "text-purple-600" },
  ] as const;

  const handleDialogClose = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setDialogStep("select-credential");
    }
  };

  const handleGoBack = () => {
    setDialogStep("select-credential");
  };

  const handleWalletSuccess = (attributes: Record<string, unknown> | undefined) => {
    if (attributes) {
      onWalletSuccess(attributes);
      handleDialogClose(false);
    }
  };

  const NLWalletFlag = () => (
    <div className="flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden shadow-sm flex-shrink-0">
      <svg viewBox="0 0 9 6" className="w-full h-full">
        <rect width="9" height="2" fill="#AE1C28" />
        <rect y="2" width="9" height="2" fill="#FFFFFF" />
        <rect y="4" width="9" height="2" fill="#21468B" />
      </svg>
    </div>
  );

  const getDialogDescription = () => {
    switch (dialogStep) {
      case "select-credential":
        return "Choose the credential type you want to issue to your wallet.";
      case "select-wallet-natural":
        return "Select the wallet you want to use to receive your VAT ID credential.";
      case "select-wallet-business":
        return "Select the wallet you want to use to receive your VAT ID credential.";
    }
  };

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
                    className="w-fit border-blue-200 bg-blue-100/80 text-[#154273]"
                  >
                    Natural person wallet credential
                  </Badge>
                  <div>
                    <h3 className="text-lg font-semibold text-[#154273]">
                      VAT ID
                    </h3>
                    <p className="text-sm text-[#154273]/80">
                      Receive your VAT ID as a verifiable credential in your
                      personal wallet.
                    </p>
                  </div>
                  <Button
                    onClick={() => setDialogStep("select-wallet-natural")}
                    className="bg-[#154273] hover:bg-[#154273]/90 text-white"
                  >
                    Receive VAT ID
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
                      VAT ID
                    </h3>
                    <p className="text-sm text-purple-700">
                      Receive your VAT ID as a verifiable credential in your
                      business wallet.
                    </p>
                  </div>
                  <Button
                    onClick={() => setDialogStep("select-wallet-business")}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Receive VAT ID
                  </Button>
                </section>
              </div>
            )}
          </div>
        )}

        {/* Step 2a: Select wallet for Natural Person (NL-wallet) */}
        {dialogStep === "select-wallet-natural" && (
          <div className="space-y-6">
            <section className="border border-blue-100 rounded-2xl p-5 bg-gradient-to-br from-blue-50 to-white shadow-sm">
              <div className="flex items-center gap-4">
                <NLWalletFlag />
                <div className="wallet-connect-wrapper natural flex-1">
                  <WalletConnectButton
                    key={`vat-natural-${buttonKey}`}
                    issuance
                    label="NL-wallet"
                    clientId="nlw_8214492433dea6e4768045fe2d532d33"
                    helpBaseUrl="https://example.com/"
                    lang="en"
                    onSuccess={handleWalletSuccess}
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Step 2b: Select wallet for Business (NL-wallet) */}
        {dialogStep === "select-wallet-business" && (
          <div className="space-y-6">
            <section className="border border-purple-100 rounded-2xl p-5 bg-gradient-to-br from-purple-50 to-white shadow-sm">
              <div className="flex items-center gap-4">
                <NLWalletFlag />
                <div className="wallet-connect-wrapper business flex-1">
                  <WalletConnectButton
                    key={`vat-business-${buttonKey}`}
                    issuance
                    label="NL-wallet"
                    clientId="nlw_036d193f70e65b5a72296e87e56cb4f4"
                    business
                    helpBaseUrl="https://example.com/"
                    lang="en"
                    onSuccess={handleWalletSuccess}
                  />
                </div>
              </div>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VatIdIssuanceDialog;
