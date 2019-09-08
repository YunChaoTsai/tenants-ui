import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"

export default function TransportServicesModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <div className="float-right button-group">
        <Link to="/transport-service-prices" className="btn branded">
          Prices
        </Link>
        <Link to="/transport-service-prices/upload-prices" className="btn">
          Upload Prices
        </Link>
        <Link to="new" className="btn btn-primary branded">
          New Transport Service
        </Link>
      </div>
      <h2>Transport Services</h2>
      <hr />
      <Router>
        <NewItem path="/new" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
