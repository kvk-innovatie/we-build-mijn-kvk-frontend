import { useState, useMemo } from "react";

interface IssueAttestationDialogProps {
  open: boolean;
  onClose: () => void;
  onSent: () => void;
}

export default function IssueAttestationDialog({
  open,
  onClose,
  onSent,
}: IssueAttestationDialogProps) {
  const [email, setEmail] = useState("");
  const [selectedAttestation, setSelectedAttestation] = useState("OrgWallet Full Access");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sending] = useState(false);

  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const handleSend = () => {
    // UI-only: no backend call, just show confirmation
    setShowConfirmation(true);
  };

  const handleClose = () => {
    setEmail("");
    setSelectedAttestation("OrgWallet Full Access");
    setShowConfirmation(false);
    onClose();
    onSent();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        {/* Dialog Panel */}
        <div
          className="relative bg-white rounded-lg overflow-hidden shadow-xl transform transition-all"
          style={{ width: "40vw", maxWidth: "40vw" }}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Issue Attestation</h3>
            <div className="mt-4">
              {/* Email Input */}
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                id="email"
                className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border"
                placeholder="Enter recipient email"
              />

              {/* Attestation Selection */}
              <label htmlFor="attestation" className="block mt-4 text-sm font-medium text-gray-700">Select Attestation</label>
              <select
                value={selectedAttestation}
                onChange={(e) => setSelectedAttestation(e.target.value)}
                id="attestation"
                className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm border"
              >
                <option value="OrgWallet Full Access">OrgWallet Full Access</option>
                <option value="OrgWallet View Only">OrgWallet View Only</option>
              </select>

              {/* Send Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSend}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-1.5 text-white text-sm font-medium shadow-sm hover:bg-indigo-700 sm:text-sm disabled:opacity-50"
                  disabled={!isEmailValid || sending}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 z-20 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-medium text-gray-900">Attestation Sent</h2>
            <p className="mt-2 text-sm text-gray-500">
              The attestation has been sent to {email}. It must be accepted by the recipient.
            </p>
            <div className="mt-4">
              <button onClick={handleClose} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
