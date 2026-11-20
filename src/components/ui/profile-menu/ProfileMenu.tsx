import { Avatar, Dropdown, Separator } from "@heroui/react";
import {
  AltArrowDownIcon,
  AltArrowLeftIcon,
  Logout2Icon,
  SettingsIcon,
  TargetIcon,
  Wallet2Icon,
} from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../../convex/_generated/api";
import Logout from "../logout/Logout";

const ITEMS = [
  {
    id: "accounts",
    title: "حساب‌ها",
    description: "مدیریت حساب‌ها و کارت‌ها",
    icon: Wallet2Icon,
    path: "/accounts",
  },
  {
    id: "goals",
    title: "اهداف مالی",
    description: "پیگیری اهداف پس‌انداز",
    icon: TargetIcon,
    path: "/finance-goal",
  },
  {
    id: "settings",
    title: "تنظیمات",
    description: " شخصی‌سازی برنامه",
    icon: SettingsIcon,
    path: "/setting",
  },
];

const ProfileMenu = () => {
  const user = useQuery(api.users.me);
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSignout, setIsSignout] = useState(false);

  const fullName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    user?.username ||
    "کاربر";
  const avatarSrc =
    user?.image ??
    "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg";

  return (
    <>
      <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
        <Dropdown.Trigger>
          <div
            className={
              "bg-secondary cursor-pointer border border-secondary flex items-center w-21 md:w-23.75 h-12.5 lg:h-13.75 rounded-full p-1.5 pl-2.5 justify-between gap-x-2.75 text-white"
            }
          >
            <div>
              <Avatar>
                <Avatar.Image
                  alt="Blue"
                  src={
                    user?.image ??
                    "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
                  }
                />
                <Avatar.Fallback>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </Avatar.Fallback>
              </Avatar>
            </div>
            {isOpen ? (
              <AltArrowDownIcon size={16} className="rotate-180" />
            ) : (
              <AltArrowDownIcon size={16} />
            )}
          </div>
        </Dropdown.Trigger>

        {/* Popover */}
        <Dropdown.Popover className="box-profile w-[calc(100vw-1rem)] max-w-70 lg:ml-7 lg:w-80 lg:max-w-80">
          {/* User card */}
          <div className="px-2 pb-1.5">
            <div className="relative overflow-hidden rounded-2xl border border-white/6 bg-linear-to-br from-primary/15 via-[#242429] to-[#242429] p-3.5">
              <div className="absolute -left-10 -top-10 size-28 rounded-full bg-primary/15 blur-2xl" />

              <div className="relative flex items-center gap-3">
                <div className="relative shrink-0">
                  <Avatar size="lg">
                    <Avatar.Image alt={fullName} src={avatarSrc} />
                    <Avatar.Fallback>
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </Avatar.Fallback>
                  </Avatar>
                  <span className="absolute bottom-0 left-0 size-3 rounded-full border-2 border-[#242429] bg-primary" />
                </div>

                <div className="flex min-w-0 flex-col gap-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {fullName}
                  </p>
                  <p className="truncate text-xs text-white/45" dir="ltr">
                    {user?.email ?? "ایمیل ثبت نشده"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Menu */}
          <Dropdown.Menu
            className="space-y-1"
            onAction={(key) => {
              if (key === "logout") {
                setIsSignout(true);
                return;
              }
              const item = ITEMS.find((i) => i.id === key);
              if (item) navigate(item.path);
            }}
          >
            {ITEMS.map(({ id, title, description, icon: Icon }) => (
              <Dropdown.Item
                key={id}
                id={id}
                textValue={title}
                className="group"
              >
                <div className="flex w-full items-center gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/5 transition-colors group-hover:bg-primary/15">
                    <Icon
                      size={18}
                      className="text-white/60 transition-colors group-hover:text-primary"
                    />
                  </div>

                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm text-white">{title}</span>
                    <span className="text-xs text-white/50">{description}</span>
                  </div>

                  <AltArrowLeftIcon
                    size={14}
                    className="mr-auto text-white/25 transition-colors group-hover:text-white/60"
                  />
                </div>
              </Dropdown.Item>
            ))}

            <Separator className="my-1" />

            <Dropdown.Item id="logout" textValue="خروج" className="group">
              <div className="flex w-full items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-400/10 transition-colors group-hover:bg-red-400/20">
                  <Logout2Icon size={18} className="text-red-400" />
                </div>
                <span className="text-sm text-red-400">خروج از حساب</span>
              </div>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      <Logout
        isShowConfirm={isSignout}
        onChangeShowConfirm={() => setIsSignout(false)}
      />
    </>
  );
};

export default ProfileMenu;
