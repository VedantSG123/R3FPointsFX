import {
  UnstyledOpenInCodeSandboxButton,
  useSandpack,
  useSandpackConsole,
  useSandpackNavigation,
} from '@codesandbox/sandpack-react'
import {
  Ban,
  ExternalLink,
  Maximize,
  Monitor,
  Play,
  RotateCcw,
  Terminal,
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/lib/utils'

const RunButton = () => {
  const { sandpack } = useSandpack()
  const { status, runSandpack } = sandpack

  if (status === 'running') {
    return null
  }

  return (
    <Button size='icon' variant='ghost' onClick={runSandpack} title='Run'>
      <Play size={16} />
    </Button>
  )
}

export const SandpackTopbar: React.FC<SandpackTopbarProps> = ({
  activeView,
  onViewChange,
  onFullscreen,
  onConsoleClear,
}) => {
  const { reset } = useSandpackConsole({ resetOnPreviewRestart: true })
  const { refresh } = useSandpackNavigation()
  const isMobile = useIsMobile()

  const handleClearConsole = () => {
    reset()
    if (onConsoleClear) {
      onConsoleClear()
    }
  }

  const handleRefresh = () => {
    refresh()
  }

  return (
    <div className='flex items-center justify-between p-2 border-b border-border bg-background'>
      {/* Left side - View toggle buttons */}
      <div className='flex items-center gap-1'>
        <Button
          variant={'ghost'}
          size='sm'
          onClick={() => onViewChange('preview')}
          className={cn(
            'flex items-center gap-2 hover:bg-transparent hover:text-indigo-500',
            activeView === 'preview' &&
              'text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]',
          )}
        >
          <Monitor size={16} />
          Preview
        </Button>
        <Button
          variant={'ghost'}
          size='sm'
          onClick={() => onViewChange('console')}
          className={cn(
            'flex items-center gap-2 hover:bg-transparent hover:text-indigo-500',
            activeView === 'console' &&
              'text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]',
          )}
        >
          <Terminal size={16} />
          Console
        </Button>
      </div>

      {/* Right side - Action buttons */}
      <div className='flex items-center gap-1'>
        <RunButton />
        {!isMobile ? (
          <Button
            variant='ghost'
            size='icon'
            onClick={onFullscreen}
            title='Fullscreen'
            className='h-8 w-8'
          >
            <Maximize size={16} />
          </Button>
        ) : null}
        <UnstyledOpenInCodeSandboxButton className='inline-flex'>
          <Button
            variant='ghost'
            size='icon'
            title='Open in CodeSandbox'
            className='h-8 w-8'
          >
            <ExternalLink size={16} />
          </Button>
        </UnstyledOpenInCodeSandboxButton>

        <Button
          variant='ghost'
          size='icon'
          onClick={handleClearConsole}
          title='Clear Console'
          className='h-8 w-8'
        >
          <Ban size={16} />
        </Button>

        <Button
          variant='ghost'
          size='icon'
          onClick={handleRefresh}
          title='Refresh'
          className='h-8 w-8'
        >
          <RotateCcw size={16} />
        </Button>
      </div>
    </div>
  )
}

export type activeView = 'preview' | 'console'

export type SandpackTopbarProps = {
  activeView: activeView
  onViewChange: (view: activeView) => void
  onFullscreen?: () => void
  onConsoleClear?: () => void
}
