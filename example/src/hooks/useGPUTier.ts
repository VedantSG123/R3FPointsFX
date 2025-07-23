import { getGPUTier } from 'detect-gpu'
import * as React from 'react'

export const useGPUTier = () => {
  const [tier, setTier] = React.useState<number>(0)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    getGPUTier().then(({ tier }) => {
      setTier(tier)
      setLoading(false)
    })
  }, [])

  return { tier, loading }
}
