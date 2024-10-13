// app/components/ProductImportForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ColumnMapping from '@/components/ColumnMapping';

export default function ProductImportForm() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [step, setStep] = useState<number>(1);
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          setCsvData(results.data);
          setHeaders(results.meta.fields || []);
          setStep(2);
        },
        error: function (error) {
          console.error('Error al parsear el CSV:', error);
        },
      });
    }
  };

  const handleImportSuccess = () => {
    // Después de una importación exitosa, redirige a la página de productos
    router.push('/products');
  };

  return (
    <div>
      {step === 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Selecciona un archivo CSV:</label>
          <Input type="file" accept=".csv" onChange={handleFileUpload} />
        </div>
      )}
      {step === 2 && (
        <ColumnMapping
          headers={headers}
          csvData={csvData}
          onBack={() => setStep(1)}
          onImportSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}
