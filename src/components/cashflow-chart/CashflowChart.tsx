import { Button, Dropdown, Label } from "@heroui/react";
import { AltArrowDownIcon, ChartIcon } from "@solar-icons/react/outline";
import { useState } from "react";
import BarChartCash from "../bar-chart/BarChartCash";

type FilterState = "yearly" | "monthly" | "weekly";

const CashflowChart = () => {
  const [filter, setFilter] = useState<FilterState>("monthly");
  return (
    <div className="box col-span-2 rounded-[25px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11.5 h-11.5 grid place-content-center bg-secondary rounded-full  text-white">
            <ChartIcon size={21} />
          </div>
          <p className="text-white text-[21px]  "> جریان نقدی</p>
        </div>
        <div>
          <Dropdown>
            <Button
              aria-label="Filter"
              className={
                "bg-primary hover:bg-primary/80 text-black w-30.5 h-12.5 relative "
              }
            >
              <p className="ml-6">
                {filter === "yearly" && "سالانه"}
                {filter === "monthly" && "6 ماه اخیر"}
                {filter === "weekly" && "هفتگی"}
              </p>
              <AltArrowDownIcon size={16} className="mr-0.5 absolute left-5" />
            </Button>
            <Dropdown.Popover
              className={
                "min-w-42.5 text-neutral-200 bg-[#333436] border border-secondary"
              }
              placement="bottom left"
            >
              <Dropdown.Menu onAction={(key) => setFilter(key as FilterState)}>
                <Dropdown.Item
                  id="yearly"
                  textValue="Yearly"
                  className="filter-item"
                >
                  <Label className="text-sm text-neutral-200">سالانه</Label>
                </Dropdown.Item>
                <Dropdown.Item
                  id="monthly"
                  textValue="last 6 month"
                  className="filter-item"
                >
                  <Label className="text-sm text-neutral-200">6 ماه اخیر</Label>
                </Dropdown.Item>
                <Dropdown.Item
                  id="weekly"
                  textValue="Weekly"
                  className="filter-item"
                >
                  <Label className="text-sm text-neutral-200">هفتگی</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </div>
      <div className="mt-8 mb-4">
        <BarChartCash />
      </div>
    </div>
  );
};

export default CashflowChart;
