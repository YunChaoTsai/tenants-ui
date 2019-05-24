import React from "react"
import classNames from "classnames"

import "./icon.css"
/**
 * hoc for a Icon
 *
 * @example
 *   - import { ReactComponent as Test } from "./svgs/test.svg"
 *   - import icon from "./Icon"
 *   - const Icon = icon(Test)
 */
export default function icon(
  /**
   * Icon to be rendered
   */
  SvgIcon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >,
  /**
   * base class name for the icon (without prefixing with 'tp-icon-')
   *
   * @example 'chevron-down'
   */
  baseClassName?: string
) {
  function Icon({
    className,
    title,
    ...props
  }: React.ComponentProps<typeof SvgIcon> & {
    /**
     * A title for a11y. If not passed, aria-hidden will be set to true to hide the icon from screen readers
     */
    title?: string
  }) {
    return (
      <SvgIcon
        aria-label={title}
        aria-hidden={!title ? "true" : "false"}
        className={classNames("tp-icon", `tp-icon-${baseClassName}`, className)}
        {...props}
      />
    )
  }
  return Icon
}
