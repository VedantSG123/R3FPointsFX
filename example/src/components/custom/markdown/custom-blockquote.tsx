import * as React from 'react'

export const CustomBlockquote: React.FC<CustomBlockquoteProps> = ({
  children,
  ...rest
}) => {
  const firstChild = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === 'p',
  )

  if (
    React.isValidElement(firstChild) &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    ((Array.isArray((firstChild as any).props?.children) &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      typeof (firstChild as any).props.children[0] === 'string') ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      typeof (firstChild as any).props?.children === 'string')
  ) {
    let content: string = ''
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    if (Array.isArray((firstChild as any).props?.children)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      content = (firstChild as any).props.children[0] as string
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      content = (firstChild as any).props?.children as string
    }

    const alertMatch = content.match(
      /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)/s,
    )

    if (alertMatch) {
      const [, alertType, alertContent] = alertMatch as [
        string,
        AlertType,
        string,
      ]

      // Create a new element with modified children instead of mutating the original
      let modifiedFirstChild: React.ReactElement
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      if (Array.isArray((firstChild as any).props?.children)) {
        const newChildren = [
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          ...((firstChild as any).props.children as React.ReactNode[]),
        ]
        newChildren[0] = alertContent.trim()
        modifiedFirstChild = React.cloneElement(
          firstChild as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
          {},
          ...newChildren,
        )
      } else {
        modifiedFirstChild = React.cloneElement(
          firstChild as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
          {},
          alertContent.trim(),
        )
      }

      // Define styles for different alert types
      const alertStyles = {
        NOTE: {
          color: '#0969da',
        },
        TIP: {
          color: '#1a7f37',
        },
        IMPORTANT: {
          color: '#8250df',
        },
        WARNING: {
          color: '#bf8700',
        },
        CAUTION: {
          color: '#d1242f',
        },
      }

      const style = alertStyles[alertType] || alertStyles.NOTE

      return (
        <div className='my-6 relative pl-4'>
          <div
            className='w-1 h-full absolute left-0 top-0'
            style={{ backgroundColor: style.color }}
          ></div>
          <div className='flex flex-col gap-1'>
            <div className='font-semibold' style={{ color: style.color }}>
              {alertType}
            </div>
            <blockquote {...rest} className='!pl-0 !my-0'>
              {modifiedFirstChild}
            </blockquote>
          </div>
        </div>
      )
    }
  }

  return <blockquote {...rest}>{children}</blockquote>
}

type CustomBlockquoteProps = React.HTMLAttributes<HTMLElement>

type AlertType = 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION'
