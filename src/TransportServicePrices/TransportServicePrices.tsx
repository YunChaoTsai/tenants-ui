import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"
import CalculatePrice from "./CalculatePrice"
import { Grid, Col } from "../Shared/Layout"

export default function CabTypesModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <Grid>
        <Col>
          <h2 className="white-space-pre">Transport Service Prices</h2>
        </Col>
        <Col className="text-right d-flex align-items-center justify-content-end">
          <div className="button-group">
            <Link to="new" className="btn">
              Add Price
            </Link>
            <Link to="calculate-price" className="btn">
              Calculate Price
            </Link>
          </div>
        </Col>
      </Grid>
      <hr />
      <Router>
        <NewItem path="/new" />
        <CalculatePrice path="/calculate-price" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}