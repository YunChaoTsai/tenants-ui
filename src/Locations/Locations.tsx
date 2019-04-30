import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"

export default function LocationsModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <h2>Locations</h2>
      <Link to="new">New Location</Link> • <Link to="services">Services</Link> •{" "}
      <Link to="new-service">New Service</Link>
      <hr />
      <Router>
        <NewItem path="/new" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
