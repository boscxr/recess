"use client";

import { CheckCircle2, Circle, MapPin } from "lucide-react";

interface BinationalTimelineProps {
  received_us_at: string | null;
  reviewed_us_at: string | null;
  received_mx_at: string | null;
  reviewed_mx_at: string | null;
  current_status: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface StepProps {
  label: string;
  sublabel: string;
  date: string | null;
  isComplete: boolean;
  isCurrent: boolean;
}

function TimelineStep({ label, sublabel, date, isComplete, isCurrent }: StepProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        {isComplete ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
        ) : isCurrent ? (
          <Circle className="h-5 w-5 text-blue-500 animate-pulse shrink-0" />
        ) : (
          <Circle className="h-5 w-5 text-gray-300 shrink-0" />
        )}
        <div className="w-px h-6 bg-gray-200" />
      </div>
      <div className="pb-4">
        <p className={`text-sm font-medium ${isComplete ? "text-foreground" : "text-muted-foreground"}`}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
        <p className={`text-xs mt-0.5 ${isComplete ? "text-emerald-600 font-medium" : "text-muted-foreground"}`}>
          {formatDate(date)}
        </p>
      </div>
    </div>
  );
}

export function BinationalTimeline({
  received_us_at,
  reviewed_us_at,
  received_mx_at,
  reviewed_mx_at,
  current_status,
}: BinationalTimelineProps) {
  const steps = [
    {
      label: "Recibido USA",
      sublabel: "Bodega RGV, McAllen TX",
      date: received_us_at,
      isComplete: !!received_us_at,
      isCurrent: !received_us_at && ["por_recibir", "parcialmente_recibido"].includes(current_status),
    },
    {
      label: "Revisado USA",
      sublabel: "Inspección en bodega USA",
      date: reviewed_us_at,
      isComplete: !!reviewed_us_at,
      isCurrent: !!received_us_at && !reviewed_us_at && current_status === "recibido",
    },
    {
      label: "Recibido México",
      sublabel: "Bodega Norcargo, Monterrey",
      date: received_mx_at,
      isComplete: !!received_mx_at,
      isCurrent: !!reviewed_us_at && !received_mx_at,
    },
    {
      label: "Revisado México",
      sublabel: "Inspección final MX",
      date: reviewed_mx_at,
      isComplete: !!reviewed_mx_at,
      isCurrent: !!received_mx_at && !reviewed_mx_at,
    },
  ];

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Tracking Binacional US → MX
        </h3>
      </div>
      <div>
        {steps.map((step, i) => (
          <TimelineStep key={i} {...step} />
        ))}
      </div>
    </div>
  );
}
