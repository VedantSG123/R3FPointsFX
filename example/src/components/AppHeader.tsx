import * as React from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Events, useCustomEventListener } from '@/hooks/useCustomEvents'
import { cn } from '@/lib/utils'

export const AppHeader = () => {
  const [hide, setHide] = React.useState(false)

  useCustomEventListener<{ value: boolean }>(
    Events.SANDPACK_FULLSSCREEN,
    ({ value }) => {
      setHide(value)
    },
  )

  return (
    <header
      className={cn(
        'border-grid fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        hide && 'hidden',
      )}
    >
      <div className='container mx-.auto flex justify-between w-full py-3 px-4 items-center'>
        <div className='flex items-center gap-6'>
          <div className='font-bold text-2xl'>Points FX</div>
          <div className='flex bg-transparent'>
            <Button variant='ghost' asChild>
              <Link to='/'>Home</Link>
            </Button>
            <Button variant='ghost'>Examples</Button>
            <Button variant='ghost' asChild>
              <Link to='/docs'>Docs</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
