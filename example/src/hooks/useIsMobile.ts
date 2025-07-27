import * as React from 'react'

const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  )

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`)

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)

    setIsMobile(mediaQuery.matches)

    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [breakpoint])

  return isMobile
}

export { useIsMobile }
