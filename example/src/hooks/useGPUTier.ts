import { getGPUTier } from 'detect-gpu'
import * as React from 'react'

// Singleton state for GPU tier detection
let gpuTierCache: { tier: number; loading: boolean } | null = null
let gpuTierPromise: Promise<{ tier: number }> | null = null
const subscribers = new Set<() => void>()

// Initialize GPU tier detection once
const initializeGPUTier = () => {
  if (gpuTierPromise) return gpuTierPromise

  gpuTierCache = { tier: 0, loading: true }

  gpuTierPromise = getGPUTier().then(({ tier }) => {
    gpuTierCache = { tier, loading: false }
    // Notify all subscribers
    subscribers.forEach((callback) => callback())
    return { tier }
  })

  return gpuTierPromise
}

export const useGPUTier = () => {
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0)

  React.useEffect(() => {
    // Add this component as a subscriber
    subscribers.add(forceUpdate)

    // Initialize GPU tier detection if not already started
    if (!gpuTierCache) {
      initializeGPUTier()
    }

    // Cleanup: remove subscriber when component unmounts
    return () => {
      subscribers.delete(forceUpdate)
    }
  }, [forceUpdate])

  // Return current cache state or default loading state
  return gpuTierCache || { tier: 0, loading: true }
}
