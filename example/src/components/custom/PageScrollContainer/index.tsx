import type * as React from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'

export const PageScrollContainer: React.FC<PageScrollContainerType> = ({
  children,
}) => {
  return (
    <ScrollArea className='h-screen overflow-y-auto [&>div>div]:!block'>
      {children}
    </ScrollArea>
  )
}

type PageScrollContainerType = {
  children: React.ReactNode
}
