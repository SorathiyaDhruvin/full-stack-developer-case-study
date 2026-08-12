import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/auth";
import ToastContainer from "./components/common/Toast";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import ProductsPage from "./pages/ProductsPage";
import StockPage from "./pages/StockPage";
import ChallansPage from "./pages/ChallansPage";
import ProfilePage from "./pages/ProfilePage";
import "./App.css";

const IndexRedirect = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<IndexRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route
              path="/stock"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Warehouse", "Accounts"]}>
                  <StockPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/challans"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Sales", "Accounts"]}>
                  <ChallansPage />
                </ProtectedRoute>
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
