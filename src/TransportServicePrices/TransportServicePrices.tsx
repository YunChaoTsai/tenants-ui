import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"
import CalculatePrice from "./CalculatePrice"

export default function CabTypesModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <div className="float--right button-group">
        <Link to="new" className="btn">
          Add Price
        </Link>
        <Link to="calculate-price" className="btn">
          Calculate Price
        </Link>
      </div>
      <h2>Transport Service Price</h2>
      <hr />
      <Router>
        <NewItem path="/new" />
        <CalculatePrice path="/calculate-price" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
