import { useState, useEffect, useCallback } from "react";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [deleteTarget, setDeleteTarget] = useState<WalletCredential | null>(null);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const credentialId =
        (deleteTarget.raw.credentialId as string) ||
        (deleteTarget.raw.id as string);
      await deleteCredential(credentialId);
      setCredentials((prev) => prev.filter((c) => c !== deleteTarget));
    } catch (error) {
      console.error("Error deleting credential:", error);
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Wallet</h2>
          <p className="mt-1 text-sm text-gray-700">
            A list of all your organisation's attestations.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setIsPresentOpen(true)}>
            Present Credential
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-500"
            onClick={() => setIsReceiveOpen(true)}
          >
            Receive Credential Offer
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Issuer</TableHead>
              <TableHead>Valid until</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {credentials.map((credential, index) => (
              <TableRow key={index}>
                <TableCell>
                  <button
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                    onClick={() => {
                      setSelectedCredential(credential.raw);
                      setIsDetailOpen(true);
                    }}
                  >
                    {credential.title}
                  </button>
                </TableCell>
                <TableCell className="text-gray-500">
                  {credential.issuer}
                </TableCell>
                <TableCell className="text-gray-500">
                  {credential.validUntil}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-4">
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => {
                        setSelectedCredential(credential.raw);
                        setIsDetailOpen(true);
                      }}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => setDeleteTarget(credential)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {credentials.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  No credentials in wallet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete credential</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
