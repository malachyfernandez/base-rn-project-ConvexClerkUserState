import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

type ResultItem<T> = {
  userId: string;
  data: T;
}

type SearchResult<T> = {
  results: ResultItem<T>[];
  isLoading: boolean;
};


export function useSearch<T = any>(
  query: string,
  keyFilter: string,
): SearchResult<T> {


  // The query only runs if the text meets the length requirement
  const results = useQuery(
    api.user_vars.search,
    { query, keyFilter }
  );

  const safeResults = results || [];

  return {
    results: results ?? [],
    isLoading: results === undefined,
  };
}