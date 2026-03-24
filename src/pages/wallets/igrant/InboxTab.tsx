import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MessageDialog, { type InboxMessage } from "./dialogs/MessageDialog";
import RequestDialog from "./dialogs/RequestDialog";

function formatMessageTitle(title: string): string {
  if (!title) return "Unknown";
  return title
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isRequestMessage(title: string): boolean {
  return title?.endsWith("_request") ?? false;
}

export default function InboxTab() {
  // UI-only: no backend calls. Messages would be populated when the backend exists.
  const [messages] = useState<InboxMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Inbox</h2>
        <p className="mt-1 text-sm text-gray-700">
          A list of all incoming events regarding your organisational wallet.
        </p>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Sender</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {formatMessageTitle(message.title)}
                </TableCell>
                <TableCell className="text-gray-500">{message.sender}</TableCell>
                <TableCell className="text-gray-500">{message.date}</TableCell>
                <TableCell>
                  <div className="flex space-x-4">
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => {
                        setSelectedMessage(message);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {messages.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  No messages in inbox
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedMessage && !isRequestMessage(selectedMessage.title) && (
        <MessageDialog
          message={selectedMessage}
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
      {selectedMessage && isRequestMessage(selectedMessage.title) && (
        <RequestDialog
          message={selectedMessage}
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </div>
  );
}
