import React, { useRef, useState, useEffect } from "react"
import ReactDOM from "react-dom"
import classNames from "classnames"

import { useEnforceFocus } from "./../hooks"
import { AsProp } from "./../utils"

import "./dialog.css"

export function useDialog(
  initialOpen: boolean = false
): [boolean, () => void, () => void] {
  const [isOpen, set] = useState<boolean>(initialOpen)
  return [isOpen, () => set(true), () => set(false)]
}

const DIALOG_OPEN_CONTAINER_CLASS_NAME = "dialog-open"

export function DialogDocument({
  className,
  children,
}: React.HTMLProps<HTMLElement>) {
  return (
    <div role="document" className={classNames("dialog__document", className)}>
      {children}
    </div>
  )
}

export function DialogHeader<As extends React.ReactType = "header">({
  children,
  className,
  as,
}: AsProp<As>) {
  const Component = as || "header"
  return (
    <Component className={classNames("dialog__header", className)}>
      {children}
    </Component>
  )
}

export function DialogTitle<As extends React.ReactType = "h3">({
  children,
  className,
  as,
}: AsProp<As>) {
  const Component = as || "h3"
  return (
    <Component className={classNames("dialog__title", className)}>
      {children}
    </Component>
  )
}

export function DialogBody<As extends React.ReactType = "main">({
  className,
  children,
  as,
}: AsProp<As>) {
  const Component = as || "main"
  return (
    <Component className={classNames("dialog__body", className)}>
      {children}
    </Component>
  )
}

export function DialogFooter<As extends React.ReactType = "footer">({
  className,
  children,
  as,
}: AsProp<As>) {
  const Component = as || "footer"
  return (
    <Component className={classNames("dialog__footer", className)}>
      {children}
    </Component>
  )
}

interface DialogProps extends React.HTMLProps<HTMLDialogElement> {
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
  className,
}: DialogProps) {
  const wrapperRef = useRef<HTMLDialogElement>(null)
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
  if (!open) return null
  return ReactDOM.createPortal(
    <dialog
      open={open}
      ref={wrapperRef}
      onKeyDown={event => {
        if (!open || !closeOnEscape) return
        // handle the escape key
        if (event.keyCode === 27) {
          onClose && onClose()
        }
      }}
      role="dialog"
      tabIndex={-1}
      aria-modal={true}
      className={classNames("dialog", className)}
    >
      {closeButton ? (
        <button onClick={onClose} className="dialog__close">
          &times;
        </button>
      ) : null}
      <DialogDocument>{children}</DialogDocument>
    </dialog>,
    container
  )
}

Dialog.Header = DialogHeader
Dialog.Title = DialogTitle
Dialog.Footer = DialogFooter
Dialog.Body = DialogBody

export default Dialog
