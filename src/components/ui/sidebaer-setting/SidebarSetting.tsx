import type { FunctionReturnType } from "convex/server";
import { useEffect, useRef, useState } from "react";
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

  const handleSelect = (id: string) => {
    lockUntil.current = Date.now() + LOCK_MS;
    setSelectedID(id);

    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const initial = (info?.firstName || info?.username || "").charAt(0);

  return (
    <aside className="box rounded-2xl max-h-fit sticky top-0 self-start">
      <div className="flex flex-col items-center justify-center border-b border-dashed pt-3 pb-5 border-b-secondary">
        <div className="w-21 h-21 rounded-full uppercase bg-primary/15 text-primary text-3xl grid place-items-center border border-primary font-semibold">
          {initial}
        </div>

        <div className="flex flex-col items-center mt-4 min-h-12">
          {info ? (
            <>
              <p className="font-semibold text-lg text-white">
                {info.firstName} {info.lastName}
              </p>
              <p dir="ltr" className="text-[13px] text-muted mt-1.5">
                @{info.username}
              </p>
            </>
          ) : (
            <>
              <div className="h-6 w-32 rounded-lg bg-secondary animate-pulse" />
              <div className="h-4 w-20 rounded bg-secondary animate-pulse mt-2.5" />
            </>
          )}
        </div>
      </div>

      <nav aria-label="بخش‌های تنظیمات" className="py-3 space-y-1">
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
