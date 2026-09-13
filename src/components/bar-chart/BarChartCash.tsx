import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MonthlyProfit = {
  month: string;
  profit: number;
};

const data: MonthlyProfit[] = [
  { month: "فروردین", profit: 22000 },
  { month: "اردیبهشت", profit: 14000 },
  { month: "خرداد", profit: 38000 },
  { month: "تیر", profit: 18000 },
  { month: "مرداد", profit: 46000 },
  { month: "شهریور", profit: 72000 },
  { month: "مهر", profit: 98000 },
  { month: "آبان", profit: 62000 },
  { month: "آذر", profit: 97000 },
  { month: "دی", profit: 54000 },
  { month: "بهمن", profit: 34000 },
  { month: "اسفند", profit: 66000 },
];

const MAX_VALUE = 100000;
const Y_TICKS = [0, 25000, 50000, 75000, 100000];

const toFa = (n: number): string => n.toLocaleString("fa-IR");

type CustomTooltipProps = {
  active?: boolean;
  payload?: { value: number }[];
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "10px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        minWidth: 140,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: "#8b8b8b",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#6fe36f",
            display: "inline-block",
          }}
        />
        سود
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
        {toFa(value)} تومان
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
        fill="url(#barGradient)"
      />

      <path
        d={roundedTopRect(barX, barY, barWidth, barHeight, radius)}
        fill="url(#hatchPattern)"
      />
    </g>
  );
};

const yTickFormatter = (value: number): string =>
  value === 0 ? "۰" : `${toFa(value / 1000)}k`;

const BarChartCash = () => {
  return (
    <ResponsiveContainer width="100%" height={375}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        barCategoryGap="30%"
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8CF07A" />
            <stop offset="100%" stopColor="#4FCB4F" />
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
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#ffffffb2", fontSize: 12 }}
          dy={10}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          domain={[0, MAX_VALUE]}
          ticks={Y_TICKS}
          tickFormatter={yTickFormatter}
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
          dataKey="profit"
          background={{ fill: "transparent" }}
          shape={<DualLayerBar />}
          isAnimationActive={false}
          maxBarSize={80}
          barSize={45}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartCash;
