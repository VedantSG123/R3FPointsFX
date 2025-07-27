import { Menu, X } from 'lucide-react'
import * as React from 'react'
import { Link, useLocation } from 'react-router'

import { Button } from '@/components/ui/button'
import { Events, useCustomEventListener } from '@/hooks/useCustomEvents'
import { cn } from '@/lib/utils'

export const AppHeader = () => {
  const [hide, setHide] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const location = useLocation()

  useCustomEventListener<{ value: boolean }>(
    Events.SANDPACK_FULLSSCREEN,
    ({ value }) => {
      setHide(value)
    },
  )

  const getClassName = (active: boolean) => {
    return cn(
      active
        ? '!text-foreground !font-semibold'
        : '!text-muted-foreground !hover:text-foreground',
    )
  }

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/docs', label: 'Docs' },
    { path: '/examples', label: 'Examples' },
  ]

  return (
    <header
      className={cn(
        'border-grid fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        hide && 'hidden',
      )}
    >
      <div className='mx-auto flex justify-between w-full py-3 px-4 items-center'>
        {/* Logo */}
        <div className='flex gap-4 items-center'>
          <div className='font-bold text-2xl'>Points FX</div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex bg-transparent'>
            {navItems.map((item) => (
              <Button
                className='focus-visible:ring-0 focus-visible:bg-muted'
                key={item.path}
                variant='link'
                asChild
              >
                <Link
                  className={getClassName(location.pathname === item.path)}
                  to={item.path}
                >
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            className='rounded-full focus-visible:ring-0'
            variant='ghost'
            size='icon'
            asChild
          >
            <a
              href='https://github.com/VedantSG123/R3FPointsFX'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center'
            >
              <img src='/github.svg' alt='GitHub' className='w-8 h-8' />
            </a>
          </Button>
          {/* Mobile Menu Button */}
          <Button
            variant='ghost'
            size='icon'
            className='md:hidden focus-visible:ring-0'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            asChild
          >
            {mobileMenuOpen ? (
              <X className='w-6 h-6' />
            ) : (
              <Menu className='w-6 h-6' />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className='md:hidden border-t bg-background/95 backdrop-blur'>
          <div className='container mx-auto py-2'>
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant='ghost'
                asChild
                className='w-full justify-start focus-visible:ring-0 focus-visible:bg-muted'
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link
                  className={cn(
                    'block py-2 px-4',
                    getClassName(location.pathname === item.path),
                  )}
                  to={item.path}
                >
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
