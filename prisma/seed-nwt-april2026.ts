import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  // AGAVE SPIRITS — Tequila Coracho
  { sku: 'ST-TCB-B700', name: 'Tequila Coracho Blanco', description: 'Tequila Blanco 700ml', retailPrice: 66.50, wholesalePrice: 48.67, stock: 587 },
  { sku: 'ST-TCR-B700', name: 'Tequila Coracho Rosa', description: 'Tequila Rosa 700ml', retailPrice: 79.50, wholesalePrice: 58.33, stock: 240 },
  { sku: 'ST-TCRP-B700', name: 'Tequila Coracho Reposado', description: 'Tequila Reposado 700ml', retailPrice: 85.00, wholesalePrice: 62.33, stock: 113 },
  { sku: 'ST-TCA-B700', name: 'Tequila Coracho Añejo', description: 'Tequila Añejo 700ml', retailPrice: 135.00, wholesalePrice: 99.17, stock: 160 },
  { sku: 'ST-TCC-B700', name: 'Tequila Coracho Cristalino', description: 'Tequila Cristalino 700ml', retailPrice: 140.00, wholesalePrice: 102.50, stock: 88 },
  { sku: 'ST-TCEA-B700', name: 'Tequila Coracho Extra Añejo', description: 'Tequila Extra Añejo 700ml', retailPrice: 240.00, wholesalePrice: 175.83, stock: 88 },

  // AGAVE SPIRITS — Mezcal & Raicilla
  { sku: 'SR-AR-B750', name: 'Antoriano Raicilla', description: 'Raicilla 750ml', retailPrice: 74.99, wholesalePrice: 54.17, stock: 66 },
  { sku: 'SM-TE45-B750', name: 'Mezcal Enmascarado 45', description: 'Artisanal Mezcal 45 ABV 750ml', retailPrice: 59.99, wholesalePrice: 41.38, stock: 130 },
  { sku: 'SM-RE54-B750', name: 'Mezcal Enmascarado 54', description: 'Artisanal Mezcal 54 ABV 750ml', retailPrice: 63.99, wholesalePrice: 44.13, stock: 236 },
  { sku: 'SM-LCC-B750', name: 'La Clandestina Espadin Cafe', description: 'Artisanal Mezcal distilled w/Coffee Beans 750ml', retailPrice: 83.99, wholesalePrice: 58.13, stock: 30 },
  { sku: 'SM-LCCAO-B750', name: 'La Clandestina Espadin Cacao', description: 'Artisanal Mezcal distilled w/Cacao Beans 750ml', retailPrice: 83.99, wholesalePrice: 58.13, stock: 15 },
  { sku: 'SM-LCEA-B750', name: 'Espadin Abocado', description: 'Artisanal Mezcal aged in White Oak 750ml', retailPrice: 59.99, wholesalePrice: 42.13, stock: 18 },
  { sku: 'SM-LCE40-B750', name: 'Espadin 40', description: 'Artisanal Mezcal 40 ABV 750ml', retailPrice: 49.99, wholesalePrice: 36.25, stock: 7 },

  // GIN & VODKA
  { sku: 'SV-E18GC-B750', name: 'Baja Gin w/Natural Citrus', description: 'Baja Gin w/Natural Citrus 750ml', retailPrice: 37.99, wholesalePrice: 26.25, stock: 357 },
  { sku: 'SV-E18GC-B751', name: 'Enmienda 18 Gin Añejo', description: 'Oak Barrel Aged Baja Gin 750ml', retailPrice: 38.99, wholesalePrice: 27.00, stock: 65 },
  { sku: 'SV-E18GC-B752', name: 'Enmienda 18 Vodka', description: 'Premium Baja Vodka 750ml', retailPrice: 34.99, wholesalePrice: 23.92, stock: 131 },

  // VINO — Casa Baloyán
  { sku: 'RW-CB-TT18-B750', name: 'Casa Baloyán Tres Tintos', description: '2018 Aged 24 month in French Oak 750ml', retailPrice: 49.99, wholesalePrice: 35.08, stock: 230 },
  { sku: 'RW-CB-M19-B750', name: 'Casa Baloyán Merlot', description: '2019 Aged 36 month in French & Neutral Oak 750ml', retailPrice: 49.99, wholesalePrice: 35.08, stock: 225 },
  { sku: 'RW-CB-GVR19-B750', name: 'Casa Baloyán Gran Vin Reserva', description: '2019 Cabernet Sauvignon Reserva 42 months in French Oak Barrel 750ml', retailPrice: 94.99, wholesalePrice: 67.50, stock: 197 },

  // VINO — Cava Dragón
  { sku: 'WW-BCD-D19-B750', name: 'Cava Dragon 2019 Drekis', description: 'Baja Sauvignon Blanc & French Colombard Blend 750ml', retailPrice: 24.99, wholesalePrice: 17.50, stock: 64 },
  { sku: 'RW-BCD-PK19-B750', name: 'Cava Dragon 2019 Poka', description: 'Baja Nebbiolo 750ml', retailPrice: 34.99, wholesalePrice: 23.50, stock: 123 },
  { sku: 'RW-BCD-H19-B750', name: 'Cava Dragon 2019 Hraun', description: 'Baja Red Wine Blend 750ml', retailPrice: 34.99, wholesalePrice: 23.50, stock: 255 },
  { sku: 'WW-BCD-P6119-B750', name: 'Cava Dragon 2019 P61', description: 'Baja French Colombard 750ml', retailPrice: 38.99, wholesalePrice: 26.83, stock: 105 },
  { sku: 'RW-BCD-RP19-B750', name: 'Cava Dragon 2019 Reserva Poka', description: 'Baja Nebbiolo 750ml', retailPrice: 40.99, wholesalePrice: 28.25, stock: 92 },
  { sku: 'RW-BCD-MX20-B750', name: 'Cava Dragon 2020 Merlonix', description: 'Baja Merlot 750ml', retailPrice: 40.99, wholesalePrice: 28.25, stock: 276 },

  // NO ALCOHÓLICO — Agua Ocarina
  { sku: 'NARTD-AOMW-B275', name: 'Agua Ocarina Mineral Water', description: 'Natural Sparkling Water 9.3oz/275ml', retailPrice: 2.99, wholesalePrice: 2.00, stock: 0 },
  { sku: 'NARTD-AOTW-B275', name: 'Agua Ocarina Tonic Water', description: 'Natural Sparkling Water with Quinine 9.3oz/275ml', retailPrice: 2.99, wholesalePrice: 2.00, stock: 60 },
  { sku: 'NARTD-AOP-B275', name: 'Agua Ocarina Peach', description: 'Natural Sparkling Water w/Peach Juice 9.3oz/275ml', retailPrice: 2.99, wholesalePrice: 2.25, stock: 60 },
  { sku: 'NARTD-AOT-B275', name: 'Agua Ocarina Tangerine', description: 'Natural Sparkling Water w/Tangerine Juice 9.3oz/275ml', retailPrice: 2.99, wholesalePrice: 2.25, stock: 60 },
  { sku: 'NARTD-AOL-B275', name: 'Agua Ocarina Lychee', description: 'Natural Sparkling Water w/Lychee Juice 9.3oz/275ml', retailPrice: 2.99, wholesalePrice: 2.25, stock: 72 },
  { sku: 'NARTD-AOG-B275', name: 'Agua Ocarina Grapefruit', description: 'Natural Sparkling Water w/Grapefruit Juice 9.3oz/275ml', retailPrice: 2.99, wholesalePrice: 2.25, stock: 52 },
  { sku: 'NARTD-AOP2-B275', name: 'Agua Ocarina Passion Fruit', description: 'Natural Sparkling Water w/Passion Fruit Juice 9.3oz/275ml', retailPrice: 2.99, wholesalePrice: 2.25, stock: 64 },
  { sku: 'NARTD-AOS-B275', name: 'Agua Ocarina Soursop', description: 'Natural Sparkling Water w/Soursop Juice 9.3oz/275ml', retailPrice: 2.99, wholesalePrice: 2.25, stock: 53 },
  { sku: 'NARTD-AOCL-B275', name: 'Agua Ocarina Cucumber Lime', description: 'Natural Sparkling Water w/Cucumber Lime Juice 9.3oz/275ml', retailPrice: 2.99, wholesalePrice: 2.25, stock: 54 },
];

async function main() {
  console.log('Starting NWT inventory update — April 2026...');

  for (const product of products) {
    const result = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        description: product.description,
        retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice,
        stock: product.stock,
        status: 'ACTIVE',
      },
      create: {
        ...product,
        status: 'ACTIVE',
      },
    });
    console.log(`  ${result.sku} → ${result.name} (stock: ${result.stock}) [${result.id ? 'updated' : 'created'}]`);
  }

  console.log(`\nDone! ${products.length} products upserted.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
