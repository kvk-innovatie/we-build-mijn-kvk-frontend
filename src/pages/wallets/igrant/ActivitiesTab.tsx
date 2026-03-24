import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const activities = [
  { event: "Issuance: OrgWallet Full Access to Jan Klaassen", date: "29-08-2025" },
  { event: "Login: Jan Klaassen", date: "29-08-2025" },
];

export default function ActivitiesTab() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Activities</h2>
        <p className="mt-1 text-sm text-gray-700">
          A list of all activities of this organisational wallet.
        </p>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">View</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{activity.event}</TableCell>
                <TableCell>{activity.date}</TableCell>
                <TableCell className="text-right">
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                    View
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
