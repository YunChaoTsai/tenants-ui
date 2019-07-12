import React from "react"
import { RouteComponentProps, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import Item from "./Item"
import List from "./List"

export default function TripPlanRequests(_: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <h2>Trip Plan Requests</h2>
      <hr />
      <Router>
        <Item path=":cabId" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
