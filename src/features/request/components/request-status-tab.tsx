"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestStatus } from "@/entities/request";
import { cn } from "@/lib/utils";
import type { RequestFilterStatus } from "../hooks/use-request-filter-status";

const STATUSES = [
  { label: "すべて", value: "all" },
  { label: "承認待ち", value: RequestStatus.Pending },
  { label: "承認済み", value: RequestStatus.Approved },
  { label: "精算済み", value: RequestStatus.Paid },
  { label: "拒否", value: RequestStatus.Rejected },
] as const satisfies readonly {
  label: string;
  value: RequestFilterStatus;
}[];

const REQUEST_FILTER_VALUES = STATUSES.map((s) => s.value);

const isRequestFilterStatus = (value: string): value is RequestFilterStatus => {
  return REQUEST_FILTER_VALUES.includes(value as RequestFilterStatus);
};

type Props = {
  value: RequestFilterStatus;
  onChange: (value: RequestFilterStatus) => void;
  counts: Record<RequestFilterStatus, number>;
};

export function RequestFilterTabs({ value, onChange, counts }: Props) {
  const handleChange = (v: string) => {
    if (isRequestFilterStatus(v)) {
      onChange(v);
    }
  };

  return (
    <>
      <div className="hidden sm:block">
        <Tabs value={value} onValueChange={handleChange}>
          <TabsList className="gap-4 bg-transparent p-0">
            {STATUSES.map(({ label, value: tabValue }) => {
              const active = value === tabValue;

              return (
                <TabsTrigger
                  key={tabValue}
                  value={tabValue}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all",
                    active
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <span>{label}</span>

                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-medium text-xs",
                      active
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600",
                    )}
                  >
                    {counts[tabValue] ?? 0}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      <div className="sm:hidden">
        <Select value={value} onValueChange={handleChange}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="ステータスを選択" />
          </SelectTrigger>

          <SelectContent>
            {STATUSES.map(({ label, value: tabValue }) => {
              const active = value === tabValue;

              return (
                <SelectItem
                  key={tabValue}
                  value={tabValue}
                  className="flex items-center justify-between"
                >
                  <span>{label}</span>

                  <span
                    className={cn(
                      "rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600 text-xs",
                    )}
                  >
                    {counts[tabValue] ?? 0}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
