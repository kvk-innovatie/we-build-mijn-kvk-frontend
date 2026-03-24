import { useState, useEffect, useCallback } from "react";
import { Eye, Trash2 } from "lucide-react";
import {
  listCredentials,
  deleteCredential,
  type WalletCredential,
} from "@/services/igrant-wallet";
import CredentialDetailDialog from "./dialogs/CredentialDetailDialog";
import ReceiveCredentialDialog from "./dialogs/ReceiveCredentialDialog";
import PresentCredentialDialog from "./dialogs/PresentCredentialDialog";

export default function WalletTab() {
  const [credentials, setCredentials] = useState<WalletCredential[]>([]);
  const [selectedCredential, setSelectedCredential] = useState<Record<string, unknown> | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isPresentOpen, setIsPresentOpen] = useState(false);

  const fetchCredentials = useCallback(async () => {
    try {
      const creds = await listCredentials();
      setCredentials(creds);
    } catch (error) {
      console.error("Error fetching credentials:", error);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const handleDelete = async (credential: WalletCredential) => {
    if (!confirm(`Are you sure you want to delete "${credential.title}"?`)) return;
    try {
      const credentialId =
        (credential.raw.credentialId as string) ||
        (credential.raw.id as string);
      await deleteCredential(credentialId);
      setCredentials((prev) => prev.filter((c) => c !== credential));
    } catch (error) {
      console.error("Error deleting credential:", error);
    }
  };

  return (
    <div className="mt-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Wallet</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all your organisation's attestations.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex space-x-3">
          <button
            type="button"
            onClick={() => setIsPresentOpen(true)}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Present Credential
          </button>
          <button
            type="button"
            onClick={() => setIsReceiveOpen(true)}
            className="block rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            Receive Credential Offer
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Title</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Issuer</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Valid until</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {credentials.map((credential, index) => (
                    <tr key={index} className="cursor-pointer">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-indigo-600 hover:text-indigo-800 sm:pl-6">
                        <button onClick={() => { setSelectedCredential(credential.raw); setIsDetailOpen(true); }}>
                          {credential.title}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{credential.issuer}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{credential.validUntil}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 flex space-x-4">
                        <button
                          onClick={() => { setSelectedCredential(credential.raw); setIsDetailOpen(true); }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(credential)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <CredentialDetailDialog
        jsonData={selectedCredential}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
      <ReceiveCredentialDialog
        open={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        onReceived={fetchCredentials}
      />
      <PresentCredentialDialog
        open={isPresentOpen}
        onClose={() => setIsPresentOpen(false)}
        onPresented={fetchCredentials}
      />
    </div>
  );
}
