import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"
import Prices from "./Prices"
import AddPrice from "./AddPrice"
import CalculatePrice from "./CalculatePrice"

export default function CabTypesModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <h2>Cab Types</h2>
      <Link to="new">New Cab Type</Link> • <Link to="prices">Prices</Link> •{" "}
      <Link to="new-price">Add Price</Link> •{" "}
      <Link to="calculate-price">Calculate Price</Link>
      <Router>
        <Prices path="/prices/*" />
        <AddPrice path="/new-price" />
        <NewItem path="/new" />
        <CalculatePrice path="/calculate-price" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
