import * as React from 'react'

export const useCustomEventDispatch = <T>(event: Event) => {
  return React.useCallback(
    (detail?: T) =>
      window.dispatchEvent(
        new CustomEvent(event, {
          detail,
        }),
      ),
    [event],
  )
}

export const useCustomEventListener = <T>(
  event: Event,
  callback: (data: T) => void,
) => {
  const callbackRef = React.useRef(callback)

  React.useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as unknown as CustomEvent<T>
      callbackRef.current(customEvent.detail)
    }

    window.addEventListener(event, handler as unknown as EventListener)

    return () => {
      window.removeEventListener(event, handler as unknown as EventListener)
    }
  }, [event])

  React.useEffect(() => {
    callbackRef.current = callback
  }, [callback])
}

export const Events = {
  MODE_CHANGE: 'mode-change',
} as const

export type Event = (typeof Events)[keyof typeof Events]
