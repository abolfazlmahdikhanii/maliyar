import { Button, Input } from "@heroui/react";
import { MagnifierIcon, SunIcon } from "@solar-icons/react/outline";
import NotificationBell from "../../notification-bell/NotificationBell";
import ProfileMenu from "../profile-menu/ProfileMenu";

const Header = () => {
  return (
    <header className="flex items-center justify-between py-5  ">
      <div className="space-y-2.75 py-1  lg:pr-9">
        {/* logo */}
        <div className="flex items-center gap-x-1.5 text-white px-3.5 lg:hidden">
          <img src="/images/logo.svg" alt="logo" className="w-8.25 h-8.25" />
          <h2 className="text-[18.5px] font-semibold mt-2">مدیریت مالی</h2>
        </div>
        <div
          className={
            " p-1.5 gap-x-2.75 text-white relative  lg:w-82.5 hidden lg:block"
          }
        >
          <Input
            className="flex h-12.75 w-full items-center rounded-full border border-secondary bg-secondary pr-4 pl-12 lg:h-13.75 lg:pr-5.5"
            placeholder="جستجو کنید..."
          />
          <MagnifierIcon
            className="absolute top-1/2 left-7.5 -translate-1/2 text-neutral-400"
            size={18}
          />
          <MagnifierIcon
            className="absolute top-1/2 left-7.5 -translate-1/2 text-neutral-400"
            size={18}
          />
        </div>
      </div>
      <div className="flex items-center gap-x-3.25 pl-6">
        <div className="hidden sm:block">
          <Button isIconOnly className="btn">
            <SunIcon size={24} />
          </Button>
        </div>
        <NotificationBell />

        {/* profile */}
        <div>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
