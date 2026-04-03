import Link from "next/link";
import {
  Package,
  Search,
  Box,
  ClipboardList,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { fetchPieces } from "@/lib/recreo-api";

// Status color mapping
const STATUS_COLORS: Record<string, string> = {
  slate: "bg-slate-100 text-slate-800",
  gray: "bg-gray-100 text-gray-800",
  sky: "bg-sky-100 text-sky-800",
  blue: "bg-blue-100 text-blue-800",
  purple: "bg-purple-100 text-purple-800",
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  emerald: "bg-emerald-100 text-emerald-800",
  red: "bg-red-100 text-red-800",
  orange: "bg-orange-100 text-orange-800",
};

interface PageProps {
  searchParams: {
    page?: string;
    status?: string;
    origin_type?: string;
    search?: string;
  };
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || "1", 10);
  const status = searchParams.status || undefined;
  const origin_type = searchParams.origin_type || undefined;
  const search = searchParams.search || undefined;

  let pieces: Awaited<ReturnType<typeof fetchPieces>>;
  try {
    pieces = await fetchPieces({
      page,
      per_page: 20,
      status,
      origin_type,
      search,
      sort: "created_at",
      direction: "desc",
    });
  } catch {
    // If API is unavailable, show empty state
    pieces = {
      success: false,
      data: [],
      meta: {
        pagination: { page: 1, per_page: 20, total: 0, pages: 0 },
        status_counts: {},
      },
    };
  }

  const { data, meta } = pieces;
  const { pagination, status_counts } = meta;
  const totalPieces = Object.values(status_counts || {}).reduce((a, b) => a + b, 0);

  // Build query string helper
  function qs(overrides: Record<string, string>) {
    const params = new URLSearchParams({
      ...(status ? { status } : {}),
      ...(origin_type ? { origin_type } : {}),
      ...(search ? { search } : {}),
      page: String(page),
      ...overrides,
    });
    return `?${params.toString()}`;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        {/* Breadcrumb */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Inventario</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Piezas</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPieces}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Por Recibir</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(status_counts?.por_recibir || 0) + (status_counts?.parcialmente_recibido || 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Almacén</CardTitle>
                <Box className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status_counts?.en_almacen || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entregados</CardTitle>
                <Package className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status_counts?.entregado || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation tabs */}
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" asChild>
              <Link href="/dashboard/inventory">Piezas</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/inventory/boxes">Cajas</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/inventory/reception">Recepciones</Link>
            </Button>
          </div>

          {/* Main Table */}
          <Tabs defaultValue={status || "all"}>
            <div className="flex items-center gap-2">
              <TabsList>
                <TabsTrigger value="all" asChild>
                  <Link href={qs({ status: "", page: "1" })}>Todos</Link>
                </TabsTrigger>
                <TabsTrigger value="por_recibir" asChild>
                  <Link href={qs({ status: "por_recibir", page: "1" })}>Por Recibir</Link>
                </TabsTrigger>
                <TabsTrigger value="recibido" asChild>
                  <Link href={qs({ status: "recibido", page: "1" })}>Recibidos</Link>
                </TabsTrigger>
                <TabsTrigger value="en_almacen" asChild>
                  <Link href={qs({ status: "en_almacen", page: "1" })}>En Almacén</Link>
                </TabsTrigger>
                <TabsTrigger value="entregado" asChild>
                  <Link href={qs({ status: "entregado", page: "1" })}>Entregados</Link>
                </TabsTrigger>
              </TabsList>

              <div className="ml-auto flex items-center gap-2">
                {/* Origin type filter */}
                <div className="flex gap-1">
                  <Button
                    variant={origin_type === "imported" ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    asChild
                  >
                    <Link href={qs({ origin_type: origin_type === "imported" ? "" : "imported", page: "1" })}>
                      Importado
                    </Link>
                  </Button>
                  <Button
                    variant={origin_type === "national" ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    asChild
                  >
                    <Link href={qs({ origin_type: origin_type === "national" ? "" : "national", page: "1" })}>
                      Nacional
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Piezas de Inventario</CardTitle>
                <CardDescription>
                  Tracking de piezas con seguimiento binacional US → MX.
                  {pagination.total > 0 && ` ${pagination.total} piezas encontradas.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Sin piezas</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {!pieces.success
                        ? "No se pudo conectar con la API. Verifica la configuración."
                        : "No hay piezas que coincidan con los filtros seleccionados."}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[140px]">Folio</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="hidden md:table-cell">Origen</TableHead>
                        <TableHead className="hidden md:table-cell">Ubicación</TableHead>
                        <TableHead className="hidden lg:table-cell">Caja</TableHead>
                        <TableHead className="hidden lg:table-cell">US</TableHead>
                        <TableHead className="hidden lg:table-cell">MX</TableHead>
                        <TableHead className="hidden md:table-cell">Días</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((piece) => (
                        <TableRow key={piece.id}>
                          <TableCell>
                            <Link
                              href={`/dashboard/inventory/${piece.id}`}
                              className="font-mono text-sm font-medium text-blue-600 hover:underline"
                            >
                              {piece.folio || piece.serial_number}
                            </Link>
                            {piece.folio && (
                              <p className="text-xs text-muted-foreground">{piece.serial_number}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-sm truncate max-w-[200px]">
                              {piece.product?.name || piece.description || "—"}
                            </p>
                            {piece.brand && (
                              <p className="text-xs text-muted-foreground">{piece.brand}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs ${STATUS_COLORS[piece.status_color] || ""}`}
                            >
                              {piece.status_label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className="text-xs">
                              {piece.origin_type === "imported" ? "🇺🇸 Import" : "🇲🇽 Nacional"}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {piece.current_location?.name || "—"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                            {piece.inventory_box?.sequence_label || piece.inventory_box?.box_number || "—"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {piece.received_us_at ? (
                              <span className="text-xs text-emerald-600">✓</span>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {piece.received_mx_at ? (
                              <span className="text-xs text-emerald-600">✓</span>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {piece.days_in_current_status}d
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              {pagination.pages > 1 && (
                <CardFooter>
                  <div className="flex items-center justify-between w-full">
                    <p className="text-xs text-muted-foreground">
                      Página {pagination.page} de {pagination.pages} ({pagination.total} piezas)
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
          </Tabs>
        </main>
      </div>
    </div>
  );
}
