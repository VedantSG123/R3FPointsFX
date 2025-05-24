import * as React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ThemedToken } from 'shiki'
import { bundledLanguages, codeToTokens } from 'shiki'

import { CopyButton } from '@/components/ui/copy-button'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  children: string
}

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  return (
    <div className='space-y-3'>
      <Markdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {children}
      </Markdown>
    </div>
  )
}

const HighlightedPre = React.memo(
  ({ children, language, ...props }: HighlightedPre) => {
    const [tokens, setTokens] = React.useState<ThemedToken[][]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
      let cancelled = false

      async function loadAndTokenize() {
        if (!(language in bundledLanguages)) {
          setLoading(false)
          return
        }

        const { tokens } = await codeToTokens(children, {
          lang: language as keyof typeof bundledLanguages,
          defaultColor: false,
          themes: {
            light: 'github-light-default',
            dark: 'github-dark-default',
          },
        })

        if (!cancelled) {
          setTokens(tokens)
          setLoading(false)
        }
      }

      setLoading(true)
      loadAndTokenize()

      return () => {
        cancelled = true
      }
    }, [children, language])

    if (loading || !(language in bundledLanguages)) {
      return <pre {...props}>{children}</pre>
    }

    return (
      <pre {...props}>
        <code>
          {tokens.map((line, lineIndex) => (
            <span key={lineIndex}>
              {line.map((token, tokenIndex) => (
                <span
                  key={tokenIndex}
                  className='text-shiki-light dark:text-shiki-dark'
                  style={
                    typeof token.htmlStyle === 'string'
                      ? undefined
                      : token.htmlStyle
                  }
                >
                  {token.content}
                </span>
              ))}
              {lineIndex !== tokens.length - 1 && '\n'}
            </span>
          ))}
        </code>
      </pre>
    )
  },
)
HighlightedPre.displayName = 'HighlightedCode'

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  language: string
}

export const CodeBlock = ({
  children,
  className,
  language,
  ...restProps
}: CodeBlockProps) => {
  const code =
    typeof children === 'string'
      ? children
      : childrenTakeAllStringContents(children)

  const preClass = cn(
    'overflow-x-scroll w-full text-left p-4 rounded-md bg-background border font-mono text-sm [scrollbar-width:none]',
    className,
  )

  return (
    <div className='group/code relative mb-4 w-full'>
      <HighlightedPre {...restProps} language={language} className={preClass}>
        {code}
      </HighlightedPre>

      <div className='absolute right-2 top-[10px] flex space-x-1 rounded-lg p-1 transition-all duration-200 visible opacity-100'>
        <CopyButton content={code} copyMessage='Copied code to clipboard' />
      </div>
    </div>
  )
}

function childrenTakeAllStringContents(element: React.ReactNode): string {
  if (typeof element === 'string' || typeof element === 'number') {
    return String(element)
  }

  if (React.isValidElement(element)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const children = element.props?.children as React.ReactNode

    if (Array.isArray(children)) {
      return (
        children
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          .map((child) => childrenTakeAllStringContents(child))
          .join('')
      )
    } else {
      return childrenTakeAllStringContents(children)
    }
  }

  if (Array.isArray(element)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return element.map((child) => childrenTakeAllStringContents(child)).join('')
  }

  return ''
}

const COMPONENTS = {
  h1: withClass('h1', 'text-2xl font-semibold'),
  h2: withClass('h2', 'font-semibold text-xl'),
  h3: withClass('h3', 'font-semibold text-lg'),
  h4: withClass('h4', 'font-semibold text-base'),
  h5: withClass('h5', 'font-medium'),
  strong: withClass('strong', 'font-semibold'),
  a: withClass('a', 'text-primary underline underline-offset-2'),
  blockquote: withClass('blockquote', 'border-l-2 border-primary pl-4'),
  code: ({
    children,
    className,
    ...rest
  }: React.HTMLAttributes<HTMLElement>) => {
    const match = /language-(\w+)/.exec(className || '')
    return match ? (
      <CodeBlock className={className} language={match[1]} {...rest}>
        {children}
      </CodeBlock>
    ) : (
      <code
        className={cn(
          'font-mono [:not(pre)>&]:rounded-md [:not(pre)>&]:bg-background [:not(pre)>&]:px-1 [:not(pre)>&]:py-0.5',
        )}
        {...rest}
      >
        {children}
      </code>
    )
  },
  pre: ({ children }: React.HTMLAttributes<HTMLPreElement>) => children,
  ol: withClass('ol', 'list-decimal space-y-2 pl-6'),
  ul: withClass('ul', 'list-disc space-y-2 pl-6'),
  li: withClass('li', 'my-1.5'),
  table: withClass(
    'table',
    'w-full border-collapse overflow-y-auto rounded-md border border-foreground/20',
  ),
  th: withClass(
    'th',
    'border border-foreground/20 px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right',
  ),
  td: withClass(
    'td',
    'border border-foreground/20 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right',
  ),
  tr: withClass('tr', 'm-0 border-t p-0 even:bg-muted'),
  p: withClass('p', 'whitespace-pre-wrap'),
  hr: withClass('hr', 'border-foreground/20'),
}

function withClass<Tag extends keyof JSX.IntrinsicElements>(
  tag: Tag,
  classes: string,
) {
  type Props = JSX.IntrinsicElements[Tag] & { className?: string }

  const Component = (props: Props) => {
    const { className, ...rest } = props
    const combinedClassName = className ? `${classes} ${className}` : classes
    return React.createElement(tag, { className: combinedClassName, ...rest })
  }

  Component.displayName = tag
  return Component
}

interface HighlightedPre extends React.HTMLAttributes<HTMLPreElement> {
  children: string
  language: string
}
