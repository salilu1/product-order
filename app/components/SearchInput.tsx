'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
      params.set('page', '1'); // Reset to page 1 on new search
    } else {
      params.delete('search');
    }

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }

  return (
    <div className="relative">
      <input
        defaultValue={searchParams.get('search')?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search products..."
        className={`w-full bg-gray-100 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 transition ${
          isPending ? 'opacity-50' : ''
        }`}
      />
      {isPending && (
        <div className="absolute right-3 top-3 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
      )}
    </div>
  );
}