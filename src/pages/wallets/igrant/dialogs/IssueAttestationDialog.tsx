import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Issue Attestation</DialogTitle>
        </DialogHeader>

        {!showConfirmation ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter recipient email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="attestation">Select Attestation</Label>
              <Select value={selectedAttestation} onValueChange={setSelectedAttestation}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OrgWallet Full Access">
                    OrgWallet Full Access
                  </SelectItem>
                  <SelectItem value="OrgWallet View Only">
                    OrgWallet View Only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSend} disabled={!isEmailValid}>
                Send
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              The attestation has been sent to {email}. It must be accepted by
              the recipient.
            </p>
            <div className="flex justify-end">
              <Button onClick={handleClose}>OK</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
