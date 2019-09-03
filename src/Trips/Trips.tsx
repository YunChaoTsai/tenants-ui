import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import Item from "./Item"
import NewItem from "./NewItem"
import HotelsBookingPendingList from "./HotelsBookingPendingList"
import HotelsBookingPendingItem from "./HotelsBookingPendingItem"

export default function Trips(_: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <Router>
        <List path="/" />
        <HotelsBookingPendingList path="/hotels-booking-pending" />
        <HotelsBookingPendingItem path="/hotels-booking-pending/:tripId/*" />
        <NewItem path="/new" />
        <Item path=":tripId/*" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
