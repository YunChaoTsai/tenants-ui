import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"

export default function MealPlansModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <h2>Meal Plans</h2>
      <Link to="new">New Meal Plan</Link>
      <hr />
      <Router>
        <NewItem path="/new" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
