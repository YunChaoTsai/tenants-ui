import React, { useEffect, useState, Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { AxiosInstance } from "axios"
import {
  Button,
  Icons,
  Table,
  useFetchState,
  Dialog,
  useDialog,
  ButtonGroup,
  Badge,
  InputGroup,
  InputGroupAddon,
} from "@tourepedia/ui"
import { Formik, Form } from "formik"
import * as Validator from "yup"
import moment from "moment"
import { $PropertyType } from "utility-types"

import { ITrip, IQuote, IGivenQuote } from "./store"
import { useXHR } from "./../xhr"
import { InputField, Input } from "./../Shared/InputField"
import Spinner from "./../Shared/Spinner"
import { numberToLocalString } from "../utils"
import Component from "../Shared/Component"
import { Grid, Col } from "../Shared/Layout"

interface IInstalment {
  amount: number
  due_date: string
}

export function XHR(xhr: AxiosInstance) {
  return {
    async getQuotes(tripId: number | string, params?: any): Promise<IQuote[]> {
      return xhr
        .get(`/trips/${tripId}/quotes`, { params })
        .then(resp => resp.data.data)
    },
    async giveQuote(data: any): Promise<IGivenQuote> {
      return xhr.post(`/given-quotes`, data).then(resp => resp.data.data)
    },
    async getInstalments(
      quoteId: number
    ): Promise<{
      data: IInstalment[]
      meta: { total: number }
    }> {
      return xhr.get(`/quote-instalments/${quoteId}`).then(resp => resp.data)
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

export function Quote({
  quote,
  readOnly = false,
  navigate,
  showHotelBookingStatus,
}: {
  quote: IQuote
  readOnly?: boolean
  navigate?: $PropertyType<RouteComponentProps, "navigate">
  showHotelBookingStatus?: boolean
}) {
  const xhr = useXHR()
  const {
    id,
    total_price,
    hotels,
    hotel_extras,
    cabs,
    transport_extras,
    other_extras,
    comments,
    created_by,
    created_at,
    trip_id,
  } = quote
  const [showGiveQuote, open, close] = useDialog()
  const [
    instalments,
    fetchInstalments,
    { isFetching: isFetchingInstalments },
  ] = useFetchState<IInstalment[]>(() =>
    XHR(xhr)
      .getInstalments(id)
      .then(resp => resp.data)
  )
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
  return (
    <div>
      <header className="mb-4">
        <h6>
          Cost Price: <Icons.RupeeIcon /> {numberToLocalString(total_price)} /-
        </h6>
        <blockquote>
          {comments ? <p>{comments}</p> : null}
          <em>
            on{" "}
            {moment
              .utc(created_at)
              .local()
              .format("DD MMM, YYYY [at] hh:mm A")}{" "}
            by {created_by.name}&lt;{created_by.email}&gt;
          </em>
        </blockquote>
      </header>
      {hotels.length || hotel_extras.length ? (
        <section>
          <div className="flex">
            <span className="inline-flex w-8 h-8 align-items-center justify-content-center bg-primary-100 rounded-full mr-2">
              <Icons.BedIcon />
            </span>
            <div className="w-full">
              {hotels.length ? (
                <div>
                  <h6>Accommodation</h6>
                  <Table
                    striped
                    bordered
                    caption={
                      "Bellow are the details of daywise hotel accomodation and their prices"
                    }
                    responsive
                    headers={[
                      "Date",
                      "Hotel",
                      "Meal Plan",
                      "Rooms",
                      "Price",
                    ].concat(showHotelBookingStatus ? ["Booking Stage"] : [])}
                    alignCols={{ 4: "right", 5: "center" }}
                    rows={hotels.map(quoteHotel => {
                      const {
                        hotel,
                        checkin,
                        checkout,
                        meal_plan,
                        room_type,
                        no_of_rooms,
                        comments,
                        given_price,
                        latest_booking_stage,
                      } = quoteHotel
                      return [
                        <span className="whitespace-pre">
                          {moment
                            .utc(checkin)
                            .local()
                            .format("DD MMM YYYY")}
                          <br />
                          <small>
                            {moment
                              .utc(checkout)
                              .diff(moment.utc(checkin), "days") + 1}{" "}
                            Nights
                          </small>
                        </span>,
                        <div>
                          <b>{hotel.name}</b>
                          <br />
                          <small>
                            {hotel.location.short_name}, {hotel.stars} Star
                          </small>
                          {comments ? (
                            <blockquote>{comments}</blockquote>
                          ) : null}
                        </div>,
                        meal_plan.name,
                        <div>
                          {room_type.name}
                          <br />
                          <small>{no_of_rooms} Rooms</small>
                        </div>,
                        numberToLocalString(given_price),
                      ].concat(
                        showHotelBookingStatus
                          ? [
                              <span>
                                {latest_booking_stage
                                  ? latest_booking_stage.name
                                  : "Pending"}
                              </span>,
                            ]
                          : []
                      )
                    })}
                  />
                </div>
              ) : null}
              {hotel_extras.length ? (
                <div>
                  <h6>Hotel Extra Services</h6>
                  <Table
                    striped
                    bordered
                    caption={"Extras services for hotels"}
                    responsive
                    headers={["Service", "Date", "Hotel", "Price"]}
                    alignCols={{ 3: "right" }}
                    rows={hotel_extras.map(
                      ({ service, date, hotel, given_price, comments }) => [
                        <div>
                          <div>{service.name}</div>
                          {comments ? (
                            <blockquote>{comments}</blockquote>
                          ) : null}
                        </div>,
                        date ? (
                          <span className="whitespace-pre">
                            {moment
                              .utc(date)
                              .local()
                              .format("DD MMM YYYY")}{" "}
                          </span>
                        ) : null,
                        hotel && hotel.name,
                        numberToLocalString(given_price),
                      ]
                    )}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
      {cabs.length || transport_extras.length ? (
        <section>
          <div className="flex">
            <span className="inline-flex w-8 h-8 align-items-center justify-content-center bg-primary-100 rounded-full mr-2">
              <Icons.BusIcon />
            </span>
            <div className="w-full">
              {cabs.length ? (
                <div>
                  <h6>Transportation</h6>
                  <Table
                    striped
                    bordered
                    caption={
                      "Bellow are the details for the daywise transportation and their prices"
                    }
                    responsive
                    headers={["Date", "Service", "Cabs", "Price"]}
                    alignCols={{ 3: "right" }}
                    rows={cabs.map(
                      ({
                        from_date,
                        to_date,
                        cab_type,
                        transport_service,
                        cab_locality,
                        no_of_cabs,
                        comments,
                        given_price,
                      }) => [
                        <span className="whitespace-pre">
                          {moment
                            .utc(from_date)
                            .local()
                            .format("DD MMM YYYY")}{" "}
                          <br />
                          <small>
                            {moment
                              .utc(to_date)
                              .diff(moment.utc(from_date), "days") + 1}{" "}
                            Days
                          </small>
                        </span>,
                        <div>
                          {transport_service.name}
                          {comments ? (
                            <blockquote>{comments}</blockquote>
                          ) : null}
                        </div>,
                        <div>
                          {cab_type.name}
                          <br />
                          <small>{no_of_cabs} cabs</small>
                          {cab_locality ? (
                            <span>
                              {" "}
                              • <small>{cab_locality.name}</small>
                            </span>
                          ) : (
                            ""
                          )}
                        </div>,
                        numberToLocalString(given_price),
                      ]
                    )}
                  />
                </div>
              ) : null}
              {transport_extras.length ? (
                <div>
                  <h6>Transport Extra Services</h6>
                  <Table
                    striped
                    bordered
                    caption={"Extras services for Transportation"}
                    responsive
                    headers={["Service", "Date", "Price"]}
                    alignCols={{ 2: "right" }}
                    rows={transport_extras.map(
                      ({ service, date, given_price, comments }) => [
                        <div>
                          <div>{service.name}</div>
                          {comments ? (
                            <blockquote>{comments}</blockquote>
                          ) : null}
                        </div>,
                        date ? (
                          <span className="whitespace-pre">
                            {moment
                              .utc(date)
                              .local()
                              .format("DD MMM YYYY")}{" "}
                          </span>
                        ) : null,
                        numberToLocalString(given_price),
                      ]
                    )}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
      {other_extras.length ? (
        <section>
          <div className="flex">
            <span className="inline-flex w-8 h-8 align-items-center justify-content-center bg-primary-100 rounded-full mr-2">
              <Icons.StarEmptyIcon />
            </span>
            <div className="w-full">
              <h6>Other Services</h6>
              <Table
                striped
                bordered
                caption={"Other Services provided with this quote"}
                responsive
                headers={["Service", "Date", "Price"]}
                alignCols={{ 2: "right" }}
                rows={other_extras.map(
                  ({ service, date, given_price, comments }) => [
                    <div>
                      <div>{service.name}</div>
                      {comments ? <blockquote>{comments}</blockquote> : null}
                    </div>,
                    date ? (
                      <span className="whitespace-pre">
                        {moment
                          .utc(date)
                          .local()
                          .format("DD MMM YYYY")}{" "}
                      </span>
                    ) : null,
                    numberToLocalString(given_price),
                  ]
                )}
              />
            </div>
          </div>
        </section>
      ) : null}
      {!readOnly ? (
        <div>
          <ButtonGroup>
            <Button onClick={open}>Give this quote</Button>
            <Dialog open={showGiveQuote} onClose={close}>
              <Dialog.Header>
                <Dialog.Title as="h4">
                  Give this quote (price: {quote.total_price})
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Formik
                  initialValues={{
                    comments: "",
                    factor: 1.3,
                    given_price: Math.ceil(quote.total_price * 1.3),
                  }}
                  validationSchema={giveQuoteSchema}
                  onSubmit={(values, actions) => {
                    if (
                      window.confirm(
                        "Are you sure you want to give this quote to the customer?"
                      )
                    ) {
                      giveQuote(id, values.given_price, values.comments)
                        .then(close)
                        .then(() => {
                          navigate && navigate("../given-quotes")
                        })
                    } else {
                      actions.setSubmitting(false)
                    }
                  }}
                  render={({ isSubmitting, setFieldValue, values }) => (
                    <Form noValidate>
                      <Grid>
                        <Col>
                          <InputField
                            label="Multiplication Factor"
                            name="factor"
                            type="number"
                            step={0.01}
                            onChange={e => {
                              setFieldValue(
                                "given_price",
                                Math.ceil(
                                  quote.total_price *
                                    parseFloat(e.currentTarget.value)
                                )
                              )
                              setFieldValue(
                                e.currentTarget.name,
                                e.currentTarget.value
                              )
                            }}
                          />
                          <InputField
                            name="given_price"
                            label="Given Price"
                            type="number"
                          />
                        </Col>
                        <Col>
                          <Component initialState={15}>
                            {({ state, setState }) => {
                              const profitValue = Number(
                                Number(
                                  values.given_price -
                                    quote.total_price -
                                    (values.given_price * state) / 100
                                ).toFixed(2)
                              )
                              const effectiveFactor = Number(
                                (profitValue + quote.total_price) /
                                  quote.total_price
                              ).toFixed(2)
                              return (
                                <div className="form-group">
                                  <div className="pb-2">
                                    See effective factor and profit (after
                                    commission)
                                  </div>
                                  <label htmlFor="commission_factor">
                                    Any commission
                                  </label>
                                  <InputGroup>
                                    <Input
                                      value={state}
                                      type="number"
                                      id="commission_factor"
                                      min={0}
                                      max={100}
                                      onChange={e =>
                                        setState(
                                          Math.max(
                                            Math.min(
                                              parseFloat(
                                                e.currentTarget.value || "0"
                                              ),
                                              100
                                            ),
                                            0
                                          )
                                        )
                                      }
                                    />
                                    <InputGroupAddon>%</InputGroupAddon>
                                  </InputGroup>
                                  <div className="mt-2">
                                    Effective Factor: {effectiveFactor}
                                    <br />
                                    Profit:{" "}
                                    <Badge primary>
                                      <Icons.RupeeIcon />{" "}
                                      {numberToLocalString(profitValue)}
                                    </Badge>
                                  </div>
                                </div>
                              )
                            }}
                          </Component>
                        </Col>
                      </Grid>
                      <InputField
                        name="comments"
                        as="textarea"
                        label="Any Comments"
                        placeholder="Write comments regarding prices or anything else..."
                      />
                      <Dialog.Footer>
                        <Button primary type="submit" disabled={isSubmitting}>
                          Give Quote
                        </Button>
                        <Button onClick={close} className="btn--secondary">
                          Cancel
                        </Button>
                      </Dialog.Footer>
                    </Form>
                  )}
                />
              </Dialog.Body>
            </Dialog>
            <Button onClick={fetchInstalments}>
              Get Instalments for Hotels and Cabs{" "}
              {isFetchingInstalments ? <Spinner /> : null}
            </Button>
            <Link
              to={`/trips/${trip_id}/new-quote`}
              state={{ quote }}
              className="btn"
            >
              Edit
            </Link>
          </ButtonGroup>
          {instalments ? (
            <Table
              striped
              bordered
              headers={["Amount", "Due Date"]}
              alignCols={{ 0: "right" }}
              autoWidth
              rows={instalments.map(i => [
                i.amount.toFixed(2),
                moment
                  .utc(i.due_date)
                  .local()
                  .format("DD/MM/YYYY"),
              ])}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

interface QuotesProps extends RouteComponentProps {
  trip: ITrip
}

export default function Quotes({ trip, navigate }: QuotesProps) {
  const xhr = useXHR()
  const [quotes, setQuotes] = useState<IQuote[]>([])
  function getQuotes() {
    XHR(xhr)
      .getQuotes(trip.id)
      .then(setQuotes)
  }
  useEffect(() => {
    getQuotes()
  }, [])
  return (
    <div className="mt-4">
      {quotes.length === 0 ? (
        <p className="text-center">No quote created for this trip</p>
      ) : (
        <ol>
          {quotes.map(quote => (
            <li key={quote.id} className="p-4 shadow rounded mb-8 bg-white">
              <Quote
                quote={quote}
                navigate={navigate}
                readOnly={!!trip.converted_at}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
