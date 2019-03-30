import React from "react"
import { Link, LinkProps, Location } from "@reach/router"

import { connectWithAuth } from "./Auth"
import { AuthProps } from "./Auth/User"

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to}>{children}</Link>
    </li>
  )
}

interface HeaderProps extends AuthProps {}

function Header({ user }: HeaderProps) {
  if (!user) return null
  const { name } = user
  return (
    <div>
      <nav>
        <Link to="/">Tourepedia</Link>
      </nav>
      <nav>
        <ul>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/users">Users</NavLink>
          <NavLink to="/roles">Roles</NavLink>
        </ul>
        Hi {name}
        <ul>
          <NavLink to="/settings">Settings</NavLink>
          <Location>
            {({ location }) => (
              <NavLink to={`/logout?from=${location.pathname}`}>Logout</NavLink>
            )}
          </Location>
        </ul>
      </nav>
    </div>
  )
}

export default connectWithAuth(Header)
