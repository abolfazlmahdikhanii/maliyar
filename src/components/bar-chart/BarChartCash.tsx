import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CashflowPoint } from "../../hooks/useCashflow";
import { barWidthFor, formatTick, niceStep } from "../../utils/barChart";
import CustomTooltip from "./elements/CustomTooltip";
import DualLayerBar from "./elements/DualLayerBar";

type BarChartCashProps = {
  data: CashflowPoint[];
};

const BarChartCash = ({ data }: BarChartCashProps) => {
  const max = Math.max(...data.flatMap((p) => [p.income, p.outcome]), 0);
  const step = niceStep(max);
  const ticks = [0, step, step * 2, step * 3, step * 4];
  const barWidth = barWidthFor(data.length);

  return (
    <div className="w-full min-w-0">
      <div className="mb-2 flex items-center gap-x-5 text-sm text-neutral-300">
        <span className="flex items-center gap-x-2">
          <span className="size-2.5 rounded-full bg-primary" />
          درآمد
        </span>
        <span className="flex items-center gap-x-2">
          <span className="size-2.5 rounded-full bg-[#f06060]" />
          هزینه
        </span>
      </div>

      <div className="h-64 w-full sm:h-93.75">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            barCategoryGap="14%"
            barGap={5}
            className="w-full"
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8CF07A" />
                <stop offset="100%" stopColor="#4FCB4F" />
              </linearGradient>
              <linearGradient id="outcomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF8F8F" />
                <stop offset="100%" stopColor="#E04F4F" />
              </linearGradient>
              <pattern
                id="hatchPattern"
                width="8"
                height="8"
                patternTransform="rotate(45)"
                patternUnits="userSpaceOnUse"
              >
                <rect width="8" height="8" fill="transparent" />
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="6"
                  stroke="#ffffff"
                  strokeOpacity="0.15"
                  strokeWidth="2"
                />
              </pattern>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="#434344"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#ffffffb2", fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[0, step * 4]}
              ticks={ticks}
              tickFormatter={formatTick}
              tick={{ fill: "#ffffffb2", fontSize: 12 }}
              width={38}
              tickMargin={6}
            />

            <Tooltip
              cursor={false}
              content={<CustomTooltip />}
              wrapperStyle={{ outline: "none" }}
            />
            <Bar
              dataKey="income"
              background={{ fill: "transparent" }}
              shape={<DualLayerBar variant="income" />}
              isAnimationActive={false}
              maxBarSize={barWidth}
            />
            <Bar
              dataKey="outcome"
              background={{ fill: "transparent" }}
              shape={<DualLayerBar variant="outcome" />}
              isAnimationActive={false}
              maxBarSize={barWidth}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartCash;
