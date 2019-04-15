import React, { useState, useEffect } from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"
import { AxiosInstance } from "axios"
import moment from "moment"

import { withXHR, XHRProps } from "./../xhr"
import { ICabPrice } from "./store"

export function XHR(xhr: AxiosInstance) {
  return {
    getPrices(params?: any): Promise<ICabPrice[]> {
      return xhr
        .get("/cab-prices", { params })
        .then(resp => resp.data.cab_prices)
    },
  }
}

interface PricesProps extends XHRProps, RouteComponentProps {}

function Prices({ xhr }: PricesProps) {
  const [prices, setPrices] = useState<ICabPrice[]>([])
  useEffect(() => {
    XHR(xhr)
      .getPrices()
      .then(setPrices)
  }, [])
  return (
    <div>
      <div>Total: {prices.length}</div>
      <table>
        <thead>
          <tr>
            <td>Start Date</td>
            <td>End Date</td>
            <td>Cab Type</td>
            <td>Service</td>
            <td>Price</td>
            <td>/km Charges</td>
            <td>Minimum Km/Day</td>
            <td>Toll Charges</td>
            <td>Parking Charges</td>
            <td>Night Charges</td>
          </tr>
        </thead>
        <tbody>
          {prices.map(
            ({
              id,
              start_date,
              end_date,
              cab_type,
              location_service,
              price,
              per_km_charges,
              minimum_km_per_day,
              night_charges,
              parking_charges,
              toll_charges,
            }) => (
              <tr key={id}>
                <td>
                  {moment
                    .utc(start_date)
                    .local()
                    .format("DD MMM, YYYY")}
                </td>
                <td>
                  {moment
                    .utc(end_date)
                    .local()
                    .format("DD MMM, YYYY")}
                </td>
                <td>{cab_type.name}</td>
                <td>{location_service.name}</td>
                <td>{price}</td>
                <td>{per_km_charges}</td>
                <td>{minimum_km_per_day}</td>
                <td>{toll_charges}</td>
                <td>{parking_charges}</td>
                <td>{night_charges}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  )
}

export default withXHR(Prices)
