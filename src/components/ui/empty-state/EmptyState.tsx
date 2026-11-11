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
    className={`flex flex-col items-center text-center ${compact ? "py-4" : "py-14"} ${className}`}
  >
    <img
      src={`/illustrations/${kind}.svg`}
      alt=""
      draggable={false}
      className={`select-none ${compact ? "w-36 h-27" : "w-60 h-45"}`}
    />
    <p
      className={`text-white font-semibold ${compact ? "text-base mt-2" : "text-xl mt-4"}`}
    >
      {title}
    </p>
    {description && (
      <p
        className={`text-neutral-400 leading-[1.9] max-w-sm ${compact ? "text-xs mt-1" : "text-sm mt-2"}`}
      >
        {description}
      </p>
    )}
    {action && (
      <Button
        className={`bg-primary text-black font-semibold rounded-xl ${compact ? "mt-3 h-10 px-5 text-sm" : "mt-6 h-12 px-6"}`}
        onPress={action.onPress}
      >
        {action.label}
      </Button>
    )}
  </div>
);

export default EmptyState;