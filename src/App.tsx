import React, { Fragment } from "react"
import { Router, Link, Location } from "@reach/router"
import Helmet from "react-helmet-async"
import { Icons } from "@tourepedia/ui"
import "@tourepedia/ui/styles/index.css"

import { Login, Logout, useAuthUser } from "./Auth"
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
import { TripPlanRequests } from "./TripPlanRequests"
import EmailVerified from "./EmailVerified"
import { Container } from "./Shared/Layout"
import Dropdown from "./Shared/Dropdown"

import "./main.css"
import "./typography.css"

export const Header = function Header() {
  const { user } = useAuthUser()
  if (!user) return null
  const { name } = user
  return (
    <header className="mb-4 border-b text-base">
      <nav className="flex h-16 items-stretch md:justify-between">
        <Link to="/" className="inline-flex px-2 mr-4 sm:mr-auto">
          <div className="flex items-center">
            <img
              alt="Tourepedia Logo"
              src={process.env.PUBLIC_URL + "/logo.png"}
              className="inline-block align-middle rounded-full shadow h-8 w-8 mr-2"
            />
            <h1 className="font-normal text-base m-0 hidden md:block">
              Tourepedia Dashboard
            </h1>
          </div>
        </Link>
        <ul className="flex w-full md:w-auto md:px-4 items-center justify-between md:justify-end">
          <Dropdown as="li" className="inline-block">
            <Link to="/trips" className="inline-block">
              Trips
            </Link>
            <ul>
              <NavLink to="/trip-plan-requests">Trip Plan Requests</NavLink>
              <NavLink to="/trip-sources">Trip Sources</NavLink>
              <NavLink to="/trip-stages">Trip Stages</NavLink>
            </ul>
          </Dropdown>
          <Dropdown as="li" className="inline-block">
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
          <Dropdown as="li" className="inline-block" alignRight>
            <Link to="/transport-services">
              <Icons.BusIcon title="Transport Services" />
            </Link>
            <ul>
              <NavLink to="/cab-types">Cab Types</NavLink>
              <NavLink to="/transport-service-prices">
                Transport Service Prices
              </NavLink>
              <NavLink to="/locations">Locations</NavLink>
              <NavLink to="/cabs">Cabs</NavLink>
            </ul>
          </Dropdown>
          <Dropdown as="li" className="inline-block" alignRight>
            <Link to="/users">
              <Icons.UsersIcon title="Users" />
            </Link>
            <ul className="menu">
              <NavLink to="/roles">Roles</NavLink>
            </ul>
          </Dropdown>
          <Dropdown as="li" className="inline-block" alignRight>
            <a className="toggler" href="#profile-and-settings">
              <Icons.CogAltIcon title={`Hi ${name}`} />
            </a>
            <ul className="menu">
              <NavLink to="/settings">
                <Icons.CogAltIcon /> Settings
              </NavLink>
              <Location>
                {({ location }) => (
                  <NavLink to={`/logout?from=${location.pathname}`}>
                    <Icons.OffIcon /> Logout
                  </NavLink>
                )}
              </Location>
            </ul>
          </Dropdown>
        </ul>
      </nav>
    </header>
  )
}

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
          <TripPlanRequests path="/trip-plan-requests/*" />
          <EmailVerified path="email-verified" />
          <NotFound default />
        </Router>
      </Container>
    </Fragment>
  )
}
