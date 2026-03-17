import { type ReactNode, createContext, useContext, useState } from "react";
import {
  mockActivityLogs,
  mockArrestRecords,
  mockCases,
  mockCrimes,
  mockCriminals,
  mockEvidence,
  mockNotifications,
  mockOfficers,
} from "../mockData";
import type {
  ActivityLog,
  ArrestRecord,
  Case,
  Crime,
  Criminal,
  Evidence,
  Notification,
  PoliceOfficer,
  User,
} from "../types";

interface AppContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  criminals: Criminal[];
  crimes: Crime[];
  officers: PoliceOfficer[];
  arrestRecords: ArrestRecord[];
  cases: Case[];
  evidence: Evidence[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  setCriminals: (c: Criminal[]) => void;
  setCrimes: (c: Crime[]) => void;
  setOfficers: (o: PoliceOfficer[]) => void;
  setArrestRecords: (a: ArrestRecord[]) => void;
  setCases: (c: Case[]) => void;
  setEvidence: (e: Evidence[]) => void;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  addActivityLog: (
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
  ) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const CREDENTIALS: Record<
  string,
  { password: string; role: "Admin" | "Officer" | "Investigator"; name: string }
> = {
  admin: { password: "admin123", role: "Admin", name: "Admin User" },
  officer1: {
    password: "pass123",
    role: "Officer",
    name: "Insp. Sarah Collins",
  },
  officer2: { password: "pass123", role: "Officer", name: "Insp. David Park" },
  officer3: { password: "pass123", role: "Officer", name: "Sgt. Mike Torres" },
  investigator1: {
    password: "pass123",
    role: "Investigator",
    name: "Investigator Lin",
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [criminals, setCriminals] = useState<Criminal[]>(mockCriminals);
  const [crimes, setCrimes] = useState<Crime[]>(mockCrimes);
  const [officers, setOfficers] = useState<PoliceOfficer[]>(mockOfficers);
  const [arrestRecords, setArrestRecords] =
    useState<ArrestRecord[]>(mockArrestRecords);
  const [cases, setCases] = useState<Case[]>(mockCases);
  const [evidence, setEvidence] = useState<Evidence[]>(mockEvidence);
  const [activityLogs, setActivityLogs] =
    useState<ActivityLog[]>(mockActivityLogs);
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  const login = (username: string, password: string): boolean => {
    const cred = CREDENTIALS[username];
    if (cred && cred.password === password) {
      setUser({ id: username, username, role: cred.role, name: cred.name });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return next;
    });
  };

  const markNotificationRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const addActivityLog = (
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
  ) => {
    const newLog: ActivityLog = {
      id: Date.now(),
      userId,
      action,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        darkMode,
        toggleDarkMode,
        criminals,
        crimes,
        officers,
        arrestRecords,
        cases,
        evidence,
        activityLogs,
        notifications,
        setCriminals,
        setCrimes,
        setOfficers,
        setArrestRecords,
        setCases,
        setEvidence,
        markNotificationRead,
        markAllNotificationsRead,
        addActivityLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
