// app/products/import/page.tsx

import ProductImportForm from '@/components/ProductImportForm';

export default function ProductImportPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Importar Productos</h1>
      <ProductImportForm />
    </div>
  );
}
