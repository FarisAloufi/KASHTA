import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../layout/Navbar"; 
import Footer from "../layout/Footer";

const MainLayout = () => {
  return (
   <div className="flex flex-col min-h-screen bg-main-bg text-main-text font-sans">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;