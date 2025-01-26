import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { Button, Heading, IconButton } from '@radix-ui/themes'

import { useTheme } from '../providers/ThemeProvider'

export const AppHeader = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className='transparent-box'>
      <div className='flex justify-between w-full py-3 px-4 items-center'>
        <Heading className='text-white'>Points FX</Heading>

        <div className='flex gap-4 bg-transparent'>
          <Button color='gray' variant='ghost' radius='full'>
            Home
          </Button>
          <Button color='gray' variant='ghost' radius='full'>
            Examples
          </Button>
          <Button color='gray' variant='ghost' radius='full'>
            Docs
          </Button>
        </div>

        <IconButton
          variant='ghost'
          size='4'
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
        </IconButton>
      </div>
    </div>
  )
}
