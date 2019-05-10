import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"

export default function MealPlansModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <Link to="new" className="btn float--right">
        New Hotel Booking Stage
      </Link>
      <h2>Hotel Booking Stages</h2>
      <hr />
      <Router>
        <NewItem path="/new" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
