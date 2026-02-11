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
import type { RequestFilterStatus } from "../hooks/use-new-request-form";

const STATUSES: { label: string; value: RequestFilterStatus }[] = [
  { label: "すべて", value: "all" },
  { label: "承認待ち", value: RequestStatus.Pending },
  { label: "承認済み", value: RequestStatus.Approved },
  { label: "精算済み", value: RequestStatus.Paid },
  { label: "拒否", value: RequestStatus.Rejected },
];

const REQUEST_FILTER_VALUES = STATUSES.map((s) => s.value);

const isRequestFilterStatus = (value: string): value is RequestFilterStatus => {
  return REQUEST_FILTER_VALUES.includes(value as RequestFilterStatus);
};

type Props = {
  value: RequestFilterStatus;
  onChange: (value: RequestFilterStatus) => void;
  counts: Record<RequestFilterStatus, number>;
};

export function MeRequestsTabs({ value, onChange, counts }: Props) {
  return (
    <>
      <div className="hidden sm:block">
        <Tabs
          value={value}
          onValueChange={(v) => {
            if (isRequestFilterStatus(v)) {
              onChange(v);
            }
          }}
        >
          <TabsList className="gap-4 bg-transparent p-0">
            {STATUSES.map(({ label, value }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-xl bg-white px-4 py-2 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {label} ({counts[value] ?? 0})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="sm:hidden">
        <Select
          value={value}
          onValueChange={(v) => {
            if (isRequestFilterStatus(v)) {
              onChange(v);
            }
          }}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="ステータスを選択" />
          </SelectTrigger>

          <SelectContent>
            {STATUSES.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label} ({counts[value] ?? 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
