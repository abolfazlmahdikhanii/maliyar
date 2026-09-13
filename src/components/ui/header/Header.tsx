import { Avatar, Button, Input } from "@heroui/react";
import {
  AltArrowDownIcon,
  BellIcon,
  MagnifierIcon,
  SunIcon,
} from "@solar-icons/react/outline";

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
        <Button isIconOnly className={"btn"}>
          <BellIcon size={21} />
        </Button>

        {/* profile */}
        <div>
          <div
            className={
              "bg-secondary border border-secondary flex items-center w-23.75 h-13.75 rounded-full p-1.5 gap-x-2.75 text-white"
            }
          >
            <div>
              <Avatar>
                <Avatar.Image
                  alt="Blue"
                  src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
                />
                <Avatar.Fallback>B</Avatar.Fallback>
              </Avatar>
            </div>
            <AltArrowDownIcon size={22} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
