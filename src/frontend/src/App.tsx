import { useState } from "react";
import Layout from "./components/Layout";
import { AppProvider, useApp } from "./context/AppContext";
import ActivityLogPage from "./pages/ActivityLogPage";
import ArrestsPage from "./pages/ArrestsPage";
import CasesPage from "./pages/CasesPage";
import CrimesPage from "./pages/CrimesPage";
import CriminalsPage from "./pages/CriminalsPage";
import DashboardPage from "./pages/DashboardPage";
import EvidencePage from "./pages/EvidencePage";
import LoginPage from "./pages/LoginPage";
import OfficersPage from "./pages/OfficersPage";

function AppInner() {
  const { user } = useApp();
  const [page, setPage] = useState("dashboard");

  if (!user) return <LoginPage />;

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage />;
      case "criminals":
        return <CriminalsPage />;
      case "crimes":
        return <CrimesPage />;
      case "cases":
        return <CasesPage />;
      case "evidence":
        return <EvidencePage />;
      case "officers":
        return <OfficersPage />;
      case "arrests":
        return <ArrestsPage />;
      case "activitylog":
        return <ActivityLogPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
