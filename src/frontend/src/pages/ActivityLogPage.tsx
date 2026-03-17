import { Lock, Search } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useApp } from "../context/AppContext";

const ENTITY_TYPES = [
  "Criminal",
  "Crime",
  "Case",
  "Evidence",
  "Officer",
  "ArrestRecord",
  "User",
  "System",
];

export default function ActivityLogPage() {
  const { user, activityLogs } = useApp();
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("All");

  if (user?.role !== "Admin") {
    return (
      <div
        className="flex flex-col items-center justify-center h-full p-8"
        data-ocid="activitylog.error_state"
      >
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <Lock size={28} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Access Denied
        </h2>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          Activity logs are restricted to administrators only. Contact your
          system admin for access.
        </p>
      </div>
    );
  }

  const filtered = activityLogs.filter((l) => {
    const ms =
      l.userId.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase());
    const me = entityFilter === "All" || l.entityType === entityFilter;
    return ms && me;
  });

  const entityTypeColor: Record<string, string> = {
    Criminal: "text-red-400",
    Crime: "text-orange-400",
    Case: "text-blue-400",
    Evidence: "text-purple-400",
    Officer: "text-green-400",
    ArrestRecord: "text-yellow-500",
    User: "text-cyan-400",
    System: "text-gray-400",
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user or action..."
            className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-40 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Entity Types</SelectItem>
            {ENTITY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className="bg-card rounded-xl border border-border overflow-hidden"
        data-ocid="activitylog.table"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {[
                  "Timestamp",
                  "User",
                  "Action",
                  "Entity Type",
                  "Entity ID",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No activity logs found.
                  </td>
                </tr>
              )}
              {filtered.map((l, i) => (
                <tr
                  key={l.id}
                  data-ocid={`activitylog.item.${i + 1}`}
                  className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                >
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                      {l.userId}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{l.action}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium ${entityTypeColor[l.entityType] || "text-muted-foreground"}`}
                    >
                      {l.entityType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {l.entityId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
