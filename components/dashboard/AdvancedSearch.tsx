'use client';
import { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface FilterOption {
  key: string; label: string; options: { value: string; label: string }[];
}

interface AdvancedSearchProps {
  placeholder?: string;
  filters: FilterOption[];
  onSearch: (query: string, activeFilters: Record<string, string>) => void;
}

export function AdvancedSearch({ placeholder = 'بحث...', filters, onSearch }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => { onSearch(query, activeFilters); };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };

  const clearFilter = (key: string) => {
    const f = { ...activeFilters };
    delete f[key];
    setActiveFilters(f);
    onSearch(query, f);
  };

  const clearAll = () => {
    setQuery('');
    setActiveFilters({});
    onSearch('', {});
  };

  const hasActive = Object.keys(activeFilters).length > 0 || query;

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
          <input
            type='text' value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className='w-full rounded-lg border border-border bg-white py-2.5 pr-10 pl-10 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20'
          />
          {query && <button onClick={() => { setQuery(''); onSearch('', activeFilters); }} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground'><X className='h-4 w-4' /></button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-all ${showFilters || hasActive ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted hover:bg-muted/10'}`}>
          <SlidersHorizontal className='h-4 w-4' />
          <span className='hidden sm:inline'>تصفية</span>
        </button>
        {hasActive && <button onClick={clearAll} className='text-xs text-destructive hover:underline'>مسح الكل</button>}
      </div>

      {hasActive && (
        <div className='flex flex-wrap gap-1.5'>
          {Object.entries(activeFilters).map(([k, v]) => (
            <span key={k} className='inline-flex items-center gap-1 rounded-full bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary'>
              {filters.find(f => f.key === k)?.options.find(o => o.value === v)?.label || v}
              <button onClick={() => clearFilter(k)} className='hover:text-primary/60'><X className='h-3 w-3' /></button>
            </span>
          ))}
        </div>
      )}

      {showFilters && (
        <div className='rounded-xl border bg-white p-4 shadow-sm'>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {filters.map(filter => (
              <div key={filter.key}>
                <label className='block text-xs font-medium text-muted mb-1.5'>{filter.label}</label>
                <select
                  value={activeFilters[filter.key] || ''}
                  onChange={e => {
                    const f = { ...activeFilters };
                    if (e.target.value) f[filter.key] = e.target.value;
                    else delete f[filter.key];
                    setActiveFilters(f);
                  }}
                  className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary'
                >
                  <option value=''>الكل</option>
                  {filter.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button onClick={() => { setShowFilters(false); onSearch(query, activeFilters); }} className='mt-4 w-full rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary-light'>
            تطبيق التصفية
          </button>
        </div>
      )}
    </div>
  );
}
