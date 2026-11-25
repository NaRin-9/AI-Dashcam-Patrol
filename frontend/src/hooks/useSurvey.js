import { useEffect, useState } from 'react'
import { apiGet } from '@/services/api'

export default function useSurvey() {
  const [result, setResult] = useState({ data: null, error: false })
  useEffect(() => {
    const request = new AbortController()
    apiGet('/live-map', { signal: request.signal })
      .then((data) => {
        if (!request.signal.aborted) setResult({ data, error: false })
      })
      .catch(() => {
        if (!request.signal.aborted) setResult({ data: null, error: true })
      })
    return () => request.abort()
  }, [])
  return result
}
