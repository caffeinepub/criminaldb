import { Pencil, Plus, Search, Shield, Trash2 } from "lucide-react";
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
import type { OfficerRank, PoliceOfficer } from "../types";

const RANK_COLORS: Record<OfficerRank, string> = {
  Commissioner: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  Inspector: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Sergeant: "bg-green-500/15 text-green-500 border-green-500/30",
  Constable: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const RANKS: OfficerRank[] = [
  "Commissioner",
  "Inspector",
  "Sergeant",
  "Constable",
];

function OfficerModal({
  item,
  onClose,
  onSave,
}: {
  item: Partial<PoliceOfficer>;
  onClose: () => void;
  onSave: (o: Partial<PoliceOfficer>) => void;
}) {
  const [form, setForm] = useState<Partial<PoliceOfficer>>(item);
  const set = (k: keyof PoliceOfficer, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item.id ? "Edit Officer" : "Add Officer"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {[
            { label: "Full Name", key: "name" },
            { label: "Badge Number", key: "badgeNumber" },
            { label: "Station", key: "station" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {f.label}
              </label>
              <input
                type="text"
                value={(form as Record<string, string>)[f.key] || ""}
                onChange={(e) =>
                  set(f.key as keyof PoliceOfficer, e.target.value)
                }
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Rank
            </label>
            <Select
              value={form.rank || ""}
              onValueChange={(v) => set("rank", v)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select rank" />
              </SelectTrigger>
              <SelectContent>
                {RANKS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

export default function OfficersPage() {
  const { officers, setOfficers, user, addActivityLog } = useApp();
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState("All");
  const [editItem, setEditItem] = useState<Partial<PoliceOfficer> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const canEdit = user?.role === "Admin";

  const filtered = officers.filter((o) => {
    const ms =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.badgeNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.station.toLowerCase().includes(search.toLowerCase());
    const mr = rankFilter === "All" || o.rank === rankFilter;
    return ms && mr;
  });

  const handleSave = (form: Partial<PoliceOfficer>) => {
    if (form.id) {
      setOfficers(
        officers.map((o) =>
          o.id === form.id ? ({ ...o, ...form } as PoliceOfficer) : o,
        ),
      );
      addActivityLog(
        user!.username,
        "Updated officer",
        "Officer",
        String(form.id),
      );
    } else {
      const n: PoliceOfficer = { ...form, id: Date.now() } as PoliceOfficer;
      setOfficers([...officers, n]);
      addActivityLog(
        user!.username,
        "Added police officer",
        "Officer",
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
            placeholder="Search officers..."
            className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select value={rankFilter} onValueChange={setRankFilter}>
          <SelectTrigger className="w-36 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Ranks</SelectItem>
            {RANKS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canEdit && (
          <button
            data-ocid="officers.add.primary_button"
            onClick={() => setEditItem({})}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"
          >
            <Plus size={16} />
            Add Officer
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            No officers found.
          </div>
        )}
        {filtered.map((o) => (
          <div
            key={o.id}
            className="bg-card rounded-xl border border-border p-5 hover:border-blue-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <Shield size={22} className="text-blue-400" />
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${RANK_COLORS[o.rank]}`}
              >
                {o.rank}
              </span>
            </div>
            <div className="font-semibold text-foreground text-sm mb-1">
              {o.name}
            </div>
            <div className="text-xs text-muted-foreground mb-0.5">
              Badge: {o.badgeNumber}
            </div>
            <div className="text-xs text-muted-foreground">{o.station}</div>
            {canEdit && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => setEditItem(o)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-border text-xs hover:bg-accent"
                >
                  <Pencil size={12} />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteId(o.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10"
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editItem !== null && (
        <OfficerModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleSave}
        />
      )}

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Officer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the officer from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  setOfficers(officers.filter((o) => o.id !== deleteId));
                  setDeleteId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-500"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
