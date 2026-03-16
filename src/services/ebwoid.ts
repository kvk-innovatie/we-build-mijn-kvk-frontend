// In dev, use empty string so requests go through the Vite proxy (/api/...)
// In production, use the configured base URL
const API_BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_BASE_URL || "");
const MOCK_API = import.meta.env.VITE_MOCK_API === "true";

export type WalletProvider = "igrant" | "procivis";

export interface IssueRequest {
  provider: WalletProvider;
  credentialType: "ebwoid" | "eucc";
  subject: {
    identifier: string;
    legalName: string;
  };
}

export interface IssueResponse {
  issuanceId: string;
  status: string;
  credentialOffer?: string | Record<string, unknown>;
}

export interface StatusResponse {
  status:
    | "issuing"
    | "delivering"
    | "receiving"
    | "polling"
    | "accepting"
    | "accepted"
    | "failed";
  credential?: Record<string, unknown>;
  error?: string;
}

// --- Mock implementation ---

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let mockStatus: StatusResponse["status"] = "issuing";

async function mockIssueCredential(): Promise<IssueResponse> {
  await delay(500);
  return {
    issuanceId: "mock-" + Date.now(),
    status: "offer_created",
    credentialOffer: "openid-credential-offer://?credential_offer_uri=https://demo-api.igrant.io/mock-offer",
  };
}

async function mockGetIssuanceStatus(): Promise<StatusResponse> {
  await delay(200);
  return { status: mockStatus };
}

// --- Real API implementation ---

async function realIssueCredential(
  request: IssueRequest
): Promise<IssueResponse> {
  const resp = await fetch(`${API_BASE}/api/credentials/issue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Issue failed (${resp.status}): ${body}`);
  }
  return resp.json();
}

async function realGetIssuanceStatus(
  issuanceId: string
): Promise<StatusResponse> {
  const resp = await fetch(
    `${API_BASE}/api/credentials/status/${issuanceId}`
  );
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Status check failed (${resp.status}): ${body}`);
  }
  return resp.json();
}

// --- Exported functions (route to mock or real) ---

export async function issueCredential(
  request: IssueRequest
): Promise<IssueResponse> {
  if (MOCK_API) return mockIssueCredential();
  return realIssueCredential(request);
}

export async function getIssuanceStatus(
  issuanceId: string
): Promise<StatusResponse> {
  if (MOCK_API) return mockGetIssuanceStatus();
  return realGetIssuanceStatus(issuanceId);
}
