import { useEffect, useRef } from "react"
import { activeElement, contains, ownerDocument } from "./dom-helpers"

export function useDidUpdate(fn: () => void, conditions: any = []): void {
  const didMountRef = useRef(false)
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    return fn()
  }, conditions)
}

export function useDidMount(fn: () => void): void {
  useEffect(() => fn(), [])
}

/**
 * useOnce
 * This hooks lets us do something in the first render call
 *
 * @param fn () => void - callback to run when first render
 */
export function useOnce(fn: () => void): void {
  const didOnce = useRef(false)
  if (!didOnce.current) {
    didOnce.current = true
    fn()
  }
}

/**
 * useEnforceFocus
 * This hook lets us constrain the focus inside a container component based on a condition
 * and return back to last focused element when the condition got true
 *
 * @param element React.RefObject<HTMLElement> - Ref object (useRef) to container element
 * @param open boolean - Trigger for enforcement and return focus to last focused element
 * @param config { autoFocus: boolean, enforceFocus: boolean } - Should the container element be auto focused (autoFocus)
 * and should the last activeElement be focused back
 */
export function useEnforceFocus(
  element: React.RefObject<HTMLElement>,
  open = true,
  { autoFocus, enforceFocus }: { autoFocus: boolean; enforceFocus: boolean } = {
    autoFocus: true,
    enforceFocus: true,
  }
) {
  const lastActiveElementRef = useRef<HTMLElement | null>(null)
  useDidUpdate(() => {
    // focus the container when opening if autoFocus is set to true
    if (open) {
      // store the last active element
      lastActiveElementRef.current = activeElement()
      if (
        autoFocus &&
        element.current &&
        !contains(element.current, lastActiveElementRef.current)
      ) {
        element.current.focus()
      }
    } else {
      // focus the last focused element when closing
      if (enforceFocus && lastActiveElementRef.current) {
        lastActiveElementRef.current.focus()
      }
    }
    // focus the last focused element when unmounting
    return () => {
      if (enforceFocus && lastActiveElementRef.current) {
        lastActiveElementRef.current.focus()
      }
    }
  }, [open])

  function handleKeyDown(event: KeyboardEvent) {
    if (!open) return
    // handle the tab key
    if (event.keyCode === 9 && enforceFocus) {
      // this is a tab event, prevent the focus from going out
      const currentActiveElement = activeElement()
      if (element.current && !contains(element.current, currentActiveElement)) {
        element.current.focus()
      }
    }
  }

  useDidUpdate(() => {
    if (open) {
      ownerDocument().addEventListener("keydown", handleKeyDown)
      return () => {
        ownerDocument().removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [open])
}
