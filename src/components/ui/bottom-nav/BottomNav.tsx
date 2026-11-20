import { Drawer, useOverlayState } from "@heroui/react";
import {
  BillIcon,
  Card2Icon,
  CardTransferIcon,
  Home2Icon,
  MentionCircleIcon,
  PieChart3Icon,
  SettingsIcon,
  SquareSortHorizontalIcon,
  UmbrellaIcon,
  WalletMoneyIcon,
  Widget2Icon,
} from "@solar-icons/react/outline";
import { NavLink, useLocation } from "react-router-dom";

const mainItems = [
  { to: "/", label: "داشبورد", icon: Home2Icon },
  { to: "/transactions", label: "تراکنش‌ها", icon: CardTransferIcon },
  { to: "/budget", label: "بودجه", icon: PieChart3Icon },
  { to: "/accounts", label: "حساب‌ها", icon: Card2Icon },
];

const moreItems = [
  { to: "/dues", label: "بدهی و طلب", icon: WalletMoneyIcon },
  { to: "/finance-goal", label: "اهداف مالی", icon: MentionCircleIcon },
  { to: "/subscriptions", label: "اشتراک‌ها", icon: SquareSortHorizontalIcon },
  { to: "/credits", label: "وام‌ها", icon: UmbrellaIcon },
  { to: "/checks", label: "چک‌ها", icon: BillIcon },
  { to: "/setting", label: "تنظیمات", icon: SettingsIcon },
];

const ACTIVE = "bg-[#A3E96B] text-[#0B0B0E]";
const IDLE = "text-white/50";

const BottomNav = () => {
  const state = useOverlayState();
  const { pathname } = useLocation();
  const isMoreActive = moreItems.some((item) => pathname.startsWith(item.to));

  return (
    <>
      <nav className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 rounded-3xl border border-white/10 bg-[#14141A]/90 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl lg:hidden">
        <ul className="flex items-center gap-1">
          {mainItems.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-medium transition-colors ${
                    isActive ? ACTIVE : IDLE
                  }`
                }
              >
                <Icon size={22} color="currentColor" />
                {label}
              </NavLink>
            </li>
          ))}

          <li className="flex-1">
            <button
              type="button"
              onClick={state.open}
              className={`flex w-full flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-medium transition-colors ${
                isMoreActive ? ACTIVE : IDLE
              }`}
            >
              <Widget2Icon size={22} color="currentColor" />
              بیشتر
            </button>
          </li>
        </ul>
      </nav>

      <Drawer>
        <Drawer.Backdrop isOpen={state.isOpen} onOpenChange={state.setOpen}>
          <Drawer.Content placement="bottom">
            <Drawer.Dialog className="rounded-t-[32px] border-t border-secondary bg-secondary">
              <Drawer.Handle />
              <Drawer.Header>
                <Drawer.Heading className="text-base font-bold text-white mb-3">
                  سرویس‌های دیگر
                </Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body className="grid grid-cols-3 gap-x-4 gap-y-5 pb-10">
                {moreItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={state.close}
                    className={({ isActive }) =>
                      `flex flex-col items-center gap-2 text-xs ${
                        isActive ? "text-[#A3E96B]" : "text-white/80"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`flex size-14 items-center justify-center rounded-2xl transition-colors ${
                            isActive ? ACTIVE : "bg-white/5 text-white"
                          }`}
                        >
                          <Icon size={26} color="currentColor" />
                        </span>
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
};

export default BottomNav;
