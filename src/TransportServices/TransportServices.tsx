import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"
import { TransportServicePrices } from "./../TransportServicePrices"
import { CabTypes } from "./../CabTypes"
import NavLink from "../Shared/NavLink"

export default function TransportServicesModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <h2>Transport Services</h2>
      <ul className="list--inline">
        <NavLink to="new">New Transport Service</NavLink>
        <NavLink to="transport-service-prices">Service Prices</NavLink>
        <NavLink to="cab-types">Cab Types</NavLink>
      </ul>
      <hr />
      <Router>
        <NewItem path="/new" />
        <TransportServicePrices path="/transport-service-prices/*" />
        <CabTypes path="/cab-types/*" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
