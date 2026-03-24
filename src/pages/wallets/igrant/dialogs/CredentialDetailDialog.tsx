import { useState } from "react";

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

  if (!open || !jsonData) return null;

  const attestationType =
    (jsonData.attestation_type as string) || "Attestation Details";
  const data = jsonData.data as Record<string, unknown> | undefined;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[calc(100vh-20px)] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">{attestationType}</h2>
        <div className="space-y-4">
          {data &&
            Object.entries(data).map(([key, value]) => (
              <div key={key} className="mb-2">
                <h3 className="text-md font-semibold">{formatKey(key)}:</h3>
                <RenderValue value={value} />
              </div>
            ))}
          {!showRawData && (
            <button
              onClick={() => setShowRawData(true)}
              className="px-4 py-2 bg-gray-200 text-black rounded"
            >
              See Raw Data
            </button>
          )}
          {showRawData && (
            <>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
                {JSON.stringify(jsonData, null, 2)}
              </pre>
              <button
                onClick={() => setShowRawData(false)}
                className="px-4 py-2 bg-gray-200 text-black rounded"
              >
                Hide Raw Data
              </button>
            </>
          )}
        </div>
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
