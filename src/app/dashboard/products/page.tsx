// app/products/page.tsx

import Image from 'next/image';
import Link from 'next/link';
import { buildQueryString } from '@/lib/utils'; // Puedes crear esta función
import { redirect } from 'next/navigation';
import {
  File,
  Home,
  LineChart,
  MoreHorizontal,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  ShoppingCart,
  Users2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import prisma from '@/lib/prisma';

// Importar el componente FilterDropdown
import FilterDropdown from '@/components/FilterDropdown';



// Definir el tipo para searchParams
interface ProductsPageProps {
  searchParams: {
    page?: string;
    categoryId?: string;
  };
}

// Definir el tipo para el producto
interface Product {
  id: number;
  name: string;
  description?: string | null;
  retailPrice: number;
  wholesalePrice: number;
  stock?: number | null;
  sku: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  favorite: boolean;
  brandId?: number | null;
  brand?: {
    id: number;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  images: {
    id: number;
    productId: number;
    imageUrl: string;
    altText?: string | null;
    imageOrder: number;
  }[];
  categories: {
    category: {
      id: number;
      name: string;
    };
  }[];
  _count: {
    orderItems: number;
  };
}

export default async function Products({ searchParams }: ProductsPageProps) {
  // Obtener el número de página
  const page = parseInt(searchParams.page || '1', 10);
  const itemsPerPage = 10;
  const skip = (page - 1) * itemsPerPage;

  // Obtener categoryId
  const selectedCategoryId = searchParams.categoryId
    ? parseInt(searchParams.categoryId, 10)
    : null;

  // Validaciones
  if (isNaN(page) || page < 1) {
    redirect('/products?page=1');
  }

  if (searchParams.categoryId && selectedCategoryId !== null && isNaN(selectedCategoryId)) {
    redirect('/products');
  }

  // Obtener el total de productos
  const totalProducts = await prisma.product.count({
    where: selectedCategoryId
      ? {
          categories: {
            some: {
              categoryId: selectedCategoryId,
            },
          },
        }
      : undefined,
  });

  // Calcular total de páginas
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  if (page > totalPages && totalPages > 0) {
    redirect('/products?page=1');
  }

  // Obtener productos
  const products = await prisma.product.findMany({
    skip,
    take: itemsPerPage,
    where: selectedCategoryId
      ? {
          categories: {
            some: {
              categoryId: selectedCategoryId,
            },
          },
        }
      : undefined,
    include: {
      images: true,
      brand: true,
      categories: {
        include: {
          category: true,
        },
      },
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
  });

  // Convertir a Product[]
  const productsList: Product[] = products;

  // Calcular rango de productos
  const start = skip + 1;
  const end = skip + products.length;

  // Mapear estados a etiquetas
  const statusLabels: { [key: string]: string } = {
    ACTIVE: 'Activo',
    DRAFT: 'Borrador',
    ARCHIVED: 'Archivado',
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        {/* Sección de encabezado */}
        {/* ... (tu código existente del encabezado) ... */}
        {/* Contenido Principal */}
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="ACTIVE">Active</TabsTrigger>
                <TabsTrigger value="DRAFT">Draft</TabsTrigger>
                <TabsTrigger value="ARCHIVED" className="hidden sm:flex">
                  Archived
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                {/* Integrar FilterDropdown */}
                <FilterDropdown selectedCategoryId={selectedCategoryId} />
                {/* Botones adicionales */}
                <Button size="sm" variant="outline" className="h-8 gap-1" asChild>
                    <Link href="/dashboard/products/import">
                        <File className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Import
                        </span>
                    </Link>
                </Button>

                {/* Menú desplegable de Exportación */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                      <File className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Export
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <a
                        href={`/api/products/export${buildQueryString({
                          ...searchParams,
                          format: 'csv',
                        })}`}
                      >
                        Exportar como CSV
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={`/api/products/export${buildQueryString({
                          ...searchParams,
                          format: 'xlsx',
                        })}`}
                      >
                        Exportar como XLSX
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={`/api/products/export${buildQueryString({
                          ...searchParams,
                          format: 'json',
                        })}`}
                      >
                        Exportar como JSON
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>





                <Button size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Product
                  </span>
                </Button>
              </div>
            </div>
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>Productos</CardTitle>
                  <CardDescription>
                    Administra tus productos y visualiza su rendimiento en ventas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                          <span className="sr-only">Image</span>
                        </TableHead>
                        <TableHead className="w-[400px]">Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Price
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Total Sales
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Created At
                        </TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsList.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="hidden sm:table-cell">
                            {product.images[0] && (
                              <Image
                                src={product.images[0].imageUrl}
                                alt={product.name}
                                width={64}
                                height={64}
                                className="aspect-square rounded-md object-cover"
                              />
                            )}
                          </TableCell>
                          <TableCell className="font-medium w-[400px]">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {statusLabels[product.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            ${product.retailPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {product._count.orderItems}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {product.createdAt.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Mostrar menú</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                <DropdownMenuItem>Eliminar</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center justify-between w-full">
                    <div className="text-xs text-muted-foreground">
                      Mostrando <strong>{start}-{end}</strong> de{' '}
                      <strong>{totalProducts}</strong> productos
                    </div>
                    <div className="flex space-x-2">
                      {page > 1 && (
                        <Link
                          href={`?${new URLSearchParams({
                            ...searchParams,
                            page: (page - 1).toString(),
                          }).toString()}`}
                        >
                          <Button variant="outline" size="sm">
                            Anterior
                          </Button>
                        </Link>
                      )}
                      {page < totalPages && (
                        <Link
                          href={`?${new URLSearchParams({
                            ...searchParams,
                            page: (page + 1).toString(),
                          }).toString()}`}
                        >
                          <Button variant="outline" size="sm">
                            Siguiente
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
