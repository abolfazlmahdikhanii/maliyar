import { ScrollShadow } from "@heroui/react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/ui/header/Header";
import Sidebar from "./components/ui/sidebar/Sidebar";
import Dashboard from "./page/dashboard/Dashboard";
import Transactions from "./page/transactions/Transactions";
import Budgets from "./page/budgets/Budgets";
import Dues from "./page/dues/Dues";
import Credits from "./page/credits/Credits";
import Checks from "./page/checks/Checks";

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



              </Routes>
            </div>
          </ScrollShadow>
        </main>
      </section>
    </div>
  );
};

export default App;
