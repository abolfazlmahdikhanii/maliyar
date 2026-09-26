import { ScrollShadow } from "@heroui/react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/ui/header/Header";
import Sidebar from "./components/ui/sidebar/Sidebar";
import Budgets from "./page/budgets/Budgets";
import Checks from "./page/checks/Checks";
import Credits from "./page/credits/Credits";
import Dashboard from "./page/dashboard/Dashboard";
import Dues from "./page/dues/Dues";
import Transactions from "./page/transactions/Transactions";
import Accounts from "./page/accounts/Accounts";

const App = () => {
  return (
    <div className="grid grid-cols-[330px_1fr]">
      <Sidebar />
      <section className="bg-[#0B0B0E] mt-7 rounded-tr-4xl ">
        <Header />
        <main className=" h-[82vh] ">
          <ScrollShadow className="h-full pb-6">
            <div className="w-[93%] mx-auto ">
              <Routes>
                <Route index path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/budget" element={<Budgets />} />
                <Route path="/dues" element={<Dues />} />
                <Route path="/credits" element={<Credits />} />
                <Route path="/checks" element={<Checks />} />
                <Route path="/accounts" element={<Accounts />} />
              </Routes>
            </div>
          </ScrollShadow>
        </main>
      </section>
    </div>
  );
};

export default App;
