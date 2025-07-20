import type * as React from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'

export const PageScrollContainer: React.FC<PageScrollContainerType> = ({
  children,
}) => {
  return (
    <ScrollArea className='h-screen w-full overflow-y-auto'>
      {children}
    </ScrollArea>
  )
}

type PageScrollContainerType = {
  children: React.ReactNode
}
