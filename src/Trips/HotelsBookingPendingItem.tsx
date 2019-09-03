import React, { Fragment } from "react"
import { RouteComponentProps, Router, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { Icons } from "@tourepedia/ui"

import { ITrip } from "./store"
import Spinner from "../Shared/Spinner"
import HotelBookings from "./HotelBookings"
import { BasicDetails, useTrip } from "./Item"

function Breadcrumbs({ trip }: { trip: ITrip }) {
  const { trip_id, id } = trip
  return (
    <nav className="flex items-center mb-2">
      <Link to="/" className="text-gray-600">
        Home
      </Link>
      <Icons.ChevronDownIcon className="rotate-270 text-gray-500 text-sm" />
      <Link to="/trips" className="text-gray-600">
        Trips
      </Link>
      <Icons.ChevronDownIcon className="rotate-270 text-gray-500 text-sm" />
      <Link to="/trips/hotels-booking-pending" className="text-gray-600">
        Pending Hotels Booking
      </Link>
      <Icons.ChevronDownIcon className="rotate-270 text-gray-500 text-sm" />
      <Link
        to={`/trips/hotels-booking-pending/${id}`}
        className="text-gray-500"
      >
        {trip_id}
      </Link>
    </nav>
  )
}

export default function Item({
  tripId,
  navigate,
}: RouteComponentProps<{ tripId: string }>) {
  const { trip, isFetching } = useTrip(tripId, true)
  if (!tripId) {
    navigate && navigate("..")
    return null
  }
  if (isFetching)
    return (
      <div className="text-center">
        <Spinner />
      </div>
    )
  if (!trip) {
    return null
  }
  const { locations, latest_given_quote, trip_id, trip_source } = trip
  return (
    <Fragment>
      <Helmet>
        <title>
          {`${locations.map(l => l.short_name)} (${
            latest_given_quote
              ? latest_given_quote.locations.map(l => l.short_name).join("-")
              : ""
          }) | ${trip_id}-${trip_source.short_name}`}
        </title>
      </Helmet>
      <div className="mb-16">
        <Breadcrumbs trip={trip} />
        <BasicDetails trip={trip} />
      </div>
      <Router>
        <HotelBookings path="/" trip={trip} />
      </Router>
    </Fragment>
  )
}
