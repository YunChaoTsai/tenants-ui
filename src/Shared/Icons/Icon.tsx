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
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>,
  baseClassName?: string
) {
  const name = `${Icon.displayName || Icon.name}Icon`
  baseClassName =
    baseClassName ||
    name
      .replace(/^svg/i, "") // remove the svg prefix, addes by @svgr based on import name
      .replace(/icon$/i, "") // remove the icon suffix, added by @svgr based on file name
      .replace(/\B([A-Z])/g, "-$1")
      .toLowerCase()
  function ComponentWithIcon({
    className,
    title,
    ...props
  }: React.ComponentProps<typeof Icon> & {
    /**
     * A title for a11y. If not passed, aria-hidden will be set to true to hide the icon from screen readers
     */
    title?: string
  }) {
    return (
      <Icon
        aria-label={title}
        aria-hidden={!title ? "true" : "false"}
        className={classNames("tp-icon", `tp-icon-${baseClassName}`, className)}
        {...props}
      />
    )
  }
  ComponentWithIcon.displayName = name
  return ComponentWithIcon
}
