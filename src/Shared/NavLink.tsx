import React from "react"
import { Link, Match } from "@reach/router"
import classNames from "classnames"

export function NavLink({
  to,
  children,
  className = "",
}: {
  to: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Match path={to}>
      {({ match }) => (
        <li className={classNames(className, match ? "active" : undefined)}>
          <Link to={to}>{children}</Link>
        </li>
      )}
    </Match>
  )
}

export default NavLink
