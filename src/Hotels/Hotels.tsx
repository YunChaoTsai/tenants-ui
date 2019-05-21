import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import Item from "./Item"
import NewItem from "./NewItem"
import CalculatePrice from "./CalculatePrice"

export default function HotelsModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <div className="float--right button-group">
        <Link to="new" className="btn">
          New Hotel
        </Link>
        <Link to="calculate-price" className="btn">
          Calculate Price
        </Link>
      </div>
      <h2>Hotels</h2>
      <hr />
      <Router>
        <NewItem path="new" />
        <Item path=":hotelId/*" />
        <List path="/" />
        <CalculatePrice path="calculate-price" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
