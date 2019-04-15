import React, { Fragment } from "react"
import { Router, Link, Location, LinkProps } from "@reach/router"
import Helmet from "react-helmet-async"

import { Login, Logout, connectWithAuth } from "./Auth"
import { AuthProps } from "./Auth/User"
import { NavLink } from "./Shared/NavLink"
import Dashboard from "./Dashboard"
import NotFound from "./NotFound"
import Settings from "./Settings"
import ForgotPassword from "./ForgotPassword"
import ResetPassword from "./ResetPassword"
import { Users } from "./Users"
import { Roles } from "./Roles"
import { Hotels } from "./Hotels"
import { MealPlans } from "./MealPlans"
import { RoomTypes } from "./RoomTypes"
import { Locations } from "./Locations"
import { CabTypes } from "./CabTypes"
import { Cabs } from "./Cabs"
import { Trips } from "./Trips"
import { TripSources } from "./TripSources"

interface HeaderProps extends AuthProps {}

export const Header = connectWithAuth(function Header({ user }: HeaderProps) {
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
          <NavLink to="/trips">Trips</NavLink>
          <li>
            Accounts
            <ul>
              <NavLink to="/users">Users</NavLink>
              <NavLink to="/roles">Roles</NavLink>
            </ul>
          </li>
          <li>
            Others
            <ul>
              <NavLink to="/hotels">Hotels</NavLink>
              <NavLink to="/meal-plans">Meal Plans</NavLink>
              <NavLink to="/room-types">Room Types</NavLink>
              <NavLink to="/locations">Locations</NavLink>
              <NavLink to="/cabs">Cabs</NavLink>
              <NavLink to="/cab-types">Cab Types</NavLink>
              <NavLink to="/trip-sources">Trip Sources</NavLink>
            </ul>
          </li>

          <li>
            Hi {name}
            <ul>
              <NavLink to="/settings">Settings</NavLink>
              <Location>
                {({ location }) => (
                  <NavLink to={`/logout?from=${location.pathname}`}>
                    Logout
                  </NavLink>
                )}
              </Location>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
})

export default function App() {
  return (
    <Fragment>
      <Helmet titleTemplate="%s | Tourepedia" defaultTitle="Tourepedia" />
      <Header />
      <Router>
        <Login path="/login" />
        <ForgotPassword path="/forgot-password" />
        <ResetPassword path="/reset-password" />
        <Dashboard path="/" />
        <Logout path="/logout" />
        <Settings path="/settings/*" />
        <Users path="/users/*" />
        <Roles path="/roles/*" />
        <Hotels path="/hotels/*" />
        <MealPlans path="/meal-plans/*" />
        <RoomTypes path="/room-types/*" />
        <Locations path="/locations/*" />
        <CabTypes path="/cab-types/*" />
        <Cabs path="/cabs/*" />
        <Trips path="/trips/*" />
        <TripSources path="/trip-sources/*" />
        <NotFound default />
      </Router>
    </Fragment>
  )
}
