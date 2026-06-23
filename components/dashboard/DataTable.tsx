'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Loader2 } from 'lucide-react';

interface Column<T> {
  key: string; label: string; render?: (item: T) => React.ReactNode;
  sortable?: boolean; width?: string; hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[]; data: T[]; loading?: boolean;
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

export function DataTable<T extends Record<string, unknown>>({ columns, data, loading, keyExtractor, onRowClick, emptyMessage = 'لا توجد بيانات', pageSize = 15, searchable, searchPlaceholder = 'بحث...', onSearch }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (key: string) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortKey(key); setSortDir('asc'); }
  };

  let sorted = [...data];
  if (sortKey) {
    sorted.sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      if (av == null) return 1; if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv), 'ar') : String(bv).localeCompare(String(av), 'ar');
    });
  }

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const SortIcon = ({ column }: { column: Column<T> }) => {
    if (!column.sortable) return null;
    if (sortKey !== column.key) return <ChevronsUpDown className='h-3.5 w-3.5 text-muted/50' />;
    return sortDir === 'asc' ? <ChevronUp className='h-3.5 w-3.5' /> : <ChevronDown className='h-3.5 w-3.5' />;
  };

  if (loading) return <div className='flex items-center justify-center py-20'><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  return (
    <div>
      {searchable && (
        <div className='relative mb-4 max-w-xs'>
          <Search className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
          <input
            type='text' value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); onSearch?.(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className='w-full rounded-md border border-border bg-white py-2 pr-10 pl-3 text-sm outline-none focus:border-primary'
          />
        </div>
      )}

      <div className='overflow-x-auto rounded-xl border border-border'>
        <table className='w-full text-sm'>
          <thead className='bg-muted/5'>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`p-3 text-right font-medium text-muted ${col.sortable ? 'cursor-pointer hover:text-foreground select-none' : ''} ${col.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  <div className='flex items-center gap-1.5'>
                    {col.label}
                    <SortIcon column={col} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length} className='p-10 text-center text-muted'>{emptyMessage}</td></tr>
            ) : (
              paged.map(item => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={`border-t border-border transition-colors ${onRowClick ? 'cursor-pointer hover:bg-muted/5' : ''}`}
                >
                  {columns.map(col => (
                    <td key={col.key} className={`p-3 ${col.hideOnMobile ? 'hidden md:table-cell' : ''}`}>
                      {col.render ? col.render(item) : String(item[col.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className='mt-4 flex items-center justify-between text-sm'>
          <p className='text-muted'>الصفحة {page} من {totalPages}</p>
          <div className='flex items-center gap-1'>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className='rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted hover:bg-muted/10 disabled:opacity-40'>السابق</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let p: number;
              if (totalPages <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <button key={p} onClick={() => setPage(p)} className={`rounded-md px-3 py-1.5 text-sm font-medium ${page === p ? 'bg-primary text-white' : 'border border-border text-muted hover:bg-muted/10'}`}>{p}</button>
              );
            })}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className='rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted hover:bg-muted/10 disabled:opacity-40'>التالي</button>
          </div>
        </div>
      )}
    </div>
  );
}
