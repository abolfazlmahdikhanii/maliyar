import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "../../../convex/_generated/api";
import SettingData from "../../components/setting-form/SettingData";
import SettingInfo from "../../components/setting-form/SettingInfo";
import SettingPrefers from "../../components/setting-form/SettingPrefers";
import SettingSecurity from "../../components/setting-form/SettingSecurity";
import SidebarSetting from "../../components/ui/sidebaer-setting/SidebarSetting";

export type User = FunctionReturnType<typeof api.users.me>;

const Setting = () => {
  const user = useQuery(api.users.me);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[370px_1fr] lg:gap-7 *:min-w-0">
      <SidebarSetting info={user} />
      <div className="space-y-4 lg:space-y-7">
        <SettingInfo info={user ?? null} />
        <SettingSecurity />
        <SettingPrefers />
        <SettingData />
      </div>
    </div>
  );
};

export default Setting;