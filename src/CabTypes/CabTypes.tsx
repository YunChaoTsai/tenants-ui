import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"
import Prices from "./Prices"
import AddPrice from "./AddPrice"
import CalculatePrice from "./CalculatePrice"
import NavLink from "../Shared/NavLink"

export default function CabTypesModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <div className="display--flex justify-content--space-between">
        <h2>Cab Types</h2>
        <ul className="list--inline">
          <NavLink to="new">New Cab Type</NavLink>
          <NavLink to="prices">Prices</NavLink>
          <NavLink to="new-price">Add Price</NavLink>
          <NavLink to="calculate-price">Calculate Price</NavLink>
        </ul>
      </div>
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
