import React, { useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Header from "./Components/Header";
import Sidebar from "./Components/Sidebar";
import Dashboard from "./Pages/Dashboard";
import Settings from "./Pages/Settings";
import UserManagement from "./Pages/UserManagement";
import Payment from "./Pages/Payment";
import Careers from "./Pages/Careers";
import Privacy from "./Pages/Privacy";
import Executives from "./Pages/Executives";
import UserAccount from "./Pages/UserAccount";
import Login from "./Pages/Login";
import Employee from "./Pages/Employee";
import Request from "./Pages/Request";
import EmployeeDetails from "./Pages/Employeedetail";
import AddExecutive from "./Pages/AddExecutive";
import Activities from "./Pages/Activities";
import UsersList from "./Pages/UsersList";
import UserDetails from "./Pages/UserDetails";
import Pricing from "./Pages/Pricing";
import Report from "./Pages/Report";
import Roles from "./Pages/Roles";
import NotFound from "./Pages/NotFound";
import Review from "./Pages/Review";
import ManageExecutive from "./Pages/ManageExecutive";
import ManageExecutiveDetail from "./Pages/ManageExecutiveDetail";
import Manager from "./Pages/Manager";
import ManageUserDetails from "./Pages/ManageUserDetails";
import ManageUser from "./Pages/ManageUser";
import Category from "./Pages/Category";
import CoinConversion from "./Pages/CoinConversion";

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const isLoginPage = location.pathname === "/login";

  const AdminRoute = ({ element }) => {
    return isAdminLoggedIn() ? element : <Navigate to="/login" />;
  };
  const isAdminLoggedIn = () => {
    return localStorage.getItem("userId");
  };

  const getUserRole = () => {
    return localStorage.getItem("Bestie_role");
  };

  const ProtectedRoute = ({ element, requiredRole }) => {
    const role = localStorage.getItem("Bestie_role");
    const isLoggedIn = localStorage.getItem("userId");

    if (!isLoggedIn) {
      return <Navigate to="/login" />;
    }

    if (requiredRole) {
      if (role !== requiredRole) {
        return role === "manager_executive" ? (
          <Navigate to="/manage-executive" />
        ) : role === "manager_user" ? (
          <Navigate to="/manage-user" />
        ) : (
          <Navigate to="/login" />
        );
      }
    } else {
      if (role === "superuser") {
        return <Navigate to="/" />;
      }
    }

    return element;
  };

  return (
    <div className="admin-panel">
      {!isLoginPage && isSidebarOpen && <Sidebar isOpen={isSidebarOpen} />}
      <div
        className={`main-content ${isSidebarOpen ? "expanded" : "collapsed"}`}
      >
        {!isLoginPage && <Header toggleSidebar={toggleSidebar} />}
        {!isLoginPage ? (
          <div className="content">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute
                    element={<Dashboard />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/settings"
                element={
                  <ProtectedRoute
                    element={<Settings />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
               <Route
                path="/coinconversion"
                element={
                  <ProtectedRoute
                    element={<CoinConversion />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/usermanage"
                element={
                  <ProtectedRoute
                    element={<UserManagement />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/payment"
                element={
                  <ProtectedRoute
                    element={<Payment />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/careers"
                element={
                  <ProtectedRoute
                    element={<Careers />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/privacy"
                element={
                  <ProtectedRoute
                    element={<Privacy />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/executives"
                element={
                  <ProtectedRoute
                    element={<Executives />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/account"
                element={
                  <ProtectedRoute
                    element={<UserAccount />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/executive"
                element={
                  <ProtectedRoute
                    element={<Employee />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/requests"
                element={
                  <ProtectedRoute
                    element={<Request />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/empdetails/:id"
                element={
                  <ProtectedRoute
                    element={<EmployeeDetails />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/addexecutive"
                element={
                  <ProtectedRoute
                    element={<AddExecutive />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/activities"
                element={
                  <ProtectedRoute
                    element={<Activities />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/pricing"
                element={
                  <ProtectedRoute
                    element={<Pricing />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/userslist"
                element={
                  <ProtectedRoute
                    element={<UsersList />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/userdetails/:id/:user_id"
                element={
                  <ProtectedRoute
                    element={<UserDetails />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
                <Route
                path="/category"
                element={
                  <ProtectedRoute
                    element={<Category />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/reports"
                element={
                  <ProtectedRoute
                    element={<Report />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/review"
                element={
                  <ProtectedRoute
                    element={<Review />}
                    requiredRole="superuser"
                  />
                }
              ></Route>
              <Route
                path="/managers"
                element={
                  <ProtectedRoute
                    element={<Manager />}
                    requiredRole="superuser"
                  />
                }
              ></Route>

              <Route
                path="/roles"
                element={
                  <ProtectedRoute
                    element={<Roles />}
                    requiredRole="superuser"
                  />
                }
              ></Route>

              <Route
                path="/manage-executive"
                element={
                  <ProtectedRoute
                    element={<ManageExecutive />}
                    requiredRole="manager_executive"
                  />
                }
              ></Route>
              <Route
                path="/manageempdetails/:id"
                element={
                  <ProtectedRoute
                    element={<ManageExecutiveDetail />}
                    requiredRole="manager_executive"
                  />
                }
              ></Route>

              <Route
                path="/manage-user"
                element={
                  <ProtectedRoute
                    element={<ManageUser />}
                    requiredRole="manager_user"
                  />
                }
              ></Route>
              <Route
                path="/manageuserdetails/:id/:user_id"
                element={
                  <ProtectedRoute
                    element={<ManageUserDetails />}
                    requiredRole="manager_user"
                  />
                }
              ></Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        )}
      </div>
    </div>
  );
}

export default App;
