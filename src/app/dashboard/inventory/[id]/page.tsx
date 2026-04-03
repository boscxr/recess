import Link from "next/link";
import {
  ArrowLeft,
  Box,
  MapPin,
  FileText,
  Tag,
  Clock,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { fetchPiece } from "@/lib/recreo-api";
import { BinationalTimeline } from "@/components/inventory/binational-timeline";
import { StatusBadge } from "@/components/inventory/status-badge";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface PageProps {
  params: { id: string };
}

export default async function PieceDetailPage({ params }: PageProps) {
  let piece;
  try {
    const res = await fetchPiece(params.id);
    piece = res.data;
  } catch {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium">Pieza no encontrada</h2>
        <p className="text-sm text-muted-foreground mt-1">
          No se pudo cargar la pieza. Verifica la conexión con la API.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard/inventory">Volver al inventario</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/inventory">Inventario</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{piece.folio || piece.serial_number}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-6">
          {/* Back + Title */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/inventory">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">
                {piece.folio || piece.serial_number}
              </h1>
              <p className="text-sm text-muted-foreground">{piece.full_description}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <StatusBadge label={piece.status_label} color={piece.status_color} />
              <Badge variant="outline" className="text-xs">
                {piece.origin_type === "imported" ? "🇺🇸 Importado" : "🇲🇽 Nacional"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Left column: Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Piece Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Información de la Pieza</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Serial</p>
                      <p className="font-mono font-medium">{piece.serial_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">QR Code</p>
                      <p className="font-mono font-medium">{piece.qr_code}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Folio</p>
                      <p className="font-mono font-medium">{piece.folio || "Sin asignar"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Condición</p>
                      <p className="font-medium capitalize">{piece.condition}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cantidad</p>
                      <p className="font-medium">{piece.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Días en estado actual</p>
                      <p className="font-medium">{piece.days_in_current_status} días</p>
                    </div>
                    {piece.brand && (
                      <div>
                        <p className="text-muted-foreground">Marca</p>
                        <p className="font-medium">{piece.brand}</p>
                      </div>
                    )}
                    {piece.model && (
                      <div>
                        <p className="text-muted-foreground">Modelo</p>
                        <p className="font-medium">{piece.model}</p>
                      </div>
                    )}
                    {piece.color && (
                      <div>
                        <p className="text-muted-foreground">Color</p>
                        <p className="font-medium">{piece.color}</p>
                      </div>
                    )}
                    {piece.dimensions && (
                      <div>
                        <p className="text-muted-foreground">Dimensiones</p>
                        <p className="font-medium">{piece.dimensions}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Context: Project, Location, Box, Invoice */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contexto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">Proyecto</p>
                        <p className="font-medium">{piece.project?.name || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">Ubicación actual</p>
                        <p className="font-medium">{piece.current_location?.name || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Box className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">Caja</p>
                        <p className="font-medium">
                          {piece.inventory_box
                            ? `${piece.inventory_box.box_number}${
                                piece.inventory_box.sequence_label
                                  ? ` (${piece.inventory_box.sequence_label})`
                                  : ""
                              }`
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">Factura</p>
                        <p className="font-medium">
                          {piece.invoice_info
                            ? `${piece.invoice_info.invoice_number} (${piece.invoice_info.supplier_name})`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {(piece.notes || piece.reception_notes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {piece.notes && (
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Generales</p>
                        <p>{piece.notes}</p>
                      </div>
                    )}
                    {piece.reception_notes && (
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Recepción</p>
                        <p>{piece.reception_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Movements History */}
              {piece.recent_movements && piece.recent_movements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Historial de Movimientos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>De</TableHead>
                          <TableHead>A</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="hidden md:table-cell">Por</TableHead>
                          <TableHead>Fecha</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {piece.recent_movements.map((mov) => (
                          <TableRow key={mov.id}>
                            <TableCell className="text-sm">
                              {mov.from_status || "—"}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {mov.to_status}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {mov.movement_type === "status_change"
                                  ? "Estado"
                                  : "Traslado"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                              {mov.performed_by || "Sistema"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatDate(mov.created_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column: Timeline + Quick Actions */}
            <div className="space-y-6">
              {/* Binational Timeline */}
              <Card>
                <CardContent className="pt-6">
                  <BinationalTimeline
                    received_us_at={piece.received_us_at}
                    reviewed_us_at={piece.reviewed_us_at}
                    received_mx_at={piece.received_mx_at}
                    reviewed_mx_at={piece.reviewed_mx_at}
                    current_status={piece.current_status}
                  />
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Fechas Clave</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creado</span>
                    <span>{formatDate(piece.created_at)}</span>
                  </div>
                  {piece.received_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recibido</span>
                      <span>{formatDate(piece.received_at)}</span>
                    </div>
                  )}
                  {piece.delivered_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entregado</span>
                      <span>{formatDate(piece.delivered_at)}</span>
                    </div>
                  )}
                  {piece.days_since_received !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Días desde recepción</span>
                      <span className="font-medium">{piece.days_since_received}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Valid Next Statuses */}
              {piece.valid_next_statuses && piece.valid_next_statuses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Transiciones Disponibles</CardTitle>
                    <CardDescription className="text-xs">
                      Estados a los que se puede mover esta pieza
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {piece.valid_next_statuses.map((ns) => (
                      <div
                        key={ns.key}
                        className="flex items-center justify-between p-2 rounded-md border text-sm"
                      >
                        <span>{ns.label}</span>
                        {ns.requires_evidence && (
                          <Badge variant="outline" className="text-xs">
                            Requiere evidencia
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
