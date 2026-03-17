import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
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
import type { Case, CaseStatus } from "../types";

const STATUS_COLORS: Record<CaseStatus, string> = {
  Open: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Under Investigation":
    "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  Closed: "bg-green-500/15 text-green-500 border-green-500/30",
  Dismissed: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

function CaseModal({
  item,
  onClose,
  onSave,
  crimes,
  criminals,
  officers,
}: {
  item: Partial<Case>;
  onClose: () => void;
  onSave: (c: Partial<Case>) => void;
  crimes: { id: number; title: string }[];
  criminals: { id: number; name: string }[];
  officers: { id: number; name: string }[];
}) {
  const [form, setForm] = useState<Partial<Case>>(item);
  const set = (k: keyof Case, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item.id ? "Edit Case" : "Create Case"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Linked Crime
            </label>
            <Select
              value={String(form.crimeId || "")}
              onValueChange={(v) => set("crimeId", +v)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select crime" />
              </SelectTrigger>
              <SelectContent>
                {crimes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
              Assigned Officer
            </label>
            <Select
              value={String(form.assignedOfficerId || "")}
              onValueChange={(v) => set("assignedOfficerId", +v)}
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
              Case Status
            </label>
            <Select
              value={form.caseStatus || ""}
              onValueChange={(v) => set("caseStatus", v)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {(
                  [
                    "Open",
                    "Under Investigation",
                    "Closed",
                    "Dismissed",
                  ] as CaseStatus[]
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
              Court Date
            </label>
            <input
              type="date"
              value={form.courtDate || ""}
              onChange={(e) => set("courtDate", e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
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

export default function CasesPage() {
  const {
    cases,
    setCases,
    crimes,
    criminals,
    officers,
    evidence,
    user,
    addActivityLog,
  } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<Partial<Case> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const canEdit =
    user?.role === "Admin" ||
    user?.role === "Officer" ||
    user?.role === "Investigator";

  const filtered = cases.filter((c) => {
    const crime = crimes.find((cr) => cr.id === c.crimeId);
    const criminal = criminals.find((cr) => cr.id === c.criminalId);
    const ms =
      String(c.id).includes(search) ||
      (crime?.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (criminal?.name || "").toLowerCase().includes(search.toLowerCase());
    const mv = statusFilter === "All" || c.caseStatus === statusFilter;
    return ms && mv;
  });

  const handleSave = (form: Partial<Case>) => {
    if (form.id) {
      setCases(
        cases.map((c) => (c.id === form.id ? ({ ...c, ...form } as Case) : c)),
      );
      addActivityLog(user!.username, "Updated case", "Case", String(form.id));
    } else {
      const n: Case = { ...form, id: Date.now() } as Case;
      setCases([...cases, n]);
      addActivityLog(user!.username, "Created case", "Case", String(n.id));
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
            placeholder="Search cases..."
            className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-44 text-sm"
            data-ocid="cases.filter.select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            {(
              [
                "Open",
                "Under Investigation",
                "Closed",
                "Dismissed",
              ] as CaseStatus[]
            ).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canEdit && (
          <button
            data-ocid="cases.add.primary_button"
            onClick={() => setEditItem({})}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"
          >
            <Plus size={16} />
            New Case
          </button>
        )}
      </div>

      <div
        className="bg-card rounded-xl border border-border overflow-hidden"
        data-ocid="cases.table"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {[
                  "Case ID",
                  "Crime",
                  "Criminal",
                  "Officer",
                  "Status",
                  "Court Date",
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
                    No cases found.
                  </td>
                </tr>
              )}
              {filtered.map((c, i) => {
                const crime = crimes.find((cr) => cr.id === c.crimeId);
                const criminal = criminals.find((cr) => cr.id === c.criminalId);
                const officer = officers.find(
                  (o) => o.id === c.assignedOfficerId,
                );
                const caseEvidence = evidence.filter((e) => e.caseId === c.id);
                const expanded = expandedId === c.id;
                return [
                  <tr
                    key={c.id}
                    data-ocid={`cases.item.${i + 1}`}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expanded ? null : c.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      #{c.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {crime?.title || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {criminal?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {officer?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[c.caseStatus]}`}
                      >
                        {c.caseStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.courtDate || "-"}
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedId(expanded ? null : c.id)}
                          className="p-1.5 rounded hover:bg-accent text-muted-foreground"
                        >
                          {expanded ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => setEditItem(c)}
                            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"
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
                  </tr>,
                  expanded && (
                    <tr key={`${c.id}-expand`} className="bg-muted/30">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="text-sm mb-3 text-muted-foreground">
                          {c.description}
                        </div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                          Evidence ({caseEvidence.length})
                        </div>
                        {caseEvidence.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            No evidence recorded.
                          </span>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {caseEvidence.map((ev) => (
                              <div
                                key={ev.id}
                                className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-border/50"
                              >
                                <span className="text-xs font-medium text-blue-400">
                                  {ev.evidenceType}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {ev.description}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ),
                ];
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editItem !== null && (
        <CaseModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleSave}
          crimes={crimes}
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
            <AlertDialogTitle>Delete Case?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this case.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  setCases(cases.filter((c) => c.id !== deleteId));
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
