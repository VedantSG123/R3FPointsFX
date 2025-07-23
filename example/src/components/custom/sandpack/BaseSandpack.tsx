import type {
  SandpackFile,
  SandpackPredefinedTemplate as SandpackPredefinedTemplateType,
  SandpackTheme,
} from '@codesandbox/sandpack-react'
import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from '@codesandbox/sandpack-react'
import * as React from 'react'

import { Events, useCustomEventDispatch } from '@/hooks/useCustomEvents'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/lib/utils'

import type { activeView } from './SandpackTopbar'
import { SandpackTopbar } from './SandpackTopbar'

const DEFAULT_EDITOR_OPTIONS = {
  showNavigator: false,
  showInlineErrors: true,
  showLineNumbers: true,
  editorHeight: 520,
}

const githubDark: SandpackTheme = {
  colors: {
    surface1: '#0d1117',
    surface2: '#161b22',
    surface3: '#21262d',
    clickable: '#8b949e',
    base: '#f0f6fc',
    disabled: '#484f58',
    hover: '#f0f6fc',
    accent: '#58a6ff',
  },
  syntax: {
    keyword: '#ff7b72',
    property: '#79c0ff',
    plain: '#f0f6fc',
    static: '#a5d6ff',
    string: '#a5d6ff',
    definition: '#d2a8ff',
    punctuation: '#f0f6fc',
    tag: '#7ee787',
    comment: {
      color: '#8b949e',
      fontStyle: 'normal',
    },
  },
  font: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    mono: '"Fira Mono", "DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", Monaco, "Lucida Console", monospace',
    size: '14px',
    lineHeight: '26px',
  },
}

export const BaseSandpack: React.FC<BaseSandpackProps> = ({
  template,
  autorun = false,
  files = {},
  dependencies = {},
}) => {
  const isMobile = useIsMobile()
  const [activeView, setActiveView] = React.useState<activeView>('preview')
  const [consoleKey, setConsoleKey] = React.useState(0)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const dispatchCustomEvent = useCustomEventDispatch<{ value: boolean }>(
    Events.SANDPACK_FULLSSCREEN,
  )

  const handleViewChange = (view: activeView) => {
    setActiveView(view)
  }

  const handleFullscreen = () => {
    if (isMobile) return
    setIsFullscreen((prev) => {
      const newFullscreenState = !prev
      dispatchCustomEvent({ value: newFullscreenState })
      return newFullscreenState
    })
  }

  return (
    <div
      className={cn(
        'w-full [&_.sp-layout]:rounded-lg [&_.cm-gutterElement]:text-[12px] [&_.cm-gutterElement]:select-none',
        isFullscreen &&
          'h-screen w-screen fixed top-0 left-0 right-0 bottom-0 z-[60]',
        isMobile && '[.sp-layout]:flex-col',
      )}
    >
      <SandpackProvider
        theme={githubDark}
        template={template}
        options={{
          autorun: isMobile ? false : autorun,
        }}
        files={{
          ...files,
        }}
        customSetup={{
          dependencies: dependencies,
        }}
      >
        <SandpackLayout>
          <div className={cn('flex flex-col w-1/2', isMobile && 'w-full')}>
            <SandpackTopbar
              activeView={activeView}
              onViewChange={handleViewChange}
              onFullscreen={handleFullscreen}
              onConsoleClear={() => setConsoleKey((prev) => prev + 1)}
            />
            <SandpackPreview
              showRefreshButton={false}
              showOpenInCodeSandbox={false}
              style={{
                height: isFullscreen
                  ? '100dvh'
                  : DEFAULT_EDITOR_OPTIONS.editorHeight - 50,
                display: activeView === 'preview' ? 'flex' : 'none',
              }}
            />
            <SandpackConsole
              key={consoleKey}
              showHeader
              style={{
                height: isFullscreen
                  ? '100dvh'
                  : DEFAULT_EDITOR_OPTIONS.editorHeight - 50,
                display: activeView === 'console' ? 'flex' : 'none',
              }}
            />
          </div>
          <SandpackCodeEditor
            {...DEFAULT_EDITOR_OPTIONS}
            showRunButton={false}
            style={{
              borderLeft: '1px solid hsl(var(--border))',
              height: isFullscreen
                ? '100dvh'
                : DEFAULT_EDITOR_OPTIONS.editorHeight,
            }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}

type BaseSandpackProps = {
  template: SandpackPredefinedTemplateType
  autorun?: boolean
  files?: Record<string, SandpackFile>
  dependencies?: Record<string, string>
}
