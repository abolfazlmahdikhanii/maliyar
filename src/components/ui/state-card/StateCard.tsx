import type { Icon } from "@solar-icons/react/lib/types";
import { ArrowLeftDownIcon, ArrowLeftUpIcon } from "@solar-icons/react/outline";
import TomanIcon from "../toman-icon/TomanIcon";

const COLORS = {
  green: "#9fe870",
  red: "#f06060",
  yellow: "#f5d06e",
  blue: "#499af0",
};

export type Tone = keyof typeof COLORS;

const fmt = (v: number | string) =>
  typeof v === "number" ? v.toLocaleString("en-US") : v;

type StatCardProps = {
  title: string;
  icon: Icon;
  tone?: Tone;
  value?: number | string;

  unit?: string | null;

  delta?: {
    text: string;
    tone?: Tone;
    trend?: "up" | "down";
    label?: string;
  };
  loading?: boolean;
};

const StatCard = ({
  title,
  icon: CardIcon,
  tone = "green",
  value,
  unit = "toman",
  delta,
  loading,
}: StatCardProps) => {
  const color = COLORS[tone];
  const deltaColor = COLORS[delta?.tone ?? tone];
  const Arrow =
    delta?.trend === "up"
      ? ArrowLeftUpIcon
      : delta?.trend === "down"
        ? ArrowLeftDownIcon
        : null;

  return (
    <div className="box inverted-radius h-55 relative w-full overflow-hidden flex flex-col gap-y-8">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 100% 0%, ${color}2e, transparent 60%)`,
        }}
      />

      <div className="relative flex items-center gap-x-3.5">
        <div
          className="w-11.5 h-11.5 shrink-0 grid place-content-center rounded-full border"
          style={{ background: `${color}1f`, color, borderColor: `${color}40` }}
        >
          <CardIcon size={24} />
        </div>
        <p className="text-white text-[21px] truncate">{title}</p>
      </div>

      <div className="relative mr-2 space-y-4">
        {loading ? (
          <>
            <div className="h-10 w-52 rounded-lg bg-secondary animate-pulse" />
            <div className="h-7 w-40 rounded-full bg-secondary animate-pulse" />
          </>
        ) : (
          <>
            <p className="text-white font-semibold text-[40px] leading-none flex items-center gap-x-1">
              {value === undefined ? "—" : fmt(value)}
              {unit === "toman" ? (
                <span className="text-neutral-400">
                  <TomanIcon width="22" height="22" />
                </span>
              ) : unit ? (
                <span className="text-base font-normal text-neutral-400 mr-1">
                  {unit}
                </span>
              ) : null}
            </p>

            {delta && (
              <div className="flex items-center gap-x-3">
                <span
                  className="flex items-center gap-x-1 px-3 py-1.25 text-sm rounded-full border"
                  style={{
                    background: `${deltaColor}26`,
                    color: deltaColor,
                    borderColor: `${deltaColor}59`,
                  }}
                >
                  {delta.text}
                  {Arrow && (
                    <Arrow size={15} strokeWidth={2} className="-mt-0.5" />
                  )}
                </span>
                {delta.label && (
                  <p className="text-sm text-neutral-400 truncate">
                    {delta.label}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StatCard;
