import WalletConnectButton from "wallet-connect-button-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type WalletAttributes = Record<string, unknown>;

interface WalletSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buttonKey: number;
  clientId: string;
  onSuccess: (attributes: WalletAttributes) => void;
}

const WalletSelectDialog = ({
  open,
  onOpenChange,
  buttonKey,
  clientId,
  onSuccess,
}: WalletSelectDialogProps) => {
  const handleWalletSuccess = (attributes: WalletAttributes) => {
    onSuccess(attributes);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl credential-dialog">
        <DialogHeader>
          <DialogTitle>Choose your wallet</DialogTitle>
          <DialogDescription>
            Select the wallet you want to use to receive your credential
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NL-wallet option - WalletConnectButton */}
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
                    clientId={clientId}
                    helpBaseUrl="https://example.com/"
                    lang="en"
                    onSuccess={handleWalletSuccess}
                  />
                </div>
              </div>
            </section>

            {/* iGrant.io option */}
            <section className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-gray-50 to-white shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                  <img src="/igrantio_logo.jpg" alt="iGrant.io" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">
                  iGrant.io
                </h3>
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletSelectDialog;

