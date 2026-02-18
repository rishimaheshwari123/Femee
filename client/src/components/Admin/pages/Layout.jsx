import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="">
      <Sidebar />

      <div className="ml-14 md:ml-20 mx-2 md:mx-3 mt-1 md:mt-2">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
