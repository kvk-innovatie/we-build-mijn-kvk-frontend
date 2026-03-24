import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import KVKHeader from "@/components/KVKHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InboxTab from "./InboxTab";
import WalletTab from "./WalletTab";
import IssuerTab from "./IssuerTab";
import ActivitiesTab from "./ActivitiesTab";

export default function IGrantWalletPage() {
  return (
    <div className="min-h-screen bg-background">
      <KVKHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          iGrant Organisational Wallet
        </h1>

        <Tabs defaultValue="wallet">
          <TabsList>
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="issuer">Issuer</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>
          <TabsContent value="inbox" className="mt-6">
            <InboxTab />
          </TabsContent>
          <TabsContent value="wallet" className="mt-6">
            <WalletTab />
          </TabsContent>
          <TabsContent value="issuer" className="mt-6">
            <IssuerTab />
          </TabsContent>
          <TabsContent value="activities" className="mt-6">
            <ActivitiesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
