const N8N_WEBHOOK_URL =
  import.meta.env.VITE_N8N_WEBHOOK_URL || "/n8n/webhook/web-qa";

export interface AgentAction {
  action: "wallet_connect";
  walletType: "personal" | "business";
  message: string;
}

export type ChatResponse = string | AgentAction;

export async function sendChatMessage(
  message: string,
  sessionId: string
): Promise<ChatResponse> {
  const resp = await fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId }),
  });
  if (!resp.ok)
    throw new Error(`n8n error (${resp.status}): ${await resp.text()}`);
  const text = await resp.text();
  if (!text) return "(empty response from n8n)";
  try {
    const data = JSON.parse(text);
    const output = data.output ?? data.response ?? data.message ?? JSON.stringify(data);
    if (typeof output === "string") {
      try {
        const parsed = JSON.parse(output);
        if (parsed.action) return parsed as AgentAction;
      } catch {
        // not structured JSON, return as plain text
      }
    }
    return output;
  } catch {
    return text;
  }
}
