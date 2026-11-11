import { Button, Input } from "@heroui/react";
import { MagnifierIcon, SunIcon } from "@solar-icons/react/outline";
import NotificationBell from "../../notification-bell/NotificationBell";
import ProfileMenu from "../profile-menu/ProfileMenu";

const Header = () => {
  return (
    <header className="flex items-center justify-between py-5  ">
      <div className="space-y-2.75 py-1 pr-9">
        {/* <h3 className="text-white text-3xl font-semibold">سلام کاربر 🖐️</h3>
        <p className="text-neutral-200">این خلاصه وضعیت مالی تو برای امروزه. بیا با هم بررسیش کنیم!</p> */}
        <div className={" p-1.5 gap-x-2.75 text-white relative w-82.5"}>
          <Input
            className={
              " bg-secondary border border-secondary flex items-center h-13.75 rounded-full pr-5.5 pl-12 w-full"
            }
            placeholder="جستجو کنید..."
          />
          <MagnifierIcon
            className="absolute top-1/2 left-7.5 -translate-1/2 text-neutral-400"
            size={18}
          />
        </div>
      </div>
      <div className="flex items-center gap-x-3.25 pl-6">
        <Button isIconOnly className={"btn"}>
          <SunIcon size={24} />
        </Button>
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
