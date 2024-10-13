import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parse as json2csv } from 'json2csv';
import { utils, write } from 'xlsx';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Obtener filtros de los parámetros de consulta
    const selectedCategoryId = searchParams.get('categoryId')
      ? parseInt(searchParams.get('categoryId')!, 10)
      : null;

    const format = searchParams.get('format') || 'csv';

    // Construir el whereClause para aplicar los filtros
    const whereClause = {
      ...(selectedCategoryId
        ? {
            categories: {
              some: {
                categoryId: selectedCategoryId,
              },
            },
          }
        : {}),
    };

    // Obtener todos los productos que coincidan con los filtros
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        images: true,
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    // Transformar los datos para la exportación
    const data = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      retailPrice: product.retailPrice,
      wholesalePrice: product.wholesalePrice,
      stock: product.stock,
      sku: product.sku,
      status: product.status,
      favorite: product.favorite,
      brand: product.brand?.name,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      images: product.images.map((img) => img.imageUrl).join(';'),
      categories: product.categories.map((cat) => cat.category.name).join(';'),
    }));

    let fileContent: any;
    let contentType: string;
    let fileName: string;

    if (format === 'csv') {
      // Exportar como CSV
      const fields = [
        'id',
        'name',
        'description',
        'retailPrice',
        'wholesalePrice',
        'stock',
        'sku',
        'status',
        'favorite',
        'brand',
        'createdAt',
        'updatedAt',
        'images',
        'categories',
      ];
      fileContent = json2csv(data, { fields });
      contentType = 'text/csv';
      fileName = 'products_export.csv';
    } else if (format === 'xlsx') {
      // Exportar como XLSX
      const worksheet = utils.json_to_sheet(data);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Productos');
      const buffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });
      fileContent = Buffer.from(buffer);
      contentType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileName = 'products_export.xlsx';
    } else if (format === 'json') {
      // Exportar como JSON
      fileContent = JSON.stringify(data, null, 2);
      contentType = 'application/json';
      fileName = 'products_export.json';
    } else {
      return NextResponse.json(
        { error: 'Formato inválido' },
        { status: 400 }
      );
    }

    // Configurar la respuesta para descargar el archivo
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error al exportar productos:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
