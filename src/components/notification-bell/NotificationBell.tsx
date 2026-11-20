import { Button, Dropdown, Label } from "@heroui/react";
import { BellIcon } from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { describeNotice, type Notice } from "../../utils/notifications";

const ROUTES: Record<Notice["kind"], string> = {
  check: "/checks",
  subscription: "/subscriptions",
  loan: "/credits",
  due: "/dues",
  budget: "/budget",
};

type NotificationBellProps = {
  onNavigate?: (path: string) => void;
};

const NotificationBell = ({ onNavigate }: NotificationBellProps) => {
  const notices = useQuery(api.notification.list) ?? [];
  const navigate = useNavigate();

  const go = (path: string) => (onNavigate ? onNavigate(path) : navigate(path));

  return (
    <Dropdown>
      <div className="relative">
        <Button isIconOnly className="btn">
          <BellIcon size={21} />
        </Button>
        {notices.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-[#f06060] text-white text-[11px] font-semibold grid place-items-center pointer-events-none">
            {notices.length}
          </span>
        )}
      </div>

      <Dropdown.Popover className="box-profile max-h-96 w-[calc(100vw-1.5rem)] max-w-78 overflow-y-auto lg:ml-30 lg:w-84 lg:max-w-84">
        <Dropdown.Menu
          onAction={(key) => {
            const notice = notices.find((n) => `${n.kind}-${n.id}` === key);
            if (notice) go(ROUTES[notice.kind]);
          }}
        >
          {notices.length === 0 ? (
            <Dropdown.Item
              id="empty"
              textValue="empty"
              isDisabled
              className="flex justify-center"
            >
              <Label className="text-sm text-white text-center">
                اعلان جدیدی نیست
              </Label>
            </Dropdown.Item>
          ) : (
            notices.map((n) => {
              const d = describeNotice(n);
              return (
                <Dropdown.Item
                  key={`${n.kind}-${n.id}`}
                  id={`${n.kind}-${n.id}`}
                  textValue={d.title}
                >
                  <div className="flex flex-col gap-y-2 py-1.25 px-1">
                    <Label className="text-sm text-neutral-100">
                      {d.title}
                    </Label>
                    <span
                      className={`text-xs ${d.danger ? "text-[#f06060]" : "text-neutral-400"}`}
                    >
                      {d.detail}
                    </span>
                  </div>
                </Dropdown.Item>
              );
            })
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};

export default NotificationBell;