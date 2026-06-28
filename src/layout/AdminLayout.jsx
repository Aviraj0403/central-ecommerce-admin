import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

import { Header, Sidebar, RouterCumb, ProgressBar, Footer } from "../components";
import { useWindowContext } from "../context/windowContext";
import { useTheme } from "../context/ThemeContext.jsx";

const AdminLayout = () => {
  const [openSidebar, setOpenSidebar] = useState(true);
  const { divRef, progressWidth } = useWindowContext();
  const { isDark } = useTheme();
  const isLight = !isDark;

  const toggleSidebar = () => setOpenSidebar((prev) => !prev);

  useEffect(() => {
    const handleResize = () => {
      setOpenSidebar(window.innerWidth >= 1024); // lg breakpoint
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`flex w-full min-h-screen ${isLight ? 'bg-slate-50' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <Sidebar
        className={`
    lg:fixed absolute left-0 z-30 w-64
    top-[72px] h-[calc(100vh-72px)]
    transition-transform duration-300 ease-in-out 
    ${openSidebar ? "translate-x-0" : "-translate-x-full"}
  `}
        toggleSidebar={toggleSidebar}
      />

      {/* Main content area */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${openSidebar ? "lg:ml-64" : "ml-0"
          }`}
      >
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} openSidebar={openSidebar} />

        {/* Breadcrumbs & progress */}
        <div className="mt-[72px] px-6 pt-6 pb-2">
          <ProgressBar progressWidth={progressWidth} />
          <RouterCumb />
        </div>

        {/* Main scrollable content */}
        <main
          ref={divRef || null}
          className={`flex-grow overflow-y-auto px-6 pb-6 pt-0 ${isLight ? 'bg-slate-50' : 'bg-[#FAF9F6]'}`}
        >
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;
