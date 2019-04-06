import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"
import Services from "./Services"
import NewService from "./NewService"

export default function LocationsModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <h2>Locations</h2>
      <Link to="new">New Location</Link> • <Link to="services">Services</Link> •{" "}
      <Link to="new-service">New Service</Link>
      <Router>
        <NewItem path="/new" />
        <Services path="/services" />
        <NewService path="/new-service" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
