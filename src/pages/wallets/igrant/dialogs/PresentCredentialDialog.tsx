import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  receiveVerification,
  filterCredentials,
  sendPresentation,
  type MatchedCredential,
} from "@/services/igrant-wallet";

type Step = "paste" | "processing" | "consent" | "success" | "error";

interface PresentCredentialDialogProps {
  open: boolean;
  onClose: () => void;
  onPresented: () => void;
}

export default function PresentCredentialDialog({
  open,
  onClose,
  onPresented,
}: PresentCredentialDialogProps) {
  const [step, setStep] = useState<Step>("paste");
  const [requestInput, setRequestInput] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [matchingCredentials, setMatchingCredentials] = useState<MatchedCredential[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [presentationId, setPresentationId] = useState("");

  const toggleCredential = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleReceiveVerification = async () => {
    setStep("processing");
    setStatusMessage("Processing verification request...");
    setErrorMessage("");

    try {
      const pId = await receiveVerification(requestInput.trim());
      setPresentationId(pId);

      setStatusMessage("Finding matching credentials...");
      const matched = await filterCredentials(pId);
      setMatchingCredentials(matched);

      if (matched.length === 1) {
        setSelectedIndices([0]);
      } else {
        setSelectedIndices([]);
      }

      setStep("consent");
    } catch (err) {
      setStep("error");
      setErrorMessage(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleSendPresentation = async () => {
    setStep("processing");
    setStatusMessage("Presenting credential to verifier...");

    try {
      const selected = selectedIndices.map((i) => matchingCredentials[i]);
      const inputDescriptors = selected.map((item) => ({
        id: item.descriptorId,
        credentialId: (item.raw as Record<string, unknown>).credentialId as string,
      }));

      await sendPresentation(presentationId, inputDescriptors);
      setStep("success");
      onPresented();
    } catch (err) {
      setStep("error");
      setErrorMessage(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleClose = () => {
    setStep("paste");
    setRequestInput("");
    setStatusMessage("");
    setErrorMessage("");
    setMatchingCredentials([]);
    setSelectedIndices([]);
    setPresentationId("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Present Credential</DialogTitle>
        </DialogHeader>

        {step === "paste" && (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Paste the verification request URL received from the relying party (verifier).
            </p>
            <Textarea
              value={requestInput}
              onChange={(e) => setRequestInput(e.target.value)}
              className="h-24 font-mono text-xs"
              placeholder="Paste openid4vp:// verification request URL here..."
            />
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleReceiveVerification}
                disabled={!requestInput.trim()}
              >
                Process Request
              </Button>
            </div>
          </div>
        )}

        {step === "consent" && (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              The verifier is requesting the following credentials. Select which to share:
            </p>
            <div className="space-y-2 mb-4">
              {matchingCredentials.map((cred, index) => (
                <div
                  key={index}
                  onClick={() => toggleCredential(index)}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedIndices.includes(index)
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedIndices.includes(index)}
                      onCheckedChange={() => toggleCredential(index)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {cred.title}
                      </p>
                      <p className="text-xs text-gray-500">{cred.issuer}</p>
                    </div>
                  </div>
                </div>
              ))}
              {matchingCredentials.length === 0 && (
                <p className="text-sm text-gray-500">
                  No matching credentials found in your wallet.
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setStep("paste")}>
                Back
              </Button>
              <Button
                onClick={handleSendPresentation}
                disabled={selectedIndices.length === 0}
                className="bg-green-600 hover:bg-green-500"
              >
                Share Selected
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
              Credential presented!
            </p>
            <p className="text-sm text-gray-600">
              Your credential has been shared with the verifier.
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center py-8 space-y-3">
            <AlertCircle className="h-12 w-12 text-red-600" />
            <p className="text-lg font-semibold text-red-900">
              Failed to present credential
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
