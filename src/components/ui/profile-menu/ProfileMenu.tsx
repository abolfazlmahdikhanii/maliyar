import { Avatar, Dropdown, Separator } from "@heroui/react";
import {
  AltArrowDownIcon,
  Logout2Icon,
  SettingsIcon,
  UserIcon,
} from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";

const ITEMS = [
  {
    id: "profile",
    title: "پروفایل",
    description: "اطلاعات حساب کاربری",
    icon: UserIcon,
  },
  {
    id: "settings",
    title: "تنظیمات",
    description: "شخصی‌سازی برنامه",
    icon: SettingsIcon,
  },
];

const ProfileMenu = () => {
  const user = useQuery(api.users.me);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const fullName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    user?.username ||
    "کاربر";
  return (
    <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger */}
      <Dropdown.Trigger>
        <div
          className={
            "bg-secondary cursor-pointer border border-secondary flex items-center w-23.75 h-13.75 rounded-full p-1.5 pl-2.5 justify-between gap-x-2.75 text-white"
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
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
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
      <Dropdown.Popover className="box-profile w-70 ml-7">
        {/* User Card */}
        <div className="px-2 pb-1.5">
          <div
            className="
              relative
              overflow-hidden
              rounded-xl
              bg-[#242429]
              border border-white/6
              p-3
            "
          >
            {/* Decorative glow */}
            <div
              className="
                absolute
                -left-8
                -top-8
                size-24
                rounded-full
                bg-primary/10
                blur-2xl
              "
            />

            <div className="relative flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <Avatar size="lg">
                  <Avatar.Image
                    alt={fullName}
                    src={
                      user?.image ??
                      "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg"
                    }
                  />

                  <Avatar.Fallback>
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </Avatar.Fallback>
                </Avatar>

                {/* Online */}
                <span
                  className="
                    absolute
                    bottom-0
                    left-0
                    size-3
                    rounded-full
                    bg-primary
                    border-2
                    border-[#242429]
                  "
                />
              </div>

              {/* Information */}
              <div className="min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-semibold text-white">
                    {fullName}
                  </p>
                </div>

                <p className="truncate text-xs text-white/40" dir="ltr">
                  {user?.email ?? "ایمیل ثبت نشده"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <Dropdown.Menu className="space-y-1.25">
          {ITEMS.map(({ id, title, description, icon: Icon }) => (
            <Dropdown.Item key={id} id={id} textValue={title} className="group">
              <div className="flex items-center gap-3 w-full">
                <div className="profile-item">
                  <Icon
                    size={17}
                    className="text-white/50 group-hover:text-primary group-data-[focus-visible=true]:text-primary"
                  />
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-sm">{title}</span>
                  <span className="text-xs text-white/55">{description}</span>
                </div>
              </div>
            </Dropdown.Item>
          ))}

          <Separator className="my-1" />
          {/* Logout */}
          <Dropdown.Item id="logout" textValue="خروج" className="group">
            <div className="flex items-center gap-3 w-full">
              <div
                className="
                  size-8
                  rounded-lg
                  bg-red-400/6
                  flex items-center justify-center
                "
              >
                <Logout2Icon size={17} className="text-red-400" />
              </div>

              <span className="text-sm text-red-400">خروج از حساب</span>
            </div>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};

export default ProfileMenu;
