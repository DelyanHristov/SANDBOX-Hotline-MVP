import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { AlertsPage } from "./pages/AlertsPage";
import { ExplorerPage } from "./pages/ExplorerPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";

const App = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/explorer" element={<ExplorerPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>
  </Routes>
);

export default App;
