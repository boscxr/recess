"use client";

import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  slate: "bg-slate-100 text-slate-800 border-slate-300",
  gray: "bg-gray-100 text-gray-800 border-gray-300",
  sky: "bg-sky-100 text-sky-800 border-sky-300",
  blue: "bg-blue-100 text-blue-800 border-blue-300",
  purple: "bg-purple-100 text-purple-800 border-purple-300",
  green: "bg-green-100 text-green-800 border-green-300",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-300",
  red: "bg-red-100 text-red-800 border-red-300",
  orange: "bg-orange-100 text-orange-800 border-orange-300",
};

interface StatusBadgeProps {
  label: string;
  color: string;
}

export function StatusBadge({ label, color }: StatusBadgeProps) {
  const colorClasses = STATUS_COLORS[color] || STATUS_COLORS.gray;
  return (
    <Badge variant="outline" className={`${colorClasses} text-xs font-medium`}>
      {label}
    </Badge>
  );
}
