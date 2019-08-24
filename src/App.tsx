import React, { useEffect } from "react"
import { Router, Link, Location } from "@reach/router"
import Helmet from "react-helmet-async"
import { Icons, Badge } from "@tourepedia/ui"
import "@tourepedia/ui/styles/index.css"

import { Login, Logout, useAuthUser, InvitedSignup, TenantSignup } from "./Auth"
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
import { Tenants } from "./Tenants"
import { HotelPrices } from "./HotelPrices"
import EmailVerified from "./EmailVerified"
import { Container } from "./Shared/Layout"
import Dropdown from "./Shared/Dropdown"

import "./main.css"
import "./typography.css"
import {
  Notification,
  useNotifications,
  useConnectedNotificationChannel,
} from "./Notifications"
import config from "./config"
import { ChannelContextProvider } from "./channels"

function NotificationList() {
  const { user } = useAuthUser()
  const {
    notifications,
    fetchNotifications,
    markAllAsRead,
  } = useNotifications()
  useConnectedNotificationChannel()
  useEffect(() => {
    user && fetchNotifications()
  }, [user, fetchNotifications])
  if (!user) return null
  return notifications && notifications.length ? (
    <Dropdown as="li" className="inline-block" alignRight>
      <a href="#view-notifications" className="toggler">
        <Badge primary>
          {notifications.filter(n => !n.read_at).length.toString()}
        </Badge>
      </a>
      <ul
        className="menu"
        style={{ maxHeight: "40vh", minWidth: "250px", overflow: "auto" }}
      >
        <header className="px-3 py-2 text-sm border-b flex justify-between">
          <span className="font-bold ">Notifications</span>
          <button className="text-primary-600" onClick={markAllAsRead}>
            Mark All as Read
          </button>
        </header>
        {notifications.map((n, i) => (
          <li key={n.id} className="border-t">
            <Notification notification={n} />
          </li>
        ))}
      </ul>
    </Dropdown>
  ) : null
}

export const Header = function Header() {
  const { user } = useAuthUser()
  if (!user) return null
  const { name, tenant, permissions } = user
  return (
    <header className="mb-4 text-base bg-white border-t-4 border-primary-600">
      <nav className="sm:flex border-b items-stretch md:justify-between">
        <Link to="/" className="inline-flex h-16 px-2 mr-4 sm:mr-auto">
          <div className="flex items-center">
            <img
              alt="Tourepedia Logo"
              src={config.publicUrl + "/logo.png"}
              className="inline-block align-middle rounded-full shadow h-8 w-8 mr-2"
            />
            <h1 className="font-normal text-base m-0 md:block">
              {tenant ? tenant.name : "Tourepedia Dashboard"}
            </h1>
          </div>
        </Link>
        <ul className="flex w-full md:w-auto md:px-4 h-16 items-center justify-between md:justify-end">
          <Dropdown as="li" className="inline-block">
            <Link to="/trips" className="inline-block">
              Trips
            </Link>
            <ul>
              <NavLink to="/trips">Trips</NavLink>
              {permissions.indexOf("view_trip_plan_requests") >= 0 ||
              permissions.indexOf("manage_trip_plan_requests") >= 0 ? (
                <NavLink to="/trip-plan-requests">Trip Plan Requests</NavLink>
              ) : null}
              <NavLink to="/trip-sources">Trip Sources</NavLink>
              <NavLink to="/trip-stages">Trip Stages</NavLink>
            </ul>
          </Dropdown>
          <Dropdown as="li" className="inline-block">
            <Link to="/hotels">Hotels</Link>
            <ul>
              <NavLink to="/hotels">Hotels</NavLink>
              <NavLink to="/hotel-prices">Hotel Prices</NavLink>
              <NavLink to="/meal-plans">Meal Plans</NavLink>
              <NavLink to="/room-types">Room Types</NavLink>
              <NavLink to="/hotel-payment-preferences">
                Payment Preferences
              </NavLink>
              <NavLink to="/hotel-booking-stages">Booking Stages</NavLink>
            </ul>
          </Dropdown>
          <Dropdown as="li" className="inline-block" alignRight>
            <Link to="/transport-services">Transportation</Link>
            <ul>
              <NavLink to="/transport-services">Transport Services</NavLink>
              <NavLink to="/cab-types">Cab Types</NavLink>
              <NavLink to="/transport-service-prices">
                Transport Service Prices
              </NavLink>
              <NavLink to="/locations">Locations</NavLink>
              <NavLink to="/cabs">Cabs</NavLink>
            </ul>
          </Dropdown>
          {permissions.indexOf("manage_users") >= 0 ? (
            <Dropdown as="li" className="inline-block" alignRight>
              <Link to="/users">Users</Link>
              <ul className="menu">
                <NavLink to="/users">Users</NavLink>
                {permissions.indexOf("manage_roles") >= 0 ? (
                  <NavLink to="/roles">Roles</NavLink>
                ) : null}
                {permissions.indexOf("manage_tenants") >= 0 ? (
                  <NavLink to="/tenants">Agents</NavLink>
                ) : null}
              </ul>
            </Dropdown>
          ) : null}
          <NotificationList />
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
    <ChannelContextProvider>
      <Helmet titleTemplate="%s | Tourepedia" defaultTitle="Tourepedia" />
      <Header />
      <main style={{ minHeight: "80vh" }}>
        <Container fluid>
          <Router>
            <Login path="/login" />
            <InvitedSignup path="/invited-signup" />
            <TenantSignup path="/tenant-signup" />
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
            <Tenants path="/tenants/*" />
            <HotelPrices path="/hotel-prices/*" />
            <EmailVerified path="email-verified" />
            <NotFound default />
          </Router>
        </Container>
      </main>
      <Footer />
    </ChannelContextProvider>
  )
}

function Footer() {
  return (
    <footer className="border-t mt-8">
      <Container fluid>
        <div className="py-4">
          <span>&copy; 2019 Tourepedia. All rights reserved</span>
          {" • "}
          <span>v{config.appVersion}</span>
        </div>
      </Container>
    </footer>
  )
}
