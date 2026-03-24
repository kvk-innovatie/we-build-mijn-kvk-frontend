import type { InboxMessage } from "./MessageDialog";

function formatKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function RenderValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-5">
        {value.map((item, index) => (
          <li key={index}>
            {typeof item === "object" && item !== null
              ? Object.entries(item).map(([subKey, subValue]) => (
                  <div key={subKey} className="mb-1">
                    <strong>{formatKey(subKey)}:</strong> {String(subValue)}
                  </div>
                ))
              : String(item)}
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
  if (!open || !message) return null;

  const attestationType =
    (message.content?.attestation_type as string) || "Attestation Details";
  const data = message.content?.data as Record<string, unknown> | undefined;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[calc(100vh-20px)] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">{attestationType}</h2>
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
        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-green-600 text-white rounded mr-2">
            Accept
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
