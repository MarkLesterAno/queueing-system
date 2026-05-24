import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function q(url: string, orgId?: string) {
  return orgId ? `${url}?orgId=${encodeURIComponent(orgId)}` : url
}

export function useOfficeQueue(officeId: string, refreshInterval = 2000, orgId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    officeId ? q(`/api/queue/${officeId}`, orgId) : null,
    fetcher,
    { refreshInterval, revalidateOnFocus: true, dedupingInterval: 1000 }
  )
  return { data, error, isLoading, mutate }
}

export function useAllOffices(refreshInterval = 3000, orgId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    q("/api/queue/all", orgId),
    fetcher,
    { refreshInterval, revalidateOnFocus: true, dedupingInterval: 2000 }
  )
  return { data, error, isLoading, mutate }
}
