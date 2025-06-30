import { useQueryState } from "nuqs";
import { useEffect, useState, useCallback } from "react";

export function useSearch() {
  const [query, setQuery] = useQueryState("query", { shallow: true }); // Use shallow updates
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search query
  useEffect(() => {
    if (query === debouncedQuery) return;
    
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, debouncedQuery]);

  return {
    query,
    setQuery,
    debouncedQuery,
    isSearching,
    hasQuery: !!debouncedQuery && debouncedQuery.trim().length > 0,
  };
} 