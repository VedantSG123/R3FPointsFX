import * as React from 'react'
import { useInView } from 'react-intersection-observer'

import { BaseSandpack } from '@/components/custom/sandpack/BaseSandpack'
import { Skeleton } from '@/components/ui/skeleton'
import { useGPUTier } from '@/hooks/useGPUTier'

const ExamplesSandpack: React.FC<ExamplesSandpackProps> = ({ scene }) => {
  const [ref, inView] = useInView()
  const { tier, loading: tierLoading } = useGPUTier()

  const autorun = tier > 2

  return (
    <div ref={ref}>
      {inView && !tierLoading ? (
        <BaseSandpack template={'react-ts'} autorun={autorun} />
      ) : (
        <Skeleton className='h-[400px] w-full' />
      )}
    </div>
  )
}

type ExamplesSandpackProps = {
  scene?: string
}

export default ExamplesSandpack
