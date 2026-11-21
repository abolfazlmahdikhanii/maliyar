import { Button } from "@heroui/react";

type EmptyKind =
  | "checks"
  | "goals"
  | "subscriptions"
  | "dues"
  | "loans"
  | "budgets"
  | "accounts"
  | "transactions";

type EmptyStateProps = {
  kind: EmptyKind;
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
  compact?: boolean;
  className?: string;
};

const EmptyState = ({
  kind,
  title,
  description,
  action,
  compact = false,
  className = "",
}: EmptyStateProps) => (
  <div
    className={`flex flex-col items-center px-2 text-center ${
      compact ? "py-4" : "py-8 sm:py-14"
    } ${className}`}
  >
    <img
      src={`/illustrations/${kind}.svg`}
      alt=""
      draggable={false}
      className={`h-auto max-w-full select-none ${
        compact ? "w-32 sm:w-36" : "w-44 sm:w-60"
      }`}
    />
    <p
      className={`font-semibold text-white ${
        compact ? "mt-2 text-base" : "mt-3 text-lg sm:mt-4 sm:text-xl"
      }`}
    >
      {title}
    </p>
    {description && (
      <p
        className={`max-w-sm leading-[1.9] text-neutral-400 ${
          compact ? "mt-1 text-xs" : "mt-2 text-xs sm:text-sm"
        }`}
      >
        {description}
      </p>
    )}
    {action && (
      <Button
        className={`rounded-xl bg-primary font-semibold text-black ${
          compact
            ? "mt-3 h-10 px-5 text-sm"
            : "mt-5 h-11 px-6 sm:mt-6 sm:h-12"
        }`}
        onPress={action.onPress}
      >
        {action.label}
      </Button>
    )}
  </div>
);

export default EmptyState;