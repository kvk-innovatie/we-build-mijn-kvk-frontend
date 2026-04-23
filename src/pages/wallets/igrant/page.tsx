import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Wallet,
  IdCard,
  Bot,
  ArrowLeft,
} from "lucide-react";
import InboxTab from "./InboxTab";
import WalletTab from "./WalletTab";
import IssuerTab from "./IssuerTab";
import AiAgentTab from "./AiAgentTab";

type Tab = "inbox" | "wallet" | "issuer" | "ai-agent";

const navItems: { name: string; tab: Tab; icon: typeof Mail }[] = [
  { name: "Inbox", tab: "inbox", icon: Mail },
  { name: "Wallet", tab: "wallet", icon: Wallet },
  { name: "Issuer", tab: "issuer", icon: IdCard },
  { name: "AI Agent", tab: "ai-agent", icon: Bot },
];

export default function IGrantWalletPage() {
  const [activeTab, setActiveTab] = useState<Tab>("inbox");

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="h-screen flex flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 w-64 shrink-0">
        {/* Logo */}
        <div className="mt-4 flex justify-center h-32 shrink-0 items-center">
          <img
            className="h-32 w-auto"
            src="/igrant2.png"
            alt="iGrant.io"
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul className="-mx-2 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = activeTab === item.tab;
                  return (
                    <li key={item.tab}>
                      <button
                        onClick={() => setActiveTab(item.tab)}
                        className={`${
                          isCurrent
                            ? "bg-gray-50 text-indigo-600"
                            : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                        } group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 w-full`}
                      >
                        <Icon
                          className={`${
                            isCurrent
                              ? "text-indigo-600"
                              : "text-gray-400 group-hover:text-indigo-600"
                          } h-6 w-6 shrink-0`}
                        />
                        {item.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>

            {/* Back to KVK link at bottom */}
            <li className="mt-auto -mx-6">
              <Link
                to="/"
                className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50 w-full"
              >
                <ArrowLeft className="h-5 w-5 text-gray-400" />
                <span>Back to WE BUILD</span>
              </Link>
            </li>

            {/* Profile */}
            {/* <li className="-mx-6 mb-0">
              <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                <img
                  className="h-8 w-8 rounded-full bg-gray-50"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
                <span>Jan Klaassen</span>
              </div>
            </li> */}
          </ul>
        </nav>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "inbox" && <InboxTab />}
        {activeTab === "wallet" && <WalletTab />}
        {activeTab === "issuer" && <IssuerTab />}
        {activeTab === "ai-agent" && <AiAgentTab />}
      </div>
    </div>
  );
}
