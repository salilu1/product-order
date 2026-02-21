"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useTransition } from "react";

export default function OrderSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // Reset to page 1 on new search
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="relative w-full md:w-96 group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search
          className={`w-4 h-4 transition-colors ${isPending ? "text-blue-500 animate-pulse" : "text-slate-400"}`}
        />
      </div>
      <input
        type="text"
        className="block w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold placeholder:text-slate-400 placeholder:font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm group-hover:border-slate-300"
        placeholder="Search by ID or Email..."
        defaultValue={searchParams.get("query")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {searchParams.get("query") && (
        <button
          onClick={() => handleSearch("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-rose-500 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
