import Link from "next/link";
import { Box, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Progress } from "@/components/ui/progress";

import { fetchBoxes } from "@/lib/recreo-api";

const BOX_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Activa", color: "bg-green-100 text-green-800" },
  closed: { label: "Cerrada", color: "bg-gray-100 text-gray-800" },
  in_transit: { label: "En Tránsito", color: "bg-yellow-100 text-yellow-800" },
};

interface PageProps {
  searchParams: {
    page?: string;
    status?: string;
  };
}

export default async function BoxesPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || "1", 10);
  const status = searchParams.status || undefined;

  let boxes: Awaited<ReturnType<typeof fetchBoxes>>;
  try {
    boxes = await fetchBoxes({ page, per_page: 20, status });
  } catch {
    boxes = {
      success: false,
      data: [],
      meta: { pagination: { page: 1, per_page: 20, total: 0, pages: 0 } },
    };
  }

  const { data, meta } = boxes;
  const { pagination } = meta;

  function qs(overrides: Record<string, string>) {
    const params = new URLSearchParams({
      ...(status ? { status } : {}),
      page: String(page),
      ...overrides,
    });
    return `?${params.toString()}`;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
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
                <BreadcrumbPage>Cajas</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {/* Navigation tabs */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/inventory">Piezas</Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link href="/dashboard/inventory/boxes">Cajas</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/inventory/reception">Recepciones</Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5" />
                Cajas de Inventario
              </CardTitle>
              <CardDescription>
                Cajas físicas con tracking &quot;Caja X de Y&quot; para envíos.
                {pagination.total > 0 && ` ${pagination.total} cajas.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Box className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Sin cajas</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {!boxes.success
                      ? "No se pudo conectar con la API."
                      : "No hay cajas registradas aún."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Caja</TableHead>
                      <TableHead>Secuencia</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="hidden md:table-cell">Proyecto</TableHead>
                      <TableHead className="hidden md:table-cell">Ubicación</TableHead>
                      <TableHead>Piezas</TableHead>
                      <TableHead className="hidden lg:table-cell">Estado Piezas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((box) => {
                      const statusInfo = BOX_STATUS_LABELS[box.status] || {
                        label: box.status,
                        color: "",
                      };
                      const totalPieces = Object.values(box.pieces_by_status || {}).reduce(
                        (a, b) => a + b,
                        0
                      );
                      const receivedPieces =
                        (box.pieces_by_status?.recibido || 0) +
                        (box.pieces_by_status?.revisado || 0) +
                        (box.pieces_by_status?.en_almacen || 0) +
                        (box.pieces_by_status?.entregado || 0);
                      const progress = totalPieces > 0 ? (receivedPieces / totalPieces) * 100 : 0;

                      return (
                        <TableRow key={box.id}>
                          <TableCell>
                            <p className="font-mono text-sm font-medium">{box.box_number}</p>
                            <p className="text-xs text-muted-foreground">{box.qr_code}</p>
                          </TableCell>
                          <TableCell>
                            {box.sequence_label ? (
                              <Badge variant="outline" className="text-xs font-medium">
                                {box.sequence_label}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${statusInfo.color}`}>
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {box.project?.name || "—"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {box.location?.name || "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium">{box.pieces_count}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell w-[180px]">
                            <div className="space-y-1">
                              <Progress value={progress} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                {receivedPieces}/{totalPieces} procesadas
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            {pagination.pages > 1 && (
              <CardFooter>
                <div className="flex items-center justify-between w-full">
                  <p className="text-xs text-muted-foreground">
                    Página {pagination.page} de {pagination.pages}
                  </p>
                  <div className="flex gap-2">
                    {page > 1 && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={qs({ page: String(page - 1) })}>
                          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                        </Link>
                      </Button>
                    )}
                    {page < pagination.pages && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={qs({ page: String(page + 1) })}>
                          Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
