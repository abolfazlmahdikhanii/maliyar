import { Button } from "@heroui/react";
import {
  BillIcon,
  Card2Icon,
  CardTransferIcon,
  Logout3Icon,
  MentionCircleIcon,
  PieChart3Icon,
  SettingsIcon,
  SquareSortHorizontalIcon,
  UmbrellaIcon,
  WalletMoneyIcon,
  WidgetIcon
} from "@solar-icons/react/outline";

import type { Icon } from "@solar-icons/react/lib/types";
import SidebarItem from "./SidebarItem";
import { useState } from "react";
import Logout from "../logout/Logout";

  export type SidebarLink = {
    iconEl?: Icon;
    name: string;
    href: string;
  };
  type Sidebar={
  id:number
  }&SidebarLink

  const links:Sidebar[]=[
    {
  id:1,
  iconEl:WidgetIcon ,
  name:"داشبورد",
  href:"/"
  },
  {
  id:2,
  iconEl:CardTransferIcon ,
  name:"تراکنش ها",
  href:"/transactions"
  },
  {
  id:3,
  iconEl:PieChart3Icon ,
  name:"بودجه بندی",
  href:"/budget"
  },
  {
  id:4,
  iconEl:WalletMoneyIcon ,
  name:"بدهی و طلب",
  href:"/dues"
  },
  {
  id:5,
  iconEl:MentionCircleIcon ,
  name:"اهداف مالی",
  href:"/finance-goal"
  },
  {
  id:6,
  iconEl:SquareSortHorizontalIcon ,
  name:"اشتراک ها",
  href:"/subscriptions"
  },
  {
  id:7,
  iconEl:Card2Icon ,
  name:"حساب ها",
  href:"/accounts"
  },
  {
  id:8,
  iconEl:BillIcon ,
  name:"چک ها",
  href:"/checks"
  },
  {
  id:9,
  iconEl:UmbrellaIcon ,
  name:"وام ها",
  href:"/credits"
  },
  {
  id:10,
  iconEl:SettingsIcon ,
  name:"تنطیمات",
  href:"/setting"
  }
  ]

const Sidebar = () => {
  const [isSignout,setIsSignout]=useState(false)
  return (
    <div className="bg h-svh">
      {/* logo */}
      <div className="flex items-center gap-x-1.5 text-white py-8 px-4">
        <img src="/images/logo.svg" alt="logo" className="w-12.5 h-12.5" />
        <h2 className="text-[25px] font-semibold mt-2">مدیریت مالی</h2>
      </div>
      <div className="flex flex-col justify-between h-[85%]">
        {/* sidebar */}
        <nav className="py-3 px-5 flex flex-col gap-y-1.5">
           {
            links.map(link=>(
              <SidebarItem key={link.id} {...link}/>
            ))
           }
        </nav>
        <div className="flex items-center gap-2 pt-4 pb-2  mx-8 border-t border-t-secondary ">
          <Button
            fullWidth
            className={
              "min-h-13 text-right rounded-2xl justify-start text-neutral-400 bg-transparent px-3 hover:bg-danger-soft hover:text-danger-hover transition-all duration-200"
            }
            onPress={()=>setIsSignout(true)}
          >
            <Logout3Icon size={22} />
            <p className="text-[15px]">خروج از حساب</p>
          </Button>
        </div>
      </div>
      <Logout isShowConfirm={isSignout} onChangeShowConfirm={()=>setIsSignout(false)}/>
    </div>
  );
};

export default Sidebar;
