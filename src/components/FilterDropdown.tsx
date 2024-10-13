// app/components/FilterDropdown.tsx

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ListFilter } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface FilterDropdownProps {
  selectedCategoryId: number | null;
}

export default function FilterDropdown({ selectedCategoryId }: FilterDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Error al obtener categorías:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const handleSelectCategory = (categoryId: number | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (categoryId) {
      params.set('categoryId', categoryId.toString());
    } else {
      params.delete('categoryId');
    }

    // Reiniciar la página a 1 al cambiar la categoría
    params.delete('page');

    // Actualizar la URL con los nuevos parámetros
    router.push(`?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <ListFilter className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filtrar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Filtrar por Categoría</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <span>Cargando categorías...</span>
          </div>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() => handleSelectCategory(null)}
              className={!selectedCategoryId ? 'bg-muted' : ''}
            >
              Todas las Categorías
            </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                onClick={() => handleSelectCategory(category.id)}
                className={selectedCategoryId === category.id ? 'bg-muted' : ''}
              >
                {category.name}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
