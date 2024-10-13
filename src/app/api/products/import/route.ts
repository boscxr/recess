import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { htmlToText } from 'html-to-text'; // Importar la función

export async function POST(request: Request) {
  try {
    const { data } = await request.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // Validar y transformar los datos
    const transformedData = data.map((item) => {
      // Convertir description de HTML a texto plano
      const plainDescription = item.description
        ? htmlToText(item.description, {
            wordwrap: false,
            // Puedes agregar opciones adicionales si lo deseas
          })
        : null;

      return {
        name: item.name,
        description: plainDescription,
        retailPrice: parseFloat(item.retailPrice),
        wholesalePrice: parseFloat(item.wholesalePrice),
        stock: item.stock ? parseInt(item.stock, 10) : null,
        sku: item.sku,
        status: item.status as 'ACTIVE' | 'DRAFT' | 'ARCHIVED',
        favorite: item.favorite === 'true' || item.favorite === true,
        brandId: item.brandId ? parseInt(item.brandId, 10) : null,
        // Añade más campos según sea necesario
      };
    });

    // Insertar los productos en la base de datos
    await prisma.product.createMany({
      data: transformedData,
      skipDuplicates: true, // Evitar insertar duplicados si sku es único
    });

    return NextResponse.json({ message: 'Productos importados exitosamente' });
  } catch (error) {
    console.error('Error al importar productos:', error);
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
