import React from "react"
import { Link } from "@reach/router"

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
    <li className={className}>
      <Link to={to}>{children}</Link>
    </li>
  )
}

export default NavLink
