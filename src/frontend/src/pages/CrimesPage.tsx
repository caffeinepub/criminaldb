import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useApp } from "../context/AppContext";
import type { Crime, Severity } from "../types";

const SEV_COLORS: Record<Severity, string> = {
  Critical: "bg-red-900/40 text-red-300 border-red-700/50",
  Severe: "bg-red-500/15 text-red-400 border-red-500/30",
  Moderate: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Minor: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
};

function CrimeModal({
  crime,
  onClose,
  onSave,
}: {
  crime: Partial<Crime> | null;
  onClose: () => void;
  onSave: (c: Partial<Crime>) => void;
}) {
  const [form, setForm] = useState<Partial<Crime>>(crime || {});
  const set = (k: keyof Crime, v: string) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {crime?.id ? "Edit Crime" : "Report New Crime"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {[
            { label: "Crime Title", key: "title" },
            { label: "Location", key: "location" },
            { label: "Crime Date", key: "crimeDate", type: "date" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {f.label}
              </label>
              <input
                type={f.type || "text"}
                value={(form as Record<string, string>)[f.key] || ""}
                onChange={(e) => set(f.key as keyof Crime, e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Severity
            </label>
            <Select
              value={form.severity || ""}
              onValueChange={(v) => set("severity", v)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                {(
                  ["Minor", "Moderate", "Severe", "Critical"] as Severity[]
                ).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Description
            </label>
            <textarea
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm"
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CrimesPage() {
  const { crimes, setCrimes, user, addActivityLog } = useApp();
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("All");
  const [viewItem, setViewItem] = useState<Crime | null>(null);
  const [editItem, setEditItem] = useState<Partial<Crime> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const canEdit = user?.role === "Admin" || user?.role === "Officer";

  const filtered = crimes.filter((c) => {
    const ms =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    const mv = sevFilter === "All" || c.severity === sevFilter;
    return ms && mv;
  });

  const handleSave = (form: Partial<Crime>) => {
    if (form.id) {
      setCrimes(
        crimes.map((c) =>
          c.id === form.id ? ({ ...c, ...form } as Crime) : c,
        ),
      );
      addActivityLog(
        user!.username,
        "Updated crime record",
        "Crime",
        String(form.id),
      );
    } else {
      const n: Crime = {
        ...form,
        id: Date.now(),
        reportedById: user!.username,
      } as Crime;
      setCrimes([...crimes, n]);
      addActivityLog(
        user!.username,
        "Reported new crime",
        "Crime",
        String(n.id),
      );
    }
    setEditItem(null);
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
            placeholder="Search by title or location..."
            className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select value={sevFilter} onValueChange={setSevFilter}>
          <SelectTrigger className="w-40 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Severities</SelectItem>
            {(["Minor", "Moderate", "Severe", "Critical"] as Severity[]).map(
              (s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        {canEdit && (
          <button
            data-ocid="crimes.add.primary_button"
            onClick={() => setEditItem({})}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"
          >
            <Plus size={16} />
            Report Crime
          </button>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {[
                  "Title",
                  "Location",
                  "Date",
                  "Severity",
                  "Reported By",
                  "Actions",
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
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No crimes found.
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {c.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.location}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.crimeDate}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SEV_COLORS[c.severity]}`}
                    >
                      {c.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.reportedById}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewItem(c)}
                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                      >
                        <Eye size={14} />
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => setEditItem(c)}
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {user?.role === "Admin" && (
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editItem !== null && (
        <CrimeModal
          crime={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleSave}
        />
      )}

      {viewItem && (
        <Dialog open onOpenChange={() => setViewItem(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{viewItem.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24">Location:</span>
                <span>{viewItem.location}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24">Date:</span>
                <span>{viewItem.crimeDate}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24">Severity:</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${SEV_COLORS[viewItem.severity]}`}
                >
                  {viewItem.severity}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24">Reported By:</span>
                <span>{viewItem.reportedById}</span>
              </div>
              <div className="pt-2">
                <span className="text-muted-foreground block mb-1">
                  Description:
                </span>
                <p className="text-foreground">{viewItem.description}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Crime Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this crime record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  setCrimes(crimes.filter((c) => c.id !== deleteId));
                  setDeleteId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
