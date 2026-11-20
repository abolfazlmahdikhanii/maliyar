import { ScrollShadow } from "@heroui/react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/sidebar/Sidebar";
import Header from "../components/ui/header/Header";
import BottomNav from "../components/ui/bottom-nav/BottomNav";

const Layout = () => {
  return (
    <div className="lg:grid lg:grid-cols-[330px_1fr]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <section className="flex h-dvh flex-col bg-[#0B0B0E] lg:mt-7 lg:h-[calc(100dvh-1.75rem)] lg:rounded-tr-4xl">
        <Header />

        <main className="min-h-0 flex-1">
          <ScrollShadow className="h-full pb-24 lg:pb-6">
            <div className="mx-auto w-[92%] lg:w-[93%]">
              <Outlet />
            </div>
          </ScrollShadow>
        </main>
      </section>

      <BottomNav />
    </div>
  );
};

export default Layout;