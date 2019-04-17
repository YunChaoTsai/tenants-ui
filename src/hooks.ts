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

export function useEnforceFocus(
  element: React.RefObject<HTMLElement>,
  open = true,
  { autoFocus, enforceFocus }: { autoFocus: boolean; enforceFocus: boolean } = {
    autoFocus: true,
    enforceFocus: true,
  }
) {
  const lastActiveElementRef = useRef<HTMLElement | null>(null)
  useDidMount(() => {
    const currentActiveElement = activeElement()
    lastActiveElementRef.current = currentActiveElement
    if (
      open &&
      autoFocus &&
      element.current &&
      !contains(element.current, currentActiveElement)
    ) {
      element.current.focus()
    }
    // focus the last focused element when unmounting
    return () => {
      if (enforceFocus && lastActiveElementRef.current) {
        lastActiveElementRef.current.focus()
      }
    }
  })

  useDidUpdate(() => {
    // focus the dialog when opening if autoFocus is set to true
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
    }
    // focus the last focused element when closing
    if (!open && enforceFocus && lastActiveElementRef.current) {
      lastActiveElementRef.current.focus()
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
