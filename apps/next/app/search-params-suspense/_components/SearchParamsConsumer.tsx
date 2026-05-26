'use client'

import { useSearchParams } from 'next/navigation'

export function SearchParamsConsumer() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? '(없음)'

  return (
    <div
      style={{
        padding: '16px',
        background: '#fff3e0',
        border: '1px solid #f57c00',
        borderRadius: '8px',
        margin: '16px 0',
      }}
    >
      <h3>useSearchParams 사용 컴포넌트</h3>
      <p>현재 q 파라미터: {query}</p>
    </div>
  )
}
