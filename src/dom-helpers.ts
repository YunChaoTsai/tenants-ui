// dom helpers

// are we in dom
export const isDom = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
)

// does context contains node element
export function contains(
  context: HTMLElement | null,
  node: HTMLElement | null
) {
  if (!node || !context) return false
  function fallback(context: HTMLElement, node: Node | null) {
    if (node) {
      do {
        if (node === context) return true
      } while ((node = node.parentNode))
    }

    return false
  }
  if (!isDom) return fallback(context, node)

  // HTML DOM and SVG DOM may have different support levels,
  // so we need to check on context instead of a document root element.
  if (context.contains) {
    return context.contains(node)
  }
  if (context.compareDocumentPosition) {
    return context === node || !!(context.compareDocumentPosition(node) & 16)
  }
  return fallback(context, node)
}

// get the container document
export function ownerDocument(node?: HTMLElement): Document {
  return (node && node.ownerDocument) || document
}

// get the active element
export function activeElement(
  doc: Document = ownerDocument()
): HTMLElement | null {
  try {
    return (doc.activeElement as any) as HTMLElement
  } catch (e) {
    /* ie throws if no active element */
  }
  return null
}
