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
    <div className="box inverted-radius relative flex h-46 w-full min-w-0 flex-col justify-between gap-y-3 overflow-hidden lg:h-55 lg:justify-start lg:gap-y-8">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 100% 0%, ${color}2e, transparent 60%)`,
        }}
      />

      <div className="relative flex items-center gap-x-3 sm:gap-x-3.5">
        <div
          className="grid size-9 shrink-0 place-content-center rounded-full border sm:size-11.5"
          style={{ background: `${color}1f`, color, borderColor: `${color}40` }}
        >
          <CardIcon size={20} />
        </div>
        <p className="truncate text-base text-white sm:text-[21px]">{title}</p>
      </div>

      <div className="relative mr-1 min-w-0 sm:mr-2 pb-1">
        {loading ? (
          <div className="h-8 w-44 animate-pulse rounded-lg bg-secondary sm:h-10 sm:w-52" />
        ) : (
          <div className="flex min-w-0 flex-col items-start gap-y-3 sm:gap-y-4">
            <p className="flex items-center gap-x-1 text-2xl font-semibold leading-none text-white sm:text-[40px]">
              {value === undefined ? "—" : fmt(value)}
              {unit === "toman" ? (
                <span className="text-neutral-400">
                  <TomanIcon width="20" height="20" />
                </span>
              ) : unit ? (
                <span className="mr-1 text-base font-normal text-neutral-400">
                  {unit}
                </span>
              ) : null}
            </p>

            {delta && (
              <div className="flex min-w-0 max-w-full items-center gap-x-3">
                <span
                  className="flex min-w-0 max-w-full items-center gap-x-1 rounded-full border px-3 py-1.25 text-sm"
                  style={{
                    background: `${deltaColor}26`,
                    color: deltaColor,
                    borderColor: `${deltaColor}59`,
                  }}
                >
                  <span className="truncate">{delta.text}</span>
                  {Arrow && (
                    <Arrow
                      size={15}
                      strokeWidth={2}
                      className="-mt-0.5 shrink-0"
                    />
                  )}
                </span>
                {delta.label && (
                  <p className="truncate text-sm text-neutral-400">
                    {delta.label}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
