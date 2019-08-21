import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import Item from "./Item"
import NewItem from "./NewItem"

export default function HotelsModule(_: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <div className="float-right button-group">
        <Link to="/hotel-prices" className="btn">
          Hotel Prices
        </Link>
        <Link to="/hotel-prices/upload-prices" className="btn">
          Upload Prices
        </Link>
        <Link to="new" className="btn">
          New Hotel
        </Link>
      </div>
      <h2>Hotels</h2>
      <hr />
      <Router>
        <NewItem path="new" />
        <Item path=":hotelId/*" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
