import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
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
import type { Criminal, CriminalStatus, RiskLevel } from "../types";

const STATUS_COLORS: Record<CriminalStatus, string> = {
  Active: "bg-red-500/15 text-red-500 border-red-500/30",
  Arrested: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  Released: "bg-green-500/15 text-green-500 border-green-500/30",
  Deceased: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const RISK_COLORS: Record<RiskLevel, string> = {
  Critical: "bg-red-900/40 text-red-300 border-red-700/50",
  High: "bg-red-500/15 text-red-400 border-red-500/30",
  Medium: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  Low: "bg-green-500/15 text-green-500 border-green-500/30",
};

const PAGE_SIZE = 10;

function CriminalModal({
  criminal,
  onClose,
  onSave,
}: {
  criminal: Partial<Criminal> | null;
  onClose: () => void;
  onSave: (c: Partial<Criminal>) => void;
}) {
  const isNew = !criminal?.id;
  const [form, setForm] = useState<Partial<Criminal>>(criminal || {});
  const set = (k: keyof Criminal, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg" data-ocid="criminals.add.modal">
        <DialogHeader>
          <DialogTitle>
            {isNew ? "Add Criminal Record" : "Edit Criminal Record"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          {[
            { label: "Full Name", key: "name", type: "text" },
            { label: "Age", key: "age", type: "number" },
            { label: "Address", key: "address", type: "text" },
            { label: "Crime Type", key: "crimeType", type: "text" },
          ].map((f) => (
            <div
              key={f.key}
              className={f.key === "address" ? "col-span-2" : ""}
            >
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {f.label}
              </label>
              <input
                type={f.type}
                value={(form as Record<string, string | number>)[f.key] || ""}
                onChange={(e) =>
                  set(
                    f.key as keyof Criminal,
                    f.type === "number" ? +e.target.value : e.target.value,
                  )
                }
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Gender
            </label>
            <Select
              value={form.gender || ""}
              onValueChange={(v) => set("gender", v)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Status
            </label>
            <Select
              value={form.status || ""}
              onValueChange={(v) => set("status", v)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {(
                  [
                    "Active",
                    "Arrested",
                    "Released",
                    "Deceased",
                  ] as CriminalStatus[]
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
              Risk Level
            </label>
            <Select
              value={form.riskLevel || ""}
              onValueChange={(v) => set("riskLevel", v)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {(["Low", "Medium", "High", "Critical"] as RiskLevel[]).map(
                  (r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Photo URL
            </label>
            <input
              type="text"
              value={form.photoUrl || ""}
              onChange={(e) => set("photoUrl", e.target.value)}
              placeholder="https://..."
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <DialogFooter>
          <button
            data-ocid="criminals.add.cancel_button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent"
          >
            Cancel
          </button>
          <button
            data-ocid="criminals.add.save_button"
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

export default function CriminalsPage() {
  const { criminals, setCriminals, user, addActivityLog } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [editItem, setEditItem] = useState<Partial<Criminal> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const canEdit = user?.role === "Admin" || user?.role === "Officer";
  const canDelete = user?.role === "Admin";

  const filtered = criminals.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.crimeType.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    const matchRisk = riskFilter === "All" || c.riskLevel === riskFilter;
    return matchSearch && matchStatus && matchRisk;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = (form: Partial<Criminal>) => {
    if (form.id) {
      setCriminals(
        criminals.map((c) =>
          c.id === form.id ? ({ ...c, ...form } as Criminal) : c,
        ),
      );
      addActivityLog(
        user!.username,
        "Updated criminal record",
        "Criminal",
        String(form.id),
      );
    } else {
      const newItem: Criminal = {
        ...form,
        id: Date.now(),
        createdAt: new Date().toISOString().split("T")[0],
      } as Criminal;
      setCriminals([...criminals, newItem]);
      addActivityLog(
        user!.username,
        "Created criminal record",
        "Criminal",
        String(newItem.id),
      );
    }
    setModalOpen(false);
    setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      setCriminals(criminals.filter((c) => c.id !== deleteId));
      addActivityLog(
        user!.username,
        "Deleted criminal record",
        "Criminal",
        String(deleteId),
      );
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            data-ocid="criminals.search.search_input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or crime type..."
            className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger
            className="w-36 text-sm"
            data-ocid="criminals.filter.select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            {(
              ["Active", "Arrested", "Released", "Deceased"] as CriminalStatus[]
            ).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={riskFilter}
          onValueChange={(v) => {
            setRiskFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Risk Levels</SelectItem>
            {(["Low", "Medium", "High", "Critical"] as RiskLevel[]).map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canEdit && (
          <button
            data-ocid="criminals.add.primary_button"
            onClick={() => {
              setEditItem({});
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"
          >
            <Plus size={16} />
            Add Criminal
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table data-ocid="criminals.table" className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Gender/Age
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Crime Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Risk
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                    data-ocid="criminals.empty_state"
                  >
                    No criminal records found.
                  </td>
                </tr>
              )}
              {paged.map((c, i) => (
                <tr
                  key={c.id}
                  data-ocid={`criminals.item.${(page - 1) * PAGE_SIZE + i + 1}`}
                  className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {c.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {c.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {c.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {c.gender}, {c.age}
                  </td>
                  <td className="px-4 py-3 text-foreground">{c.crimeType}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[c.status]}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${RISK_COLORS[c.riskLevel]}`}
                    >
                      {c.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && (
                        <button
                          data-ocid={`criminals.edit_button.${(page - 1) * PAGE_SIZE + i + 1}`}
                          onClick={() => {
                            setEditItem(c);
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          data-ocid={`criminals.delete_button.${(page - 1) * PAGE_SIZE + i + 1}`}
                          onClick={() => setDeleteId(c.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {filtered.length} records
            </span>
            <div className="flex gap-2">
              <button
                data-ocid="criminals.pagination_prev"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded border border-border text-xs disabled:opacity-40 hover:bg-accent"
              >
                Prev
              </button>
              <span className="px-3 py-1.5 text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
              <button
                data-ocid="criminals.pagination_next"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded border border-border text-xs disabled:opacity-40 hover:bg-accent"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && editItem !== null && (
        <CriminalModal
          criminal={editItem}
          onClose={() => {
            setModalOpen(false);
            setEditItem(null);
          }}
          onSave={handleSave}
        />
      )}

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Criminal Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The record will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="criminals.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="criminals.delete.confirm_button"
              onClick={handleDelete}
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
