import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

type ResultItem<T> = {
  userId: string;
  data: T;
};

export function useSearch<T = any>(
  query: string,
  keyFilter: string,
): T[] | undefined {
  // The query only runs if the text meets the length requirement
  const results = useQuery(
    api.user_vars.search,
    { query, keyFilter }
  );

  const extractedData = results?.map(item => item.data) as T[] | undefined;

  return(extractedData);
}