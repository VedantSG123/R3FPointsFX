import './scrollBottomAnimation.css'

import * as React from 'react'

import { cn } from '@/lib/utils'

export const ScrollBottomAnimation = React.forwardRef<
  SVGSVGElement,
  ScrollBottomAnimationProps
>(({ width = 60, height = 72, className, ...props }, ref) => {
  return (
    <svg
      className={cn('arrows', 'stroke-current', className)}
      ref={ref}
      {...props}
      width={width}
      height={height}
      viewBox='0 0 60 72'
      fill='none'
    >
      <path className='a1 text-indigo-400' d='M0 0 L30 32 L60 0' />
      <path className='a2 text-purple-600' d='M0 20 L30 52 L60 20' />
      <path className='a3' d='M0 40 L30 72 L60 40' />
    </svg>
  )
})

type ScrollBottomAnimationProps = React.SVGProps<SVGSVGElement> & {
  width?: number | string
  height?: number | string
}
