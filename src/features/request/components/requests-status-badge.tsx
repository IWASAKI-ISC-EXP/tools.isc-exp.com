import { Check, Clock, DollarSign, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RequestFilterStatus } from "./requests-filter-tabs";

type Props = {
  status: Exclude<RequestFilterStatus, "all">;
};

const STATUS_CONFIG = {
  pending: {
    label: "承認待ち",
    className: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  approved: {
    label: "精算待ち",
    className: "bg-blue-100 text-blue-800",
    icon: DollarSign,
  },
  rejected: {
    label: "拒否",
    className: "bg-red-100 text-red-800",
    icon: X,
  },
  paid: {
    label: "精算済み",
    className: "bg-green-100 text-green-800",
    icon: Check,
  },
} as const;

export function RequestStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium text-xs",
        config.className,
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full">
        <Icon className="h-3 w-3" />
      </span>
      {config.label}
    </span>
  );
}
