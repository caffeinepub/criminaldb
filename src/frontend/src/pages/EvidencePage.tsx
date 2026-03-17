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
import type { Evidence, EvidenceType } from "../types";

const TYPE_COLORS: Record<EvidenceType, string> = {
  Physical: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Digital: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Documentary: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Testimonial: "bg-green-500/15 text-green-500 border-green-500/30",
  Forensic: "bg-red-500/15 text-red-400 border-red-500/30",
};

const EVIDENCE_TYPES: EvidenceType[] = [
  "Physical",
  "Digital",
  "Documentary",
  "Testimonial",
  "Forensic",
];

function EvidenceModal({
  item,
  onClose,
  onSave,
  cases,
}: {
  item: Partial<Evidence>;
  onClose: () => void;
  onSave: (e: Partial<Evidence>) => void;
  cases: { id: number; title: string }[];
}) {
  const [form, setForm] = useState<Partial<Evidence>>(item);
  const set = (k: keyof Evidence, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {item.id ? "Edit Evidence" : "Add Evidence"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Case
            </label>
            <Select
              value={String(form.caseId || "")}
              onValueChange={(v) => set("caseId", +v)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    Case #{c.id} - {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Evidence Type
            </label>
            <Select
              value={form.evidenceType || ""}
              onValueChange={(v) => set("evidenceType", v)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {EVIDENCE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {[
            { label: "Description", key: "description" },
            { label: "Storage Location", key: "storageLocation" },
            { label: "Collected Date", key: "collectedDate", type: "date" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {f.label}
              </label>
              <input
                type={f.type || "text"}
                value={(form as Record<string, string>)[f.key] || ""}
                onChange={(e) => set(f.key as keyof Evidence, e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
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

export default function EvidencePage() {
  const { evidence, setEvidence, cases, crimes, user, addActivityLog } =
    useApp();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [caseFilter, setCaseFilter] = useState("All");
  const [editItem, setEditItem] = useState<Partial<Evidence> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const canAdd = user?.role !== "Investigator" || true; // Investigator can add
  const caseMap = cases.reduce<Record<number, string>>((acc, c) => {
    const crime = crimes.find((cr) => cr.id === c.crimeId);
    acc[c.id] = crime?.title || `Case #${c.id}`;
    return acc;
  }, {});

  const filtered = evidence.filter((e) => {
    const ms =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.storageLocation.toLowerCase().includes(search.toLowerCase());
    const mt = typeFilter === "All" || e.evidenceType === typeFilter;
    const mc = caseFilter === "All" || String(e.caseId) === caseFilter;
    return ms && mt && mc;
  });

  const handleSave = (form: Partial<Evidence>) => {
    if (form.id) {
      setEvidence(
        evidence.map((e) =>
          e.id === form.id ? ({ ...e, ...form } as Evidence) : e,
        ),
      );
    } else {
      const n: Evidence = {
        ...form,
        id: Date.now(),
        collectedById: user!.username,
      } as Evidence;
      setEvidence([...evidence, n]);
      addActivityLog(
        user!.username,
        "Added evidence",
        "Evidence",
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
            placeholder="Search evidence..."
            className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            {EVIDENCE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={caseFilter} onValueChange={setCaseFilter}>
          <SelectTrigger className="w-44 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Cases</SelectItem>
            {cases.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                Case #{c.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canAdd && (
          <button
            data-ocid="evidence.add.primary_button"
            onClick={() => setEditItem({})}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"
          >
            <Plus size={16} />
            Add Evidence
          </button>
        )}
      </div>

      <div
        className="bg-card rounded-xl border border-border overflow-hidden"
        data-ocid="evidence.table"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {[
                  "ID",
                  "Case",
                  "Type",
                  "Description",
                  "Storage Location",
                  "Collected",
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
                    No evidence found.
                  </td>
                </tr>
              )}
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    #{e.id}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Case #{e.caseId}{" "}
                    <span className="hidden md:inline">
                      - {caseMap[e.caseId] || ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TYPE_COLORS[e.evidenceType]}`}
                    >
                      {e.evidenceType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground max-w-xs truncate">
                    {e.description}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {e.storageLocation}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {e.collectedDate}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditItem(e)}
                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"
                      >
                        <Pencil size={14} />
                      </button>
                      {user?.role === "Admin" && (
                        <button
                          onClick={() => setDeleteId(e.id)}
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
        <EvidenceModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleSave}
          cases={cases.map((c) => ({ id: c.id, title: caseMap[c.id] }))}
        />
      )}

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Evidence?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this evidence record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  setEvidence(evidence.filter((e) => e.id !== deleteId));
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
