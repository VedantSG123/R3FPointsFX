import * as React from 'react'
import { useLocation } from 'react-router'

import { ScrollArea } from '@/components/ui/scroll-area'

export const PageScrollContainer: React.FC<PageScrollContainerType> = ({
  children,
}) => {
  const location = useLocation()

  React.useEffect(() => {
    // Handle hash scrolling after component mounts
    if (location.hash) {
      const elementId = location.hash.slice(1) // Remove the # symbol
      const element = document.getElementById(elementId)

      if (element) {
        // Use setTimeout to ensure the element is rendered
        setTimeout(() => {
          const elementPosition = element.offsetTop
          const offsetPosition = elementPosition - 100 // 100px gap from top

          // Get the scroll container (ScrollArea viewport)
          const scrollContainer = element.closest(
            '[data-radix-scroll-area-viewport]',
          )

          if (scrollContainer) {
            scrollContainer.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            })
          } else {
            // Fallback to window scroll if ScrollArea not found
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            })
          }
        }, 100)
      }
    }
  }, [location.hash])

  return (
    <ScrollArea className='h-screen overflow-y-auto [&>div>div]:!block'>
      {children}
    </ScrollArea>
  )
}

type PageScrollContainerType = {
  children: React.ReactNode
}
