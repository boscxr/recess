// app/components/ColumnMapping.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ColumnMappingProps {
  headers: string[];
  csvData: any[];
  onBack: () => void;
  onImportSuccess: () => void;
}

const databaseColumns = [
  'name',
  'description',
  'retailPrice',
  'wholesalePrice',
  'stock',
  'sku',
  'status',
  'favorite',
  'brandId',
  // Añade más columnas según tu modelo
];

export default function ColumnMapping({
  headers,
  csvData,
  onBack,
  onImportSuccess,
}: ColumnMappingProps) {
  const [columnMappings, setColumnMappings] = useState<{ [key: string]: string }>({});

  const handleMappingChange = (csvHeader: string, dbColumn: string) => {
    setColumnMappings((prev) => ({
      ...prev,
      [csvHeader]: dbColumn,
    }));
  };

  const handleSubmit = async () => {
    // Validar que todas las columnas requeridas estén mapeadas
    // Puedes añadir validaciones adicionales aquí

    // Preparar los datos mapeados
    const mappedData = csvData.map((row) => {
      const mappedRow: { [key: string]: any } = {};
      for (const csvHeader of headers) {
        const dbColumn = columnMappings[csvHeader];
        if (dbColumn) {
          mappedRow[dbColumn] = row[csvHeader];
        }
      }
      return mappedRow;
    });

    // Enviar datos al API route
    const response = await fetch('/api/products/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: mappedData }),
    });

    if (response.ok) {
      onImportSuccess();
    } else {
      // Manejar errores
      const errorData = await response.json();
      alert(`Error al importar productos: ${errorData.error}`);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Mapear Columnas</h2>
      <table className="table-auto w-full mb-4">
        <thead>
          <tr>
            <th className="px-4 py-2">Columna CSV</th>
            <th className="px-4 py-2">Columna en Base de Datos</th>
          </tr>
        </thead>
        <tbody>
          {headers.map((header) => (
            <tr key={header}>
              <td className="border px-4 py-2">{header}</td>
              <td className="border px-4 py-2">
                <select
                  className="w-full"
                  value={columnMappings[header] || ''}
                  onChange={(e) => handleMappingChange(header, e.target.value)}
                >
                  <option value="">-- Selecciona una columna --</option>
                  {databaseColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Regresar
        </Button>
        <Button onClick={handleSubmit}>Importar Datos</Button>
      </div>
    </div>
  );
}
