import { ScrollShadow } from "@heroui/react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/sidebar/Sidebar";
import Header from "../components/ui/header/Header";



const Layout = () => {
  return (
    <div className="grid grid-cols-[330px_1fr]">
      <Sidebar />

      <section className="bg-[#0B0B0E] mt-7 rounded-tr-4xl">
        <Header />

        <main className="h-[82vh]">
          <ScrollShadow className="h-full pb-6">
            <div className="w-[93%] mx-auto">
              <Outlet />
            </div>
          </ScrollShadow>
        </main>
      </section>
    </div>
  );
};

export default Layout;