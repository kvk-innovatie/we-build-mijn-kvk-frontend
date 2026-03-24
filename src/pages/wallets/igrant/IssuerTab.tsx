import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import IssueAttestationDialog from "./dialogs/IssueAttestationDialog";

interface IssuedAttestation {
  credential: string;
  issuedTo: string;
  valid: string;
}

export default function IssuerTab() {
  const [issuedAttestations, setIssuedAttestations] = useState<IssuedAttestation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSent = () => {
    // UI-only: add a demo entry
    setIssuedAttestations((prev) => [
      ...prev,
      {
        credential: "OrgWallet Full Access",
        issuedTo: "Erwin Nieuwlaar",
        valid: "21-12-2024",
      },
    ]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Issuer</h2>
          <p className="mt-1 text-sm text-gray-700">
            A list of all your organisation issued attestations, along with the
            ability to issue new attestations.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          Issue Attestation
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Credential</TableHead>
              <TableHead>Issued to</TableHead>
              <TableHead>Valid until</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">View</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issuedAttestations.map((attestation, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {attestation.credential}
                </TableCell>
                <TableCell className="text-gray-500">
                  {attestation.issuedTo}
                </TableCell>
                <TableCell className="text-gray-500">
                  {attestation.valid}
                </TableCell>
                <TableCell className="text-right">
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                    View
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {issuedAttestations.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  No attestations issued yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <IssueAttestationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSent={handleSent}
      />
    </div>
  );
}
