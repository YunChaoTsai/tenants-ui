import React, { useRef, useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { useEnforceFocus } from "./../hooks"

import "./dialog.css"

export function useDialog(
  initialOpen: boolean = false
): [boolean, () => void, () => void] {
  const [isOpen, set] = useState<boolean>(initialOpen)
  return [isOpen, () => set(true), () => set(false)]
}

const DIALOG_OPEN_CONTAINER_CLASS_NAME = "dialog-open"

export function Document({ children }: React.HTMLProps<HTMLElement>) {
  return <div role="document">{children}</div>
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
  // set the styles for the container
  useEffect(() => {
    if (open) {
      container.classList.add(DIALOG_OPEN_CONTAINER_CLASS_NAME)
    } else {
      container.classList.remove(DIALOG_OPEN_CONTAINER_CLASS_NAME)
    }
    return () => {
      container.classList.remove(DIALOG_OPEN_CONTAINER_CLASS_NAME)
    }
  }, [open])
  useEnforceFocus(wrapperRef, open, { enforceFocus, autoFocus })
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!open || !closeOnEscape) return
    // handle the escape key
    if (event.keyCode === 27) {
      onClose && onClose()
    }
  }
  if (!open) return null
  return ReactDOM.createPortal(
    <div
      ref={wrapperRef}
      onKeyDown={handleKeyDown}
      role="dialog"
      tabIndex={-1}
      aria-modal={true}
    >
      {closeButton ? <button onClick={onClose}>&times;</button> : null}
      <Document>
        <div>{children}</div>
      </Document>
    </div>,
    container
  )
}

export default Dialog
