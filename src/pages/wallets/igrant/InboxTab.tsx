import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
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
    <div className="mt-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Inbox</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all incoming events regarding your organisational wallet.</p>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Title</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Sender</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {messages.map((message, index) => (
                    <tr key={index} className="cursor-pointer">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {formatMessageTitle(message.title)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{message.sender}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{message.date}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 flex space-x-4">
                        <button
                          onClick={() => { setSelectedMessage(message); setIsDialogOpen(true); }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
