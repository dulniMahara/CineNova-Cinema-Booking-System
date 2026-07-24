import React from "react";
import Topbar from "./Topbar";
import Footer from "./Footer";
import "./PageLayout.css";

const PageLayout = ({ children, isAdmin = false }) => {
  return (
    <div className={`layout-root ${isAdmin ? "admin-layout" : "customer-layout"}`}>
      <Topbar isAdmin={isAdmin} />

      <main className="page-content">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default PageLayout;