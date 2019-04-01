import React from "react"
import { Link } from "@reach/router"

export function NavLink({
  to,
  children,
}: {
  to: string
  children: React.ReactNode
}) {
  return (
    <li>
      <Link to={to}>{children}</Link>
    </li>
  )
}

export default NavLink
