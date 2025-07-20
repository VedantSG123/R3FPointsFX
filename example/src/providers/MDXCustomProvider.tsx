import '@/mdx.css'

import { MDXProvider } from '@mdx-js/react'
import type { MDXComponents } from 'mdx/types'
import * as React from 'react'

import { CustomBlockquote } from '@/components/custom/markdown/custom-blockquote'
import {
  CodeBlock,
  HighlightedCode,
} from '@/components/custom/markdown/markdown-renderer'

const components: Readonly<MDXComponents> = {
  table: ({ children, ...rest }) => (
    <div className='table-wrapper'>
      <table {...rest}>{children}</table>
    </div>
  ),
  code: ({ children, className, ...props }) => {
    const language = className?.replace(/language-/, '') || 'text'
    return (
      <HighlightedCode language={language} className={className} {...props}>
        {children as string}
      </HighlightedCode>
    )
  },
  pre: ({ children, className, ...props }) => {
    return (
      <CodeBlock className={className} {...props}>
        {children}
      </CodeBlock>
    )
  },
  blockquote: ({ children, ...props }) => (
    <CustomBlockquote {...props}>{children}</CustomBlockquote>
  ),
}

export const MDXCustomProvider: React.FC<MDXCustomProviderType> = ({
  children,
}) => {
  return (
    <div className='mdx-wrapper w-full max-w-6xl mx-auto px-4 pt-20'>
      <MDXProvider components={components}>{children}</MDXProvider>
    </div>
  )
}

type MDXCustomProviderType = {
  children: React.ReactNode
}
