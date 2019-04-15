import React, { useEffect, useState } from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"
import Button from "@tourepedia/button"

import { ITrip, IQuote, IGivenQuote } from "./store"
import { withXHR, XHRProps } from "./../xhr"

export function XHR(xhr: AxiosInstance) {
  return {
    getQuotes(tripId: number | string, params?: any): Promise<IQuote[]> {
      return xhr
        .get(`/trips/${tripId}/quotes`, { params })
        .then(resp => resp.data.quotes)
    },
    getGivenQuotes(params?: any): Promise<IGivenQuote[]> {
      return xhr
        .get("/given-quotes", { params })
        .then(resp => resp.data.given_quotes)
    },
    giveQuote(data: any): Promise<IGivenQuote> {
      return xhr.post(`/given-quotes`, data).then(resp => resp.data.quote)
    },
  }
}

interface QuotesProps extends RouteComponentProps, XHRProps {
  trip: ITrip
}
function Quotes({ xhr, trip }: QuotesProps) {
  const [quotes, setQuotes] = useState<IQuote[]>([])
  const [giveQuotes, setGivenQuotes] = useState<IGivenQuote[]>([])
  function getQuotes() {
    XHR(xhr)
      .getQuotes(trip.id)
      .then(setQuotes)
  }
  function getGivenQuotes() {
    XHR(xhr)
      .getGivenQuotes({ trip_id: trip.id })
      .then(setGivenQuotes)
  }
  useEffect(() => {
    getGivenQuotes()
    getQuotes()
  }, [])
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Given Quotes</th>
            <th>Quotes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <ul>
                {giveQuotes.map(
                  ({ id, given_price, quote, comments, created_by }) => (
                    <li key={id}>
                      <h4>Given Price: {given_price}</h4>
                      <div>{comments}</div>
                      <div>Given by: {created_by.name}</div>
                    </li>
                  )
                )}
              </ul>
            </td>
            <td>
              <ul>
                {quotes.map(
                  ({ id, total_price, hotels, cabs, comments, created_by }) => (
                    <li key={id}>
                      <h5>Total Price: {total_price}</h5>
                      <h5>Any Comments: {comments}</h5>
                      <h5>Hotels</h5>
                      <ul>
                        {hotels.map(
                          ({
                            id,
                            hotel,
                            date,
                            meal_plan,
                            location,
                            room_type,
                            no_of_rooms,
                            comments,
                          }) => (
                            <li key={id}>
                              {date} - {hotel.name} {location.short_name} -{" "}
                              {meal_plan.name} - {room_type.name} -{" "}
                              {no_of_rooms} rooms
                              <footer>Comments: {comments}</footer>
                            </li>
                          )
                        )}
                      </ul>
                      <h5>Cabs</h5>
                      <ul>
                        {cabs.map(
                          ({
                            id,
                            date,
                            cab_type,
                            location_service,
                            no_of_cabs,
                            comments,
                          }) => (
                            <li key={id}>
                              {date} - {cab_type.name} - {location_service.name}{" "}
                              - {no_of_cabs} cabs
                              <footer>Comments: {comments}</footer>
                            </li>
                          )
                        )}
                      </ul>
                      <div>Given by: {created_by.name}</div>
                      <Button
                        onClick={e => {
                          const given_price = prompt("What is the given price?")
                          if (given_price) {
                            XHR(xhr)
                              .giveQuote({ given_price, quote_id: id })
                              .then(_ => getGivenQuotes())
                          }
                        }}
                      >
                        Give this quote
                      </Button>
                    </li>
                  )
                )}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default withXHR(Quotes)
