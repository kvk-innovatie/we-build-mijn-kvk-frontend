import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function RenderValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-5">
        {value.map((item, index) => (
          <li key={index}>
            {typeof item === "object" && item !== null ? (
              Object.entries(item).map(([subKey, subValue]) => (
                <div key={subKey} className="mb-1">
                  <strong>{formatKey(subKey)}:</strong> {String(subValue)}
                </div>
              ))
            ) : (
              String(item)
            )}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object" && value !== null) {
    return (
      <div>
        {Object.entries(value).map(([subKey, subValue]) => (
          <div key={subKey}>
            <strong>{formatKey(subKey)}:</strong> {String(subValue)}
          </div>
        ))}
      </div>
    );
  }
  return <p>{String(value)}</p>;
}

interface CredentialDetailDialogProps {
  jsonData: Record<string, unknown> | null;
  open: boolean;
  onClose: () => void;
}

export default function CredentialDetailDialog({
  jsonData,
  open,
  onClose,
}: CredentialDetailDialogProps) {
  const [showRawData, setShowRawData] = useState(false);

  if (!jsonData) return null;

  const attestationType =
    (jsonData.attestation_type as string) || "Attestation Details";
  const data = jsonData.data as Record<string, unknown> | undefined;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{attestationType}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {data &&
            Object.entries(data).map(([key, value]) => (
              <div key={key} className="mb-2">
                <h3 className="text-md font-semibold">{formatKey(key)}:</h3>
                <RenderValue value={value} />
              </div>
            ))}
          {!showRawData && (
            <Button variant="secondary" onClick={() => setShowRawData(true)}>
              See Raw Data
            </Button>
          )}
          {showRawData && (
            <>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
                {JSON.stringify(jsonData, null, 2)}
              </pre>
              <Button variant="secondary" onClick={() => setShowRawData(false)}>
                Hide Raw Data
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
