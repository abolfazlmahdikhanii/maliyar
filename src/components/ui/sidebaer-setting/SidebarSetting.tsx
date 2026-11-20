import type { FunctionReturnType } from "convex/server";
import { useCallback, useEffect, useRef, useState } from "react";
import type { api } from "../../../../convex/_generated/api";
import SidebarItemSetting from "./elements/SidebarItemSetting";

type User = NonNullable<FunctionReturnType<typeof api.users.me>>;

const settingMenu = [
  { name: "اطلاعات حساب", id: "info" },
  { name: "امنیت", id: "security" },
  { name: "ترجیحات", id: "notification" },
  { name: "داده ها", id: "data" },
];

const LOCK_MS = 1000;

type SidebarSettingProps = {
  info?: User | null;
};

const SidebarSetting = ({ info }: SidebarSettingProps) => {
  const [selectedID, setSelectedID] = useState<string>("info");
  const lockUntil = useRef(0);

  useEffect(() => {
    const container = document.getElementById("main-scroll-container");
    if (!container) return;

    const updateActiveSection = () => {
      if (Date.now() < lockUntil.current) return;

      const activationPoint = container.getBoundingClientRect().top + 100;
      let activeId = settingMenu[0].id;

      for (const item of settingMenu) {
        const section = document.getElementById(item.id);
        if (!section) continue;
        if (section.getBoundingClientRect().top <= activationPoint) {
          activeId = item.id;
        }
      }

      const distanceToBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      if (distanceToBottom <= 4) {
        activeId = settingMenu[settingMenu.length - 1].id;
      }

      setSelectedID((prev) => (prev === activeId ? prev : activeId));
    };

    container.addEventListener("scroll", updateActiveSection, {
      passive: true,
    });

    const frame = requestAnimationFrame(updateActiveSection);

    return () => {
      container.removeEventListener("scroll", updateActiveSection);
      cancelAnimationFrame(frame);
    };
  }, []);

  const handleSelect = useCallback((id: string) => {
    lockUntil.current = Date.now() + LOCK_MS;
    setSelectedID(id);

    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const initial = (info?.firstName || info?.username || "").charAt(0);

  return (
    <aside className="sticky top-0 z-20 -mx-3 self-start bg-[#0B0B0E]/95 px-3 py-2 backdrop-blur lg:mx-0 lg:box lg:max-h-fit lg:bg-secondary lg:rounded-2xl l  lg:p-5 lg:backdrop-blur-none">
      <div className="hidden flex-col items-center justify-center border-b border-dashed border-b-secondary pb-5 pt-3 lg:flex">
        <div className="grid size-21 place-items-center rounded-full border border-primary bg-primary/15 text-3xl font-semibold uppercase text-primary">
          {initial}
        </div>

        <div className="mt-4 flex min-h-12 flex-col items-center">
          {info ? (
            <>
              <p className="text-lg font-semibold text-white">
                {info.firstName} {info.lastName}
              </p>
              <p dir="ltr" className="mt-1.5 text-[13px] text-muted">
                @{info.username}
              </p>
            </>
          ) : (
            <>
              <div className="h-6 w-32 animate-pulse rounded-lg bg-secondary" />
              <div className="mt-2.5 h-4 w-20 animate-pulse rounded bg-secondary" />
            </>
          )}
        </div>
      </div>

      <nav
        aria-label="بخش‌های تنظیمات"
        className="flex gap-2 overflow-x-auto [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
      >
        {settingMenu.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelect(item.id)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
              selectedID === item.id
                ? "border-primary bg-primary font-medium text-black"
                : "border-secondary bg-secondary text-white/70"
            }`}
          >
            {item.name}
          </button>
        ))}
      </nav>

      <nav
        aria-label="بخش‌های تنظیمات"
        className="hidden space-y-1 py-3 lg:block"
      >
        {settingMenu.map((item) => (
          <SidebarItemSetting
            key={item.id}
            {...item}
            selectedId={selectedID}
            onSelect={handleSelect}
          />
        ))}
      </nav>
    </aside>
  );
};

export default SidebarSetting;
