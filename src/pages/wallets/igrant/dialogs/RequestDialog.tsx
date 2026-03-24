import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { InboxMessage } from "./MessageDialog";

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

interface RequestDialogProps {
  message: InboxMessage | null;
  open: boolean;
  onClose: () => void;
}

export default function RequestDialog({
  message,
  open,
  onClose,
}: RequestDialogProps) {
  if (!message) return null;

  const attestationType =
    (message.content?.attestation_type as string) || "Attestation Details";
  const data = message.content?.data as Record<string, unknown> | undefined;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{attestationType}</DialogTitle>
        </DialogHeader>
        <p className="text-md mb-4">Would you like to share your credential?</p>
        <div className="space-y-4">
          {data &&
            Object.entries(data).map(([key, value]) => (
              <div key={key} className="mb-2">
                <h3 className="text-md font-semibold">{formatKey(key)}:</h3>
                <RenderValue value={value} />
              </div>
            ))}
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <Button
            className="bg-green-600 hover:bg-green-500"
            onClick={onClose}
          >
            Accept
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
