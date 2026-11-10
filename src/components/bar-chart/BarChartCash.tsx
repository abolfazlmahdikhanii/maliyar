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

const toFa = (n: number): string => n.toLocaleString("fa-IR");

const niceStep = (max: number): number => {
  if (max <= 0) return 250;
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const f = raw / pow;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return Math.max(1, nice * pow);
};

const formatTick = (v: number): string => {
  if (v === 0) return "۰";
  if (v >= 1e9) return `${toFa(v / 1e9)}B`;
  if (v >= 1e6) return `${toFa(v / 1e6)}M`;
  if (v >= 1e3) return `${toFa(v / 1e3)}k`;
  return toFa(v);
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: { payload: CashflowPoint }[];
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const { label, income, outcome, net } = payload[0].payload;
  const deficit = net < 0;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "10px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        minWidth: 170,
      }}
    >
      <div style={{ fontSize: 12, color: "#8b8b8b", marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 12,
          color: deficit ? "#f06060" : "#4fa84f",
          fontWeight: 600,
        }}
      >
        {deficit ? "کسری" : "مازاد"}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#0a0a0a",
          direction: "ltr",
          textAlign: "right",
        }}
      >
        {deficit ? "−" : ""}
        {toFa(Math.abs(net))} تومان
      </div>

      <div
        style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: "1px dashed #e2e2e2",
          display: "grid",
          gap: 4,
          fontSize: 12,
          color: "#555",
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <span>درآمد</span>
          <span style={{ direction: "ltr" }}>{toFa(income)}</span>
        </div>
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <span>هزینه</span>
          <span style={{ direction: "ltr" }}>{toFa(outcome)}</span>
        </div>
      </div>
    </div>
  );
};

const roundedTopRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): string => {
  if (height <= 0) return "";
  const r = Math.min(radius, width / 2, height);
  return `
    M${x},${y + height}
    L${x},${y + r}
    Q${x},${y} ${x + r},${y}
    L${x + width - r},${y}
    Q${x + width},${y} ${x + width},${y + r}
    L${x + width},${y + height}
    Z
  `;
};

type DualLayerBarProps = {
  variant?: "income" | "outcome";
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  background?: {
    x?: number | null;
    y?: number | null;
    width?: number | null;
    height?: number | null;
  };
};

const DualLayerBar = ({
  variant = "income",
  x,
  y,
  width,
  height,
  background,
}: DualLayerBarProps) => {
  const barX = x ?? 0;
  const barY = y ?? 0;
  const barWidth = width ?? 0;
  const barHeight = height ?? 0;

  const radius = 8;

  const trackY = background?.y ?? barY;
  const trackHeight = background?.height ?? 0;

  return (
    <g>
      <path
        d={roundedTopRect(barX, trackY, barWidth, trackHeight, radius)}
        fill="#333436"
      />
      <path
        d={roundedTopRect(barX, barY, barWidth, barHeight, radius)}
        fill={`url(#${variant}Gradient)`}
      />
      <path
        d={roundedTopRect(barX, barY, barWidth, barHeight, radius)}
        fill="url(#hatchPattern)"
      />
    </g>
  );
};

type BarChartCashProps = {
  data: CashflowPoint[];
};

const barWidthFor = (count: number): number => {
  if (count === 7) return 60;
  if (count === 6) return 72;
  return 36;
};

const BarChartCash = ({ data }: BarChartCashProps) => {
  const max = Math.max(...data.flatMap((p) => [p.income, p.outcome]), 0);
  const step = niceStep(max);
  const ticks = [0, step, step * 2, step * 3, step * 4];
  const barWidth = barWidthFor(data.length);

  return (
    <div>
      <div className="flex items-center gap-x-5 mb-2 text-sm text-neutral-300">
        <span className="flex items-center gap-x-2">
          <span className="size-2.5 rounded-full bg-primary" />
          درآمد
        </span>
        <span className="flex items-center gap-x-2">
          <span className="size-2.5 rounded-full bg-[#f06060]" />
          هزینه
        </span>
      </div>

      <ResponsiveContainer width="100%" height={375}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          barCategoryGap="14%"
          barGap={5}
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
            width={50}
            tickMargin={15}
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
  );
};

export default BarChartCash;
