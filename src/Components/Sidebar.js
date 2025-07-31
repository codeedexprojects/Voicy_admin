import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUserFriends,
  FaUser,
  FaFileAlt,
  FaUsers,
  FaBell,
  FaRupeeSign,
  FaCoins,
} from "react-icons/fa";
import "./Sidebar.css";

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const token = localStorage.getItem("Bestie_accesstoken");
  const role = localStorage.getItem("Bestie_role");

  if (!token) return null;

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <h2 className="logo">
          {role === "superuser" ? "Admin Panel" : "Manager Panel"}
        </h2>
      </div>

      <ul className="nav">
        {role === "superuser" ? (
          <>
            {[
              { path: "/", icon: <FaHome />, label: "Home" },
              { path: "/admin-profile", icon: <FaUser />, label: "Profile" },
              {
                path: "/executive",
                icon: <FaUserFriends />,
                label: "Executives",
              },
              { path: "/userslist", icon: <FaUser />, label: "Users" },
              { path: "/referral", icon: <FaUser />, label: "Referral" },
              { path: "/review", icon: <FaFileAlt />, label: "Review" },
              { path: "/reports", icon: <FaFileAlt />, label: "Reports" },
              { path: "/managers", icon: <FaUser />, label: "Manager" },
              { path: "/blocked-users", icon: <FaUser />, label: "Blocked Users" },
              { path: "/banned-users", icon: <FaUser />, label: "Banned Users" },
              { path: "/coinconversion", icon: <FaCoins />, label: "Coin-Conversion" },
              { path: "/account", icon: <FaUsers />, label: "Accounts" },
              { path: "/activities", icon: <FaBell />, label: "Activity" },
              { path: "/category", icon: <FaUser />, label: "Category" },
              { path: "/pricing", icon: <FaRupeeSign />, label: "Pricing" },
            ].map((item) => (
              <li
                key={item.path}
                className={location.pathname === item.path ? "active" : ""}
              >
                <Link to={item.path}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </>
        ) : role === "manager_executive" || role === "hr_executive" ? (
          <>
            {[
              {
                path: "/managerdashboard",
                icon: <FaUser />,
                label: "Home",
              },
              {
                path: "/manage-executive",
                icon: <FaUserFriends />,
                label: "Manage Executives",
              },
              {
                path: "/manage-user",
                icon: <FaUser />,
                label: "Manage Users",
              },
              {
                path: "/manager-profile",
                icon: <FaUser />,
                label: "Profile",
              },
            ].map((item) => (
              <li
                key={item.path}
                className={location.pathname === item.path ? "active" : ""}
              >
                <Link to={item.path}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </>
        ) : null}
      </ul>
    </div>
  );
}

export default Sidebar;