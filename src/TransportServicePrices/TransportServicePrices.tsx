import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"
import CalculatePrice from "./CalculatePrice"
import NavLink from "../Shared/NavLink"

export default function CabTypesModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <h2>Transport Service Price</h2>
      <ul className="list--inline">
        <NavLink to="">Prices</NavLink>
        <NavLink to="new">Add Price</NavLink>
        <NavLink to="calculate-price">Calculate Price</NavLink>
      </ul>
      <hr />
      <Router>
        <NewItem path="/new" />
        <CalculatePrice path="/calculate-price" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
