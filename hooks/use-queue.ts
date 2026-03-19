import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useOfficeQueue(officeId: string, refreshInterval = 2000) {
  const { data, error, isLoading, mutate } = useSWR(
    officeId ? `/api/queue/${officeId}` : null,
    fetcher,
    { refreshInterval, revalidateOnFocus: true, dedupingInterval: 1000 }
  )
  return { data, error, isLoading, mutate }
}

export function useAllOffices(refreshInterval = 3000) {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/queue/all",
    fetcher,
    { refreshInterval, revalidateOnFocus: true, dedupingInterval: 2000 }
  )
  return { data, error, isLoading, mutate }
}
