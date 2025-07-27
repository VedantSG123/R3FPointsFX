import * as React from 'react'

import { cn } from '@/lib/utils'

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  children,
  className,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [aspectRatio, setAspectRatio] = React.useState<number | null>(null)

  // Check if children is an img element
  const isImgElement = React.isValidElement(children) && children.type === 'img'

  if (!isImgElement) {
    return null
  }

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    const naturalAspectRatio = img.naturalWidth / img.naturalHeight
    setAspectRatio(naturalAspectRatio)
  }

  // Clone the img element to add our onLoad handler
  const imgElement = React.cloneElement(
    children as React.ReactElement<React.ImgHTMLAttributes<HTMLImageElement>>,
    {
      onLoad: handleImageLoad,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...((
          children as React.ReactElement<
            React.ImgHTMLAttributes<HTMLImageElement>
          >
        ).props.style || {}),
      },
    },
  )

  return (
    <div
      className={cn('relative w-full', className)}
      style={{
        paddingTop: aspectRatio ? `${100 / aspectRatio}%` : '0',
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {imgElement}
      </div>
    </div>
  )
}

type ResponsiveImageProps = {
  children: React.ReactNode
  className?: string
}
