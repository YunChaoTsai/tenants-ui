import React, { useEffect, useState } from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"
import Button from "@tourepedia/button"
import { Formik, Form } from "formik"
import * as Validator from "yup"
import moment from "moment"

import { ITrip, IQuote, IGivenQuote } from "./store"
import { withXHR, XHRProps } from "./../xhr"
import { Dialog, useDialog } from "./../Shared/Dialog"
import { InputField } from "./../Shared/InputField"

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

const giveQuoteSchema = Validator.object()
  .shape({
    given_price: Validator.number()
      .positive("Given price should a positive number")
      .required("Give price field is required"),
    comments: Validator.string(),
  })
  .required("Quote data is required")
export const Quote = withXHR(function Quote({
  quote,
  xhr,
}: XHRProps & {
  quote: IQuote
}) {
  function giveQuote(
    quoteId: number,
    givenPrice: number,
    comments?: string
  ): Promise<any> {
    return XHR(xhr).giveQuote({
      given_price: givenPrice,
      quote_id: quoteId,
      comments,
    })
  }
  const { id, total_price, hotels, cabs, comments, created_by } = quote
  const [showGiveQuote, open, close] = useDialog()
  return (
    <div>
      <h4>Total Price: {total_price}</h4>
      <p>Comments: {comments}</p>
      <div>By: {created_by.name}</div>
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
            given_price,
          }) => (
            <li key={id}>
              {moment
                .utc(date)
                .local()
                .format("DD MMM, YYYY")}{" "}
              - {hotel.name} {location.short_name} - {meal_plan.name} -{" "}
              {room_type.name} - {no_of_rooms} rooms - Rs: {given_price} /-
              {comments ? <p>Comments: {comments}</p> : null}
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
            given_price,
          }) => (
            <li key={id}>
              {moment
                .utc(date)
                .local()
                .format("DD MMM, YYYY")}{" "}
              - {cab_type.name} - {location_service.name} - {no_of_cabs} cabs -
              Rs: {given_price} /-
              {comments ? <p>Comments: {comments}</p> : null}
            </li>
          )
        )}
      </ul>
      <Button onClick={open}>Give this quote</Button>
      <Dialog open={showGiveQuote} onClose={close}>
        <div>
          <Formik
            initialValues={{
              comments: "",
              factor: 1.1,
              given_price: quote.total_price * 1.1,
            }}
            validationSchema={giveQuoteSchema}
            onSubmit={(values, actions) => {
              if (
                confirm(
                  "Are you sure you want to give this quote to the customer?"
                )
              ) {
                giveQuote(quote.id, values.given_price, values.comments).then(
                  close
                )
              } else {
                actions.setSubmitting(false)
              }
            }}
            render={({ isSubmitting, values, setFieldValue }) => (
              <Form noValidate style={{ padding: "20px" }}>
                <h3>Give this quote (price: quote.total_price)</h3>
                <hr />
                <div>
                  <label>Multiplication Factor</label>
                  <select
                    name="factor"
                    value={values.factor}
                    onChange={e => {
                      setFieldValue(
                        "given_price",
                        quote.total_price * parseFloat(e.target.value)
                      )
                      setFieldValue(e.target.name, e.target.value)
                    }}
                  >
                    <option value={1.1}>1.1</option>
                    <option value={1.2}>1.2</option>
                    <option value={1.3}>1.3</option>
                    <option value={1.4}>1.4</option>
                    <option value={1.5}>1.5</option>
                  </select>
                </div>
                <InputField
                  name="given_price"
                  label="Given Price"
                  type="number"
                />
                <InputField name="comments" label="Any Comments" />
                <Button type="submit">Give Quote</Button>
                <Button onClick={close}>Cancel</Button>
              </Form>
            )}
          />
        </div>
      </Dialog>
    </div>
  )
})

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
              <ul className="list">
                {giveQuotes.map(
                  ({ id, given_price, quote, comments, created_by }) => (
                    <li key={id}>
                      <h4>Given Price: {given_price}</h4>
                      <p>Comments: {comments}</p>
                      <div>Given by: {created_by.name}</div>
                      <h4>Give Quote</h4>
                      <div style={{ background: "whitesmoke" }}>
                        <Quote quote={quote} />
                      </div>
                    </li>
                  )
                )}
              </ul>
            </td>
            <td>
              <ul className="list">
                {quotes.map(quote => (
                  <li key={quote.id}>
                    <Quote quote={quote} />
                  </li>
                ))}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default withXHR(Quotes)
