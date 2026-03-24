const API_BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_BASE_URL || "");

export interface WalletCredential {
  title: string;
  issuer: string;
  validUntil: string;
  raw: Record<string, unknown>;
}

export interface ReceiveCredentialResult {
  credentialId: string;
  authorizationRequest?: string;
}

export interface MatchedCredential {
  title: string;
  issuer: string;
  descriptorId: string;
  raw: Record<string, unknown>;
}

export async function listCredentials(): Promise<WalletCredential[]> {
  const resp = await fetch(`${API_BASE}/api/wallet/credentials`);
  if (!resp.ok) throw new Error(`Failed to list credentials (${resp.status})`);
  const data = await resp.json();
  const raw = Array.isArray(data.credential) ? data.credential : [];
  return raw.map((item: Record<string, unknown>) => {
    const configs = item.credentialConfigurations as Record<string, unknown> | undefined;
    const meta = configs?.credential_metadata as Record<string, unknown> | undefined;
    const display = (meta?.display as Record<string, unknown>[])?.[0];
    const cred = item.credential as Record<string, unknown> | undefined;
    const title = (display?.name as string) || "Unknown credential";
    const issuer = (cred?.issuing_authority as string) || "Unknown issuer";
    const exp = cred?.exp as number | undefined;
    const validUntil = exp ? new Date(exp * 1000).toLocaleDateString() : "No expiry";
    return { title, issuer, validUntil, raw: item };
  });
}

export async function deleteCredential(credentialId: string): Promise<void> {
  const resp = await fetch(`${API_BASE}/api/wallet/credentials/${credentialId}`, {
    method: "DELETE",
  });
  if (!resp.ok) throw new Error(`Failed to delete credential (${resp.status})`);
}

export async function receiveCredential(credentialOffer: string): Promise<ReceiveCredentialResult> {
  let offerValue: unknown = credentialOffer;
  try {
    offerValue = JSON.parse(credentialOffer);
  } catch {
    // Not JSON — use as-is (URI string)
  }
  const resp = await fetch(`${API_BASE}/api/wallet/credentials/receive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credentialOffer: offerValue }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Receive failed (${resp.status}): ${text}`);
  }
  const data = await resp.json();
  return {
    credentialId: data.credential.credentialId,
    authorizationRequest: data.credential.authorizationRequest || undefined,
  };
}

export async function completeAuthorization(credentialId: string, authorizationUrl: string): Promise<void> {
  const resp = await fetch(`${API_BASE}/api/wallet/credentials/${credentialId}/authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ authorizationUrl }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Authorization failed (${resp.status}): ${text}`);
  }
}

export async function pollDeferred(credentialId: string): Promise<string | undefined> {
  const resp = await fetch(`${API_BASE}/api/wallet/credentials/${credentialId}/receive-deferred`, {
    method: "PUT",
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Poll failed (${resp.status}): ${text}`);
  }
  const data = await resp.json();
  return data.credentialStatus || data.credential?.credentialStatus;
}

export async function acceptCredential(credentialId: string): Promise<void> {
  const resp = await fetch(`${API_BASE}/api/wallet/credentials/${credentialId}/accept`, {
    method: "PUT",
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Accept failed (${resp.status}): ${text}`);
  }
}

export async function receiveVerification(vpTokenQrCode: string): Promise<string> {
  const resp = await fetch(`${API_BASE}/api/wallet/verification/receive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vpTokenQrCode }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Receive verification failed (${resp.status}): ${text}`);
  }
  const data = await resp.json();
  const presentationId = data.presentation?.presentationId || data.presentationId;
  if (!presentationId) throw new Error("No presentationId returned");
  return presentationId;
}

export async function filterCredentials(presentationId: string): Promise<MatchedCredential[]> {
  const resp = await fetch(`${API_BASE}/api/wallet/verification/${presentationId}/filter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Filter failed (${resp.status}): ${text}`);
  }
  const data = await resp.json();
  const descriptors = data.inputDescriptors || data.credentials || [];
  const matched: MatchedCredential[] = [];
  for (const desc of descriptors) {
    for (const m of (desc.matchedCredentials || [])) {
      matched.push({
        title: m.type || m.vct || "Credential",
        issuer: "Matched credential",
        descriptorId: desc.id,
        raw: m,
      });
    }
  }
  return matched;
}

export async function sendPresentation(presentationId: string, inputDescriptors: Array<{ id: string; credentialId: string }>): Promise<void> {
  const resp = await fetch(`${API_BASE}/api/wallet/verification/${presentationId}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputDescriptors }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Send presentation failed (${resp.status}): ${text}`);
  }
}
