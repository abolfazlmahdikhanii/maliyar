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
    <div className="box min-w-0 rounded-[25px] col-span-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="w-11.5 h-11.5 shrink-0 grid place-content-center bg-secondary rounded-full text-white">
            <ChartIcon size={21} />
          </div>
          <p className="truncate text-white text-lg sm:text-[21px]">
            جریان نقدی
          </p>
        </div>

        <Dropdown>
          <Button
            aria-label="بازه‌ی زمانی"
            className="relative h-11 w-28 shrink-0 bg-primary text-black hover:bg-primary/80 sm:h-12.5 sm:w-30.5"
          >
            <p className="ml-6 text-sm">
              {FILTERS.find((f) => f.id === filter)?.label}
            </p>
            <AltArrowDownIcon
              size={16}
              className="mr-0.5 absolute left-4 sm:left-5"
            />
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

      <div className="mb-4 mt-6 sm:mt-8 lg:h-full">
        {loading ? (
          <div className="flex h-64 items-center justify-center lg:h-[80%]">
            <Loader />
          </div>
        ) : isEmpty ? (
          <div className="flex min-h-64 items-center justify-center lg:h-[70%]">
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
