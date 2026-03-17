import { Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import type { ArrestRecord } from "../types";

function ArrestModal({
  item,
  onClose,
  onSave,
  criminals,
  officers,
}: {
  item: Partial<ArrestRecord>;
  onClose: () => void;
  onSave: (a: Partial<ArrestRecord>) => void;
  criminals: { id: number; name: string }[];
  officers: { id: number; name: string }[];
}) {
  const [form, setForm] = useState<Partial<ArrestRecord>>(item);
  const set = (k: keyof ArrestRecord, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {item.id ? "Edit Arrest Record" : "File Arrest Record"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Criminal
            </label>
            <Select
              value={String(form.criminalId || "")}
              onValueChange={(v) => set("criminalId", +v)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select criminal" />
              </SelectTrigger>
              <SelectContent>
                {criminals.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Arresting Officer
            </label>
            <Select
              value={String(form.officerId || "")}
              onValueChange={(v) => set("officerId", +v)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select officer" />
              </SelectTrigger>
              <SelectContent>
                {officers.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Arrest Date
            </label>
            <input
              type="date"
              value={form.arrestDate || ""}
              onChange={(e) => set("arrestDate", e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Location
            </label>
            <input
              type="text"
              value={form.location || ""}
              onChange={(e) => set("location", e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Notes
            </label>
            <textarea
              value={form.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
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

export default function ArrestsPage() {
  const {
    arrestRecords,
    setArrestRecords,
    criminals,
    officers,
    user,
    addActivityLog,
  } = useApp();
  const [search, setSearch] = useState("");
  const [criminalFilter, setCriminalFilter] = useState("All");
  const [editItem, setEditItem] = useState<Partial<ArrestRecord> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const canEdit = user?.role === "Admin" || user?.role === "Officer";

  const filtered = arrestRecords.filter((a) => {
    const criminal = criminals.find((c) => c.id === a.criminalId);
    const officer = officers.find((o) => o.id === a.officerId);
    const ms =
      a.location.toLowerCase().includes(search.toLowerCase()) ||
      (criminal?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (officer?.name || "").toLowerCase().includes(search.toLowerCase());
    const mc =
      criminalFilter === "All" || String(a.criminalId) === criminalFilter;
    return ms && mc;
  });

  const handleSave = (form: Partial<ArrestRecord>) => {
    if (form.id) {
      setArrestRecords(
        arrestRecords.map((a) =>
          a.id === form.id ? ({ ...a, ...form } as ArrestRecord) : a,
        ),
      );
    } else {
      const n: ArrestRecord = { ...form, id: Date.now() } as ArrestRecord;
      setArrestRecords([...arrestRecords, n]);
      addActivityLog(
        user!.username,
        "Filed arrest record",
        "ArrestRecord",
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
            placeholder="Search arrest records..."
            className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select value={criminalFilter} onValueChange={setCriminalFilter}>
          <SelectTrigger className="w-44 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Criminals</SelectItem>
            {criminals.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canEdit && (
          <button
            onClick={() => setEditItem({})}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"
          >
            <Plus size={16} />
            File Arrest
          </button>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {[
                  "ID",
                  "Criminal",
                  "Arresting Officer",
                  "Date",
                  "Location",
                  "Notes",
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
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No arrest records found.
                  </td>
                </tr>
              )}
              {filtered.map((a, i) => {
                const criminal = criminals.find((c) => c.id === a.criminalId);
                const officer = officers.find((o) => o.id === a.officerId);
                return (
                  <tr
                    key={a.id}
                    data-ocid={`arrests.item.${i + 1}`}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      #{a.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {criminal?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {officer?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.arrestDate}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.location}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                      {a.notes}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {canEdit && (
                          <button
                            onClick={() => setEditItem(a)}
                            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {user?.role === "Admin" && (
                          <button
                            onClick={() => setDeleteId(a.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editItem !== null && (
        <ArrestModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleSave}
          criminals={criminals}
          officers={officers}
        />
      )}

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Arrest Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this arrest record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  setArrestRecords(
                    arrestRecords.filter((a) => a.id !== deleteId),
                  );
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
