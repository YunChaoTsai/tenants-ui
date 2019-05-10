import React, { useRef, useState } from "react"
import ReactDOM from "react-dom"
import { useDidUpdate, useDidMount, useEnforceFocus } from "./../hooks"

export function useDialog(
  initialOpen: boolean = false
): [boolean, () => void, () => void] {
  const [isOpen, set] = useState<boolean>(initialOpen)
  return [isOpen, () => set(true), () => set(false)]
}

interface DialogProps {
  /**
   * Contianer element where we should render the dialog
   * @default document.body
   */
  container?: HTMLElement
  /**
   * What to render inside the dialog
   */
  children: React.ReactNode
  /**
   * Is dialog open
   */
  open: boolean
  /**
   * Notify parent for closing the modal
   */
  onClose?: () => void
  /**
   * autoFocus the dialog when shown and focus the last element when hidden
   * @default true
   */
  autoFocus?: boolean
  /**
   * enforce that focus doesn't leave the dialog
   * @default true
   */
  enforceFocus?: boolean
  /**
   * close on escape key pressed
   * @default true
   */
  closeOnEscape?: boolean
  /**
   * Wether to render a close button or not
   * @default false
   */
  closeButton?: boolean
}
export function Dialog({
  container = document.body,
  children = null,
  open,
  onClose,
  autoFocus = true,
  enforceFocus = true,
  closeOnEscape = true,
  closeButton,
}: DialogProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  // set the styles
  useDidMount(() => {
    if (open) {
      container.style.overflow = "hidden"
    }
  })
  // set the styles for the container
  useDidUpdate(() => {
    if (open) {
      // hide the overflow of the container
      container.style.overflow = "hidden"
    } else {
      // show the overflow of the container
      container.style.overflow = "auto"
    }
  }, [open])
  useEnforceFocus(wrapperRef, open, { enforceFocus, autoFocus })
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!open) return
    if (closeOnEscape) {
      // handle the escape key
      if (event.keyCode === 27) {
        onClose && onClose()
      }
    }
  }
  if (!open) return null
  return ReactDOM.createPortal(
    <div
      ref={wrapperRef}
      onKeyDown={handleKeyDown}
      role="dialog"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        background: "rgba(0, 0, 0, .5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "auto",
      }}
      tabIndex={-1}
    >
      {closeButton ? (
        <button
          style={{
            position: "absolute",
            right: "10px",
            top: "10px",
            background: "transparent",
            color: "white",
            fontSize: "3em",
            border: "none",
          }}
          onClick={onClose}
        >
          &times;
        </button>
      ) : null}
      <div
        style={{
          background: "white",
          position: "relative",
          minWidth: "320px",
          borderRadius: ".4em",
        }}
      >
        {children}
      </div>
    </div>,
    container
  )
}

export default Dialog
