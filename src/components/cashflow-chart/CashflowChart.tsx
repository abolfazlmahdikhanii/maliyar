import { Button, Dropdown, Label } from "@heroui/react";
import { AltArrowDownIcon, ChartIcon } from "@solar-icons/react/outline";
import { useState } from "react";
import { useCashflow, type CashflowMode } from "../../hooks/useCashflow";
import BarChartCash from "../bar-chart/BarChartCash";
import EmptyState from "../ui/empty-state/EmptyState";
import { Loader } from "../ui/loading-box/LoadingBox";

const FILTERS: { id: CashflowMode; label: string }[] = [
  { id: "weekly", label: "هفتگی" },
  { id: "monthly", label: "6 ماه اخیر" },
  { id: "yearly", label: "سالانه" },
];

const CashflowChart = () => {
  const [filter, setFilter] = useState<CashflowMode>("monthly");
  const { points, loading, isEmpty } = useCashflow(filter);

  return (
    <div className="box col-span-2 rounded-[25px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11.5 h-11.5 grid place-content-center bg-secondary rounded-full text-white">
            <ChartIcon size={21} />
          </div>
          <p className="text-white text-[21px]">جریان نقدی</p>
        </div>

        <Dropdown>
          <Button
            aria-label="بازه‌ی زمانی"
            className="bg-primary hover:bg-primary/80 text-black w-30.5 h-12.5 relative"
          >
            <p className="ml-6">
              {FILTERS.find((f) => f.id === filter)?.label}
            </p>
            <AltArrowDownIcon size={16} className="mr-0.5 absolute left-5" />
          </Button>
          <Dropdown.Popover
            className="min-w-42.5 text-neutral-200 bg-[#333436] border border-secondary"
            placement="bottom left"
          >
            <Dropdown.Menu onAction={(key) => setFilter(key as CashflowMode)}>
              {FILTERS.map((f) => (
                <Dropdown.Item
                  key={f.id}
                  id={f.id}
                  textValue={f.label}
                  className="filter-item"
                >
                  <Label className="text-sm text-neutral-200">{f.label}</Label>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>

      <div className="mt-8 mb-4 h-full">
        {loading ? (
          <div className="flex items-center justify-center h-[80%]">
            <Loader />
          </div>
        ) : isEmpty ? (
          <div className="flex items-center justify-center h-[80%]">
            <EmptyState
              compact
              kind="transactions"
              title="هنوز داده‌ای برای نمایش نیست"
              description="با ثبت درآمد و هزینه، جریان نقدی‌ات اینجا نشون داده می‌شه."
            />
          </div>
        ) : (
          <BarChartCash data={points} />
        )}
      </div>
    </div>
  );
};

export default CashflowChart;
