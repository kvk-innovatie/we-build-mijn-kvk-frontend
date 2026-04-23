import { useState, useRef, useEffect } from "react";
import { Send, ShieldCheck, Loader2 } from "lucide-react";
import { sendChatMessage } from "../../../services/n8n";
import type { AgentAction } from "../../../services/n8n";
import WalletConnectButton from "wallet-connect-button-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  action?: AgentAction;
  walletDone?: boolean;
  walletData?: Record<string, unknown>;
}

const credentials = [
  { name: "EBWOID", description: "European Business Wallet Organisation ID" },
  { name: "EUCC", description: "EU Company Certificate" },
  { name: "EU PoA", description: "EU Power of Attorney" },
  { name: "PoR", description: "Proof of Registration" },
];

export default function AiAgentTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef(`web-${crypto.randomUUID()}`);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(trimmed, sessionIdRef.current);
      if (typeof response === "object" && response.action) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.message || "Please scan the QR code below.",
            action: response,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response as string },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error instanceof Error ? error.message : "Failed to reach AI Agent"}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletSuccess = (msgIndex: number, attrs: Record<string, unknown>) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === msgIndex ? { ...msg, walletDone: true, walletData: attrs } : msg
      )
    );
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Credentials received successfully! Here is the verified data:",
        walletData: attrs,
        walletDone: true,
      },
    ]);
  };

  const renderWalletData = (data: Record<string, unknown>) => {
    const filtered = Object.entries(data).filter(
      ([key]) => !["cnf", "iss", "iat", "vct", "sub", "nbf", "jti", "status"].includes(key)
    );
    return (
      <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 space-y-1 text-xs">
        {filtered.map(([key, value]) => (
          <div key={key} className="flex justify-between py-1 border-b border-green-100 last:border-0">
            <span className="font-medium text-green-900 capitalize">
              {key.replace(/_/g, " ")}
            </span>
            <span className="text-green-800 text-right max-w-[60%]">
              {key === "exp" && typeof value === "number"
                ? new Date(value * 1000).toLocaleDateString()
                : typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Credentials section */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Credentials Access
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {credentials.map((cred) => (
            <div
              key={cred.name}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <ShieldCheck className="h-5 w-5 text-indigo-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {cred.name}
                </p>
                <p className="text-xs text-gray-500">{cred.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat section */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Send a message to start a conversation with the AI Agent
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {msg.content}

                {/* Wallet connect QR code */}
                {msg.action?.action === "wallet_connect" && !msg.walletDone && (
                  <div className="mt-3 wallet-connect-wrapper">
                    <WalletConnectButton
                      clientId="nlw_196823a7c1930f6117ad054188e82061"
                      apiKey="90d04cffa52851d4a777c7572919f42ff4260fde2ee6bd3934c3f37dbf616f3e"
                      {...(msg.action.walletType === "business" ? { business: true } : {})}
                      label={msg.action.walletType === "business"
                        ? "Share data from your business wallet"
                        : "Share data from your wallet"}
                      lang="en"
                      onSuccess={(attrs: Record<string, unknown>) =>
                        handleWalletSuccess(i, attrs)
                      }
                    />
                  </div>
                )}

                {/* Wallet verification complete */}
                {msg.walletDone && msg.walletData && renderWalletData(msg.walletData)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
