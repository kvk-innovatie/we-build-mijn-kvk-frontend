import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  receiveCredential,
  completeAuthorization,
  pollDeferred,
  acceptCredential,
} from "@/services/igrant-wallet";

type Step = "paste" | "processing" | "success" | "error";

interface ReceiveCredentialDialogProps {
  open: boolean;
  onClose: () => void;
  onReceived: () => void;
}

export default function ReceiveCredentialDialog({
  open,
  onClose,
  onReceived,
}: ReceiveCredentialDialogProps) {
  const [step, setStep] = useState<Step>("paste");
  const [credentialOfferInput, setCredentialOfferInput] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleReceive = async () => {
    setStep("processing");
    setStatusMessage("Receiving credential offer...");
    setErrorMessage("");

    try {
      const { credentialId, authorizationRequest } = await receiveCredential(
        credentialOfferInput.trim()
      );

      if (authorizationRequest) {
        setStatusMessage("Completing authorization...");
        try {
          await completeAuthorization(credentialId, authorizationRequest);
        } catch {
          // Authorization may fail due to CORS — continue anyway
        }
      }

      setStatusMessage("Waiting for credential to be ready...");
      let ready = false;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const status = await pollDeferred(credentialId);
        if (status === "credential_acked") {
          ready = true;
          break;
        }
      }
      if (!ready) {
        throw new Error("Timed out waiting for credential acknowledgment");
      }

      setStatusMessage("Accepting credential...");
      await acceptCredential(credentialId);

      setStep("success");
      onReceived();
    } catch (err) {
      setStep("error");
      setErrorMessage(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleClose = () => {
    setStep("paste");
    setCredentialOfferInput("");
    setStatusMessage("");
    setErrorMessage("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Receive Credential</DialogTitle>
        </DialogHeader>

        {step === "paste" && (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Paste the credential offer received from the issuer.
            </p>
            <Textarea
              value={credentialOfferInput}
              onChange={(e) => setCredentialOfferInput(e.target.value)}
              className="h-24 font-mono text-xs"
              placeholder="Paste credential offer here..."
            />
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleReceive}
                disabled={!credentialOfferInput.trim()}
              >
                Receive Credential
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center py-8 space-y-3">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
            <p className="text-sm text-gray-700">{statusMessage}</p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center py-8 space-y-3">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <p className="text-lg font-semibold text-green-900">
              Credential received!
            </p>
            <p className="text-sm text-gray-600">
              The credential has been added to your wallet.
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center py-8 space-y-3">
            <AlertCircle className="h-12 w-12 text-red-600" />
            <p className="text-lg font-semibold text-red-900">
              Failed to receive credential
            </p>
            <p className="text-sm text-red-700 text-center max-w-sm">
              {errorMessage}
            </p>
            <div className="flex space-x-2">
              <Button variant="secondary" onClick={() => setStep("paste")}>
                Try Again
              </Button>
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
