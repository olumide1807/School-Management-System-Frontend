// Stands in for @tanstack/react-query in component tests, so a page renders
// a given query state without a server:
//
//   vi.mock("@tanstack/react-query", () => import("<path>/test/queryStub"));
//   setQueries({ "child-fees": { data: {...} }, "child-profile": { error: { response: { status: 404 } } } });
//
// States are looked up by the key's first element (its prefix). Every key a
// component asks for is recorded in `queryCalls`, so a test can assert the
// exact key a page uses.

type QueryState = { data?: unknown; pending?: boolean; error?: unknown };

let states: Record<string, QueryState> = {};
export const queryCalls: unknown[][] = [];

export function setQueries(next: Record<string, QueryState>) {
  states = next;
  queryCalls.length = 0;
}

export function useQuery(opts: { queryKey: unknown[] }) {
  queryCalls.push(opts.queryKey);
  const st = states[String(opts.queryKey[0])];
  if (!st) return { isPending: false, isLoading: false, isError: false, data: undefined, error: null, refetch: async () => ({}) };
  return {
    isPending: !!st.pending, isLoading: !!st.pending, isError: !!st.error,
    error: st.error ?? null, data: st.data, refetch: async () => ({}),
  };
}

export function useQueries({ queries = [] }: { queries?: { queryKey: unknown[] }[] } = {}) {
  return queries.map((q) => useQuery(q));
}

export function useMutation() {
  return { mutate() {}, mutateAsync: async () => {}, isPending: false };
}

export function useQueryClient() {
  return { invalidateQueries: async () => {}, setQueryData() {}, getQueryData() {} };
}

export function useInfiniteQuery() {
  return { data: undefined, isPending: false };
}

export class QueryClient {
  invalidateQueries() {}
}

export function QueryClientProvider({ children }: { children: unknown }) {
  return children;
}
