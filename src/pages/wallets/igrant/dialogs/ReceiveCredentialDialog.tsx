import { useState } from "react";
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[calc(100vh-20px)] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Receive Credential</h2>

        {step === "paste" && (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Paste the credential offer received from the issuer.
            </p>
            <textarea
              value={credentialOfferInput}
              onChange={(e) => setCredentialOfferInput(e.target.value)}
              className="w-full h-24 p-3 border border-gray-300 rounded-lg text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Paste credential offer here..."
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={handleClose} className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300">
                Cancel
              </button>
              <button
                onClick={handleReceive}
                disabled={!credentialOfferInput.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Receive Credential
              </button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center py-8 space-y-3">
            <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-gray-700">{statusMessage}</p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center py-8 space-y-3">
            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-lg font-semibold text-green-900">Credential received!</p>
            <p className="text-sm text-gray-600">The credential has been added to your wallet.</p>
            <button onClick={handleClose} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">
              Close
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center py-8 space-y-3">
            <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-lg font-semibold text-red-900">Failed to receive credential</p>
            <p className="text-sm text-red-700 text-center max-w-sm">{errorMessage}</p>
            <div className="flex space-x-2">
              <button onClick={() => setStep("paste")} className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300">
                Try Again
              </button>
              <button onClick={handleClose} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
