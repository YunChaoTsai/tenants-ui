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
      <h2>Hotels</h2>
      <Link to="new">New Hotel</Link> •{" "}
      <Link to="calculate-price">Calculate Price</Link>
      <Router>
        <NewItem path="new" />
        <Item path=":hotelId/*" />
        <List path="/" />
        <CalculatePrice path="calculate-price" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
