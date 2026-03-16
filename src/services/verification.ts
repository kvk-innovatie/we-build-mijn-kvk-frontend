// In dev, use empty string so requests go through the Vite proxy (/api/...)
// In production, use the configured base URL
const API_BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_BASE_URL || "");
const MOCK_API = import.meta.env.VITE_MOCK_API === "true";

export type VerifiableCredentialType = "ebwoid" | "eucc" | "both";

export interface VerifyRequest {
  credentialType: VerifiableCredentialType;
}

export interface VerifyResponse {
  verificationId: string;
  presentationExchangeId: string;
  verificationUrl: string;
}

export interface VerificationStatusResponse {
  status: "request_sent" | "request_received" | "presentation_acked" | "failed";
  verified?: boolean;
  credential?: Record<string, unknown>;
  error?: string;
}

// --- Mock implementation ---

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let mockPollCount = 0;

async function mockRequestVerification(): Promise<VerifyResponse> {
  await delay(500);
  mockPollCount = 0;
  return {
    verificationId: "mock-verify-" + Date.now(),
    presentationExchangeId: "mock-pex-" + Date.now(),
    verificationUrl: "openid4vp://?request_uri=https://demo-api.igrant.io/mock-verification-request",
  };
}

async function mockGetVerificationStatus(): Promise<VerificationStatusResponse> {
  await delay(200);
  mockPollCount++;
  if (mockPollCount >= 3) {
    return {
      status: "presentation_acked",
      verified: true,
      credential: {
        id: "NLNHR.90001356",
        name: "Witbaard Feestartikelen",
        attestation_legal_category: "PUB-EAA",
        issuing_authority: "Kamer van Koophandel",
        issuing_country: "NL",
        date_of_expiry: "2027-02-12",
        trust_anchor: "https://tl.eidas.europa.eu/tl-browser/#/",
      },
    };
  }
  return { status: mockPollCount >= 2 ? "request_received" : "request_sent" };
}

// --- Real API implementation ---

async function realRequestVerification(
  request: VerifyRequest
): Promise<VerifyResponse> {
  const resp = await fetch(`${API_BASE}/api/credentials/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Verification request failed (${resp.status}): ${body}`);
  }
  return resp.json();
}

async function realGetVerificationStatus(
  presentationExchangeId: string
): Promise<VerificationStatusResponse> {
  const resp = await fetch(
    `${API_BASE}/api/credentials/verify/status/${presentationExchangeId}`
  );
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Status check failed (${resp.status}): ${body}`);
  }
  return resp.json();
}

// --- Exported functions (route to mock or real) ---

export async function requestVerification(
  request: VerifyRequest
): Promise<VerifyResponse> {
  if (MOCK_API) return mockRequestVerification();
  return realRequestVerification(request);
}

export async function getVerificationStatus(
  presentationExchangeId: string
): Promise<VerificationStatusResponse> {
  if (MOCK_API) return mockGetVerificationStatus();
  return realGetVerificationStatus(presentationExchangeId);
}
