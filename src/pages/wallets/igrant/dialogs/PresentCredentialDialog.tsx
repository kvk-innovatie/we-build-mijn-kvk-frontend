import { useState } from "react";
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
      setSelectedIndices(matched.length === 1 ? [0] : []);
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[calc(100vh-20px)] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Present Credential</h2>

        {step === "paste" && (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Paste the verification request URL received from the relying party (verifier).
            </p>
            <textarea
              value={requestInput}
              onChange={(e) => setRequestInput(e.target.value)}
              className="w-full h-24 p-3 border border-gray-300 rounded-lg text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Paste openid4vp:// verification request URL here..."
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={handleClose} className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300">
                Cancel
              </button>
              <button
                onClick={handleReceiveVerification}
                disabled={!requestInput.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Process Request
              </button>
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
                    <input
                      type="checkbox"
                      checked={selectedIndices.includes(index)}
                      onChange={() => toggleCredential(index)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 text-indigo-600 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cred.title}</p>
                      <p className="text-xs text-gray-500">{cred.issuer}</p>
                    </div>
                  </div>
                </div>
              ))}
              {matchingCredentials.length === 0 && (
                <p className="text-sm text-gray-500">No matching credentials found in your wallet.</p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setStep("paste")} className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300">
                Back
              </button>
              <button
                onClick={handleSendPresentation}
                disabled={selectedIndices.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Share Selected
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
            <p className="text-lg font-semibold text-green-900">Credential presented!</p>
            <p className="text-sm text-gray-600">Your credential has been shared with the verifier.</p>
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
            <p className="text-lg font-semibold text-red-900">Failed to present credential</p>
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
