import Link from "next/link";
import {
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
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

import { fetchReceipts } from "@/lib/recreo-api";

const RECEIPT_STATUS: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Pendiente", color: "bg-gray-100 text-gray-800", icon: Clock },
  in_progress: { label: "En Proceso", color: "bg-blue-100 text-blue-800", icon: Clock },
  completed: { label: "Completada", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

interface PageProps {
  searchParams: {
    page?: string;
    status?: string;
  };
}

export default async function ReceptionPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || "1", 10);
  const status = searchParams.status || undefined;

  let receipts: Awaited<ReturnType<typeof fetchReceipts>>;
  try {
    receipts = await fetchReceipts({ page, per_page: 20, status });
  } catch {
    receipts = {
      success: false,
      data: [],
      meta: { pagination: { page: 1, per_page: 20, total: 0, pages: 0 } },
    };
  }

  const { data, meta } = receipts;
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
                <BreadcrumbPage>Recepciones</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/inventory">Piezas</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/inventory/boxes">Cajas</Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link href="/dashboard/inventory/reception">Recepciones</Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Recepciones de Inventario
              </CardTitle>
              <CardDescription>
                Recepciones de mercancía en bodegas US y MX.
                {pagination.total > 0 && ` ${pagination.total} recepciones.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Sin recepciones</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {!receipts.success
                      ? "No se pudo conectar con la API."
                      : "No hay recepciones registradas."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recepción</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="hidden md:table-cell">Proyecto</TableHead>
                      <TableHead className="hidden md:table-cell">Ubicación</TableHead>
                      <TableHead>Progreso</TableHead>
                      <TableHead className="hidden md:table-cell">Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((receipt) => {
                      const statusInfo = RECEIPT_STATUS[receipt.status] || {
                        label: receipt.status,
                        color: "",
                        icon: Clock,
                      };
                      const progress =
                        receipt.expected_pieces_count > 0
                          ? (receipt.received_pieces_count / receipt.expected_pieces_count) * 100
                          : 0;

                      return (
                        <TableRow key={receipt.id}>
                          <TableCell>
                            <p className="font-mono text-sm font-medium">
                              {receipt.receipt_number}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${statusInfo.color}`}>
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {receipt.project?.name || "—"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {receipt.location?.name || "—"}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 w-[140px]">
                              <Progress value={progress} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                {receipt.received_pieces_count}/{receipt.expected_pieces_count} piezas
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                            {new Date(receipt.created_at).toLocaleDateString("es-MX", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
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
