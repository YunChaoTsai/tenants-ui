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
import { TripStages } from "./TripStages"
import { TransportServices } from "./TransportServices"
import { TransportServicePrices } from "./TransportServicePrices"
import { HotelPaymentPreferences } from "./HotelPaymentPreferences"
import { HotelBookingStages } from "./HotelBookingStages"
import EmailVerified from "./EmailVerified"
import { Container } from "./Shared/Layout"
import Dropdown from "./Shared/Dropdown"

interface HeaderProps extends AuthProps {}

export const Header = connectWithAuth(function Header({ user }: HeaderProps) {
  if (!user) return null
  const { name } = user
  return (
    <header>
      <nav>
        <ul className="list--inline">
          <NavLink to="/">Tourepedia Dashboard</NavLink>
          <Dropdown as="li">
            <Link to="/trips">Trips</Link>
            <ul>
              <NavLink to="/trip-sources">Trip Sources</NavLink>
              <NavLink to="/trip-stages">Trip Stages</NavLink>
            </ul>
          </Dropdown>
          <Dropdown as="li">
            <Link to="/hotels">Hotels</Link>
            <ul>
              <NavLink to="/meal-plans">Meal Plans</NavLink>
              <NavLink to="/room-types">Room Types</NavLink>
              <NavLink to="/hotel-payment-preferences">
                Payment Preferences
              </NavLink>
              <NavLink to="/hotel-booking-stages">Booking Stages</NavLink>
            </ul>
          </Dropdown>
          <Dropdown as="li">
            <Link to="/transport-services">Transport Services</Link>
            <ul>
              <NavLink to="/cab-types">Cab Types</NavLink>
              <NavLink to="/transport-service-prices">
                Transport Service Prices
              </NavLink>
              <NavLink to="/locations">Locations</NavLink>
              <NavLink to="/cabs">Cabs</NavLink>
            </ul>
          </Dropdown>
          <Dropdown as="li">
            <Link to="/users">Users</Link>
            <ul className="menu">
              <NavLink to="/roles">Roles</NavLink>
            </ul>
          </Dropdown>
          <Dropdown as="li">
            <a className="toggler" href="#">
              Hi {name}
            </a>
            <ul className="menu">
              <NavLink to="/settings">Settings</NavLink>
              <Location>
                {({ location }) => (
                  <NavLink to={`/logout?from=${location.pathname}`}>
                    Logout
                  </NavLink>
                )}
              </Location>
            </ul>
          </Dropdown>
        </ul>
      </nav>
    </header>
  )
})

export default function App() {
  return (
    <Fragment>
      <Helmet titleTemplate="%s | Tourepedia" defaultTitle="Tourepedia" />
      <Header />
      <Container fluid>
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
          <TripStages path="/trip-stages/*" />
          <TransportServices path="/transport-services/*" />
          <TransportServicePrices path="/transport-service-prices/*" />
          <HotelPaymentPreferences path="/hotel-payment-preferences/*" />
          <HotelBookingStages path="/hotel-booking-stages/*" />
          <EmailVerified path="email-verified" />
          <NotFound default />
        </Router>
      </Container>
    </Fragment>
  )
}
