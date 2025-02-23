import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useTheme } from '../providers/ThemeProvider'

export const AppHeader = () => {
  const { theme, setTheme } = useTheme()

  return (
    <header className='border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto flex justify-between w-full py-3 px-4 items-center'>
        <div className='flex items-center gap-6'>
          <div className='font-bold text-2xl'>Points FX</div>
          <div className='flex bg-transparent'>
            <Button variant='ghost'>Home</Button>
            <Button variant='ghost'>Examples</Button>
            <Button variant='ghost'>Docs</Button>
          </div>
        </div>

        <Button
          variant='ghost'
          size='icon'
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Moon /> : <Sun />}
        </Button>
      </div>
    </header>
  )
}
