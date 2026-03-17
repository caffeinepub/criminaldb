import {
  Briefcase,
  FileText,
  Package,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "../context/AppContext";

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#06b6d4",
];

export default function DashboardPage() {
  const {
    criminals,
    crimes,
    cases,
    officers,
    arrestRecords,
    evidence,
    activityLogs,
  } = useApp();

  const activeThisMonth = arrestRecords.filter((a) =>
    a.arrestDate.startsWith("2024-04"),
  ).length;

  const stats = [
    {
      label: "Total Criminals",
      value: criminals.length,
      icon: <Shield size={20} />,
      color: "bg-red-500/10 text-red-400",
      border: "border-red-500/20",
    },
    {
      label: "Active Cases",
      value: cases.filter(
        (c) => c.caseStatus !== "Closed" && c.caseStatus !== "Dismissed",
      ).length,
      icon: <Briefcase size={20} />,
      color: "bg-blue-500/10 text-blue-400",
      border: "border-blue-500/20",
    },
    {
      label: "Total Crimes",
      value: crimes.length,
      icon: <FileText size={20} />,
      color: "bg-orange-500/10 text-orange-400",
      border: "border-orange-500/20",
    },
    {
      label: "Officers on Duty",
      value: officers.length,
      icon: <UserCheck size={20} />,
      color: "bg-green-500/10 text-green-400",
      border: "border-green-500/20",
    },
    {
      label: "Arrests This Month",
      value: activeThisMonth,
      icon: <Users size={20} />,
      color: "bg-purple-500/10 text-purple-400",
      border: "border-purple-500/20",
    },
    {
      label: "Evidence Items",
      value: evidence.length,
      icon: <Package size={20} />,
      color: "bg-cyan-500/10 text-cyan-400",
      border: "border-cyan-500/20",
    },
  ];

  const crimeTypeCounts = criminals.reduce<Record<string, number>>((acc, c) => {
    acc[c.crimeType] = (acc[c.crimeType] || 0) + 1;
    return acc;
  }, {});
  const crimeTypeData = Object.entries(crimeTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, count]) => ({ name, count }));

  const caseStatusData = [
    {
      name: "Open",
      value: cases.filter((c) => c.caseStatus === "Open").length,
    },
    {
      name: "Under Investigation",
      value: cases.filter((c) => c.caseStatus === "Under Investigation").length,
    },
    {
      name: "Closed",
      value: cases.filter((c) => c.caseStatus === "Closed").length,
    },
    {
      name: "Dismissed",
      value: cases.filter((c) => c.caseStatus === "Dismissed").length,
    },
  ];

  const arrestsByMonth = [
    { month: "Nov", arrests: 2 },
    { month: "Dec", arrests: 3 },
    { month: "Jan", arrests: 4 },
    { month: "Feb", arrests: 3 },
    { month: "Mar", arrests: 2 },
    { month: "Apr", arrests: activeThisMonth },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`bg-card rounded-xl border ${s.border} p-4`}
          >
            <div className={`inline-flex p-2 rounded-lg mb-3 ${s.color}`}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Criminals by Crime Type
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={crimeTypeData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                strokeOpacity={0.1}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "currentColor" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Cases by Status
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={caseStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
              >
                {caseStatusData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[caseStatusData.indexOf(entry) % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Arrests Per Month
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={arrestsByMonth}
              margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                strokeOpacity={0.1}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "currentColor" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="arrests"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Recent Activity
          </h3>
          <div className="space-y-2.5">
            {activityLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="font-medium text-foreground">
                    {log.userId}
                  </span>
                  <span className="text-muted-foreground"> {log.action}</span>
                  <span className="text-muted-foreground/60 text-xs block">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
