import { roundedTopRect } from "../../../utils/barChart";

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

export default DualLayerBar;
