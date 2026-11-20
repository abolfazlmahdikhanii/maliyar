import { Route, Routes } from "react-router-dom";

import Auth from "./page/auth/Auth";

import { ScrollShadow, Toast } from "@heroui/react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import BottomNav from "./components/ui/bottom-nav/BottomNav";
import Header from "./components/ui/header/Header";
import { LoaderOverlay } from "./components/ui/loading-box/LoadingBox";
import Sidebar from "./components/ui/sidebar/Sidebar";
import Accounts from "./page/accounts/Accounts";
import Budgets from "./page/budgets/Budgets";
import Checks from "./page/checks/Checks";
import Credits from "./page/credits/Credits";
import Dashboard from "./page/dashboard/Dashboard";
import Dues from "./page/dues/Dues";
import FinanceGoal from "./page/finance-goal/FinanceGoal";
import Setting from "./page/setting/Setting";
import Subscriptions from "./page/subscriptions/Subscriptions";
import Transactions from "./page/transactions/Transactions";

const App = () => {
  return (
    <>
      <AuthLoading>
        <LoaderOverlay show />
      </AuthLoading>
      <Unauthenticated>
        <Auth />
      </Unauthenticated>
      <Authenticated>
        <div className="lg:grid lg:grid-cols-[330px_1fr]">
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          <section className="flex h-dvh flex-col bg-[#0B0B0E] lg:mt-7 lg:h-[calc(100dvh-1.75rem)] lg:rounded-tr-4xl">
            <Header />

            <main className="min-h-0 flex-1">
              <ScrollShadow
                className="h-full overflow-x-hidden pb-28 lg:pb-6"
                id="main-scroll-container"
              >
                <div className="mx-auto w-[92%] lg:w-[93%]">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/budget" element={<Budgets />} />
                    <Route path="/dues" element={<Dues />} />
                    <Route path="/credits" element={<Credits />} />
                    <Route path="/checks" element={<Checks />} />
                    <Route path="/accounts" element={<Accounts />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/finance-goal" element={<FinanceGoal />} />
                    <Route path="/setting" element={<Setting />} />
                  </Routes>
                </div>
              </ScrollShadow>
            </main>
          </section>

          <BottomNav />
        </div>
      </Authenticated>

      <Toast.Provider width={380} />
    </>
  );
};

export default App;
