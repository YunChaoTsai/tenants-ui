import React, { useMemo, useState, Fragment } from "react"
import { RouteComponentProps } from "@reach/router"
import moment from "moment"
import { Table, Button, Badge, Icons, Dialog } from "@tourepedia/ui"
import * as Validator from "yup"
import { Formik, Form } from "formik"
import { AxiosInstance } from "axios"
import pluralize from "pluralize"

import { ITrip, isTripConverted, IQuoteHotel, IGivenQuote } from "./store"
import {
  numberToLocalString,
  joinAttributes,
  copyNodeToClipboard,
} from "../utils"
import { useXHR } from "../xhr"
import { FormikFormGroup } from "./../Shared/InputField"
import { SelectHotelBookingStages } from "../HotelBookingStages"
import { Grid, Col } from "../Shared/Layout"
import Component from "../Shared/Component"
import { useAuthUser } from "../Auth"

export function XHR(xhr: AxiosInstance) {
  return {
    async changeHotelBookingStage(
      quoteHotelIds: Array<number>,
      stageId: number
    ): Promise<any> {
      return xhr.patch("/quote-hotel-booking-stages", {
        items: quoteHotelIds,
        stage: stageId,
      })
    },
  }
}

const quoteHotelStageChangeValidationSchema = Validator.object().shape({
  stage: Validator.object()
    .required("Stage field is required")
    .typeError("Stage field is required"),
})

export function QuoteHotelBookingStage({
  quoteHotels,
}: {
  quoteHotels: Array<IQuoteHotel>
}) {
  const xhr = useXHR()
  const quoteHotel = quoteHotels[0]
  const { latest_booking_stage } = quoteHotel
  const [showEdit, setShowEdit] = useState<boolean>(false)
  if (showEdit) {
    return (
      <div className="text-left">
        <Formik
          initialValues={{ stage: latest_booking_stage }}
          validationSchema={quoteHotelStageChangeValidationSchema}
          onSubmit={(values, actions) => {
            if (!values.stage) {
              actions.setStatus("Stage field is required")
              actions.setSubmitting(false)
              return
            }
            actions.setStatus(false)
            XHR(xhr)
              .changeHotelBookingStage(
                quoteHotels.map(quoteHotel => quoteHotel.id),
                values.stage.id
              )
              .then(() => {
                window.location = window.location
              })
              .catch(e => {
                actions.setStatus(e.message)
                if (e.formikErrors) {
                  actions.setErrors(e.formikErrors)
                }
                actions.setSubmitting(false)
              })
          }}
          render={({ isSubmitting, setFieldValue }) => (
            <Form noValidate>
              <fieldset>
                <legend>Change Booking Stage</legend>
                <FormikFormGroup
                  name="stage"
                  render={({ field }) => (
                    <SelectHotelBookingStages
                      {...field}
                      label="Select the booking stage"
                      multiple={false}
                      fetchOnMount
                      onChange={(value, name) => setFieldValue(name, value)}
                    />
                  )}
                />
                <footer>
                  <Button disabled={isSubmitting} primary type="submit">
                    Save
                  </Button>
                  <Button
                    className="btn--secondary"
                    onClick={() => setShowEdit(false)}
                  >
                    Cancel
                  </Button>
                </footer>
              </fieldset>
            </Form>
          )}
        />
      </div>
    )
  }
  return (
    <div>
      <div className="flex items-center">
        <h4>{latest_booking_stage ? latest_booking_stage.name : "Pending"}</h4>
        <button className="ml-2" onClick={() => setShowEdit(true)}>
          &#9998;
        </button>
      </div>
      {latest_booking_stage ? (
        <div className="text-sm text-gray-600">
          {joinAttributes(
            `by ${latest_booking_stage.pivot.created_by.name}`,
            moment
              .utc(latest_booking_stage.pivot.created_at)
              .local()
              .fromNow()
          )}
        </div>
      ) : null}
    </div>
  )
}

export function groupByHotel(quote?: IGivenQuote): IQuoteHotel[][] {
  if (!quote) return []
  const {
    quote: { hotels: quoteHotels },
  } = quote
  const byHotelId = quoteHotels.reduce<{ [key: string]: Array<IQuoteHotel> }>(
    (byHotelId, quoteHotel) => {
      const { hotel } = quoteHotel
      if (!byHotelId[hotel.id]) {
        byHotelId[hotel.id] = []
      }
      byHotelId[hotel.id].push(quoteHotel)
      return byHotelId
    },
    {}
  )
  return Object.keys(byHotelId).reduce<IQuoteHotel[][]>(
    (groupedQuoteHotels, hotelId: string) => {
      groupedQuoteHotels.push(byHotelId[hotelId])
      return groupedQuoteHotels
    },
    []
  )
}

export function groupByCheckinCheckout(quoteHotels: Array<IQuoteHotel>) {
  const mergedQuoteHotels = quoteHotels.reduce<{
    [key: string]: Array<IQuoteHotel>
  }>((byCheckinCheckout, quoteHotel) => {
    const { checkin, checkout } = quoteHotel
    if (!byCheckinCheckout[`${checkin}-${checkout}`]) {
      byCheckinCheckout[`${checkin}-${checkout}`] = []
    }
    byCheckinCheckout[`${checkin}-${checkout}`].push(quoteHotel)
    return byCheckinCheckout
  }, {})
  return Object.keys(mergedQuoteHotels).reduce<IQuoteHotel[][]>(
    (groupedQuoteHotels, hotelId: string) => {
      groupedQuoteHotels.push(mergedQuoteHotels[hotelId])
      return groupedQuoteHotels
    },
    []
  )
}

function ComposeEmail({
  // quoteHotels that grouped by checkin and checkout dates for a hotel
  quoteHotels,
  trip,
}: {
  quoteHotels: IQuoteHotel[][]
  trip: ITrip
}) {
  const { user } = useAuthUser()
  if (!quoteHotels.length || !user) return null
  const quoteHotel = quoteHotels[0][0]
  const { hotel } = quoteHotel
  const total_given_price = quoteHotels.reduce(
    (price, quoteHotels) =>
      price +
      Number(
        quoteHotels.reduce(
          (price, quoteHotel) => price + Number(quoteHotel.given_price),
          0
        )
      ),
    0
  )
  const { tenant } = user
  return (
    <Component initialState={false}>
      {({ state, setState }) => (
        <div>
          <Button onClick={() => setState(true)}>Compose Email</Button>
          <Dialog closeButton open={state} onClose={() => setState(false)}>
            <Dialog.Header>
              <h4 className="mb-2 font-semibold">{hotel.name}</h4>
              <div className="text-sm text-gray-600">
                {joinAttributes(
                  hotel.location.short_name,
                  `${hotel.stars} Star`
                )}
              </div>
            </Dialog.Header>
            <Dialog.Body>
              <p className="mb-4 text-gray-600 text-sm">
                Copy this email content to your composer and edit any
                information before send
              </p>
              <div>
                <Button
                  primary
                  className="float-right"
                  onClick={() => {
                    copyNodeToClipboard("#hotel_email")
                  }}
                >
                  Copy to Clipboard
                </Button>
              </div>
              <div
                id="hotel_email"
                className="p-2 border rounded"
                style={{
                  fontFamily: "Verdana, sans-serif",
                  fontWeight: "normal",
                  fontSize: "small",
                }}
              >
                <div>Dear Sir/Mam,</div>
                <br />
                {tenant ? (
                  <Fragment>
                    <div>Greetings from {tenant.name}.</div>
                    <br />
                  </Fragment>
                ) : null}
                <div>
                  We are pleased to inform you that we have a new booking with
                  the following details:
                </div>
                <br />
                <div style={{ marginBottom: "10px" }}>
                  <small>Hotel</small>
                </div>
                <div>
                  <b>
                    {hotel.name}, {hotel.location.short_name} ({hotel.stars}{" "}
                    Star)
                  </b>
                </div>
                <br />
                <div style={{ marginBottom: "10px" }}>
                  <small>Guest Details</small>
                </div>
                <div>
                  <b>{trip.contacts.map(c => c.name).join(", ")}</b>
                </div>
                <div>
                  <b>
                    {trip.no_of_adults} Adults
                    {trip.children ? `, ${trip.children} children` : ""}
                  </b>
                </div>
                <br />
                <div style={{ marginBottom: "10px" }}>
                  <small>Room Details</small>
                </div>
                <ul
                  style={{
                    listStyle: "circle",
                    paddingLeft: "20px",
                  }}
                >
                  {quoteHotels.map(quoteHotels => {
                    if (!quoteHotels.length) return null
                    const quoteHotel = quoteHotels[0]
                    const checkin = moment.utc(quoteHotel.checkin).local()
                    const checkout = moment.utc(quoteHotel.checkout).local()
                    const no_of_nights = checkout.diff(checkin, "days") + 1
                    const formatedCheckin = checkin.format("Do MMM, YYYY")
                    const total_given_price = quoteHotels.reduce<number>(
                      (total_given_price, quoteHotel) =>
                        total_given_price + Number(quoteHotel.given_price),
                      0
                    )
                    return (
                      <li
                        key={`${quoteHotel.id}-${formatedCheckin}`}
                        style={{ marginBottom: "10px" }}
                      >
                        <div>
                          <b>
                            {formatedCheckin} -{" "}
                            {pluralize("Night", no_of_nights, true)}
                            {"  (INR "}
                            {numberToLocalString(total_given_price)} /-)
                          </b>
                        </div>
                        {quoteHotels.map((quoteHotel, i) => {
                          const {
                            meal_plan,
                            room_type,
                            no_of_rooms,
                            adults_with_extra_bed,
                            children_with_extra_bed,
                            children_without_extra_bed,
                          } = quoteHotel
                          return (
                            <div
                              key={`${quoteHotel.id}-${formatedCheckin}-${i}`}
                            >
                              <b>
                                {meal_plan.name} - {no_of_rooms}{" "}
                                {room_type.name}
                              </b>
                              {adults_with_extra_bed ||
                              children_with_extra_bed ||
                              children_without_extra_bed ? (
                                <small>
                                  {" "}
                                  (
                                  {[
                                    adults_with_extra_bed
                                      ? `${pluralize(
                                          "Adult",
                                          adults_with_extra_bed,
                                          true
                                        )} with EB`
                                      : undefined,
                                    children_with_extra_bed
                                      ? `${pluralize(
                                          "Child",
                                          children_with_extra_bed,
                                          true
                                        )} with EB`
                                      : undefined,
                                    children_without_extra_bed
                                      ? `${pluralize(
                                          "Child",
                                          children_without_extra_bed,
                                          true
                                        )} without EB`
                                      : undefined,
                                  ]
                                    .filter(str => str)
                                    .join(", ")}
                                  )
                                </small>
                              ) : null}
                            </div>
                          )
                        })}
                      </li>
                    )
                  })}
                </ul>
                <br />
                <div>
                  <span>Total Price:</span>{" "}
                  <b>INR {numberToLocalString(total_given_price)} /-</b>
                </div>
                <br />
                <div>
                  <strong>Please confirm this booking.</strong>
                </div>
              </div>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                className="btn--secondary"
                onClick={() => setState(false)}
              >
                Close
              </Button>
            </Dialog.Footer>
          </Dialog>
        </div>
      )}
    </Component>
  )
}

interface IHotelBookings extends RouteComponentProps {
  trip: ITrip
}

export default function HotelBookings({ trip }: IHotelBookings) {
  const { latest_given_quote } = trip
  const isConverted = isTripConverted(trip)
  const mergedByHotel = useMemo(() => {
    if (!latest_given_quote) return []
    return groupByHotel(latest_given_quote)
  }, [latest_given_quote])
  if (!isConverted || !latest_given_quote) {
    return <div>Trip not converted Yet</div>
  }
  return (
    <div className="rounded-b bg-white">
      {mergedByHotel.map(mergedQuoteHotels => {
        if (!mergedQuoteHotels.length) return null
        const quoteHotel = mergedQuoteHotels[0]
        const { hotel } = quoteHotel
        const total_given_price = mergedQuoteHotels.reduce(
          (price, quoteHotel) => price + Number(quoteHotel.given_price),
          0
        )
        const mergedQuoteHotelsByCheckinCheckout = groupByCheckinCheckout(
          mergedQuoteHotels
        )
        return (
          <div key={hotel.id} className="p-4 border-b">
            <Grid>
              <Col>
                <div className="mb-4">
                  <h4 className="mb-2 font-semibold">{hotel.name}</h4>
                  <div className="text-sm text-gray-600">
                    {joinAttributes(
                      hotel.location.short_name,
                      `${hotel.stars} Star`
                    )}
                  </div>
                  <div className="mt-2">
                    <Badge>
                      <Icons.RupeeIcon />{" "}
                      {numberToLocalString(total_given_price)}
                    </Badge>
                  </div>
                </div>
                <div className="mb-4">
                  <QuoteHotelBookingStage quoteHotels={mergedQuoteHotels} />
                </div>
                <div>
                  <ComposeEmail
                    quoteHotels={mergedQuoteHotelsByCheckinCheckout}
                    trip={trip}
                  />
                </div>
              </Col>
              <Col>
                <div>
                  <Table
                    striped
                    bordered
                    responsive
                    headers={["Date", "Meal Plan and Rooms", "Given Price"]}
                    alignCols={{ 2: "right" }}
                    rows={mergedQuoteHotelsByCheckinCheckout.map(
                      quoteHotels => {
                        if (!quoteHotels.length) return []
                        const quoteHotel = quoteHotels[0]
                        const checkin = moment.utc(quoteHotel.checkin).local()
                        const checkout = moment.utc(quoteHotel.checkout).local()
                        const no_of_nights = checkout.diff(checkin, "days") + 1
                        const formatedCheckin = checkin.format("Do MMM, YYYY")
                        const total_given_price = quoteHotels.reduce<number>(
                          (total_given_price, quoteHotel) =>
                            total_given_price + Number(quoteHotel.given_price),
                          0
                        )
                        return [
                          <span className="whitespace-pre">
                            {formatedCheckin}
                            <br />
                            <small>
                              {pluralize("Night", no_of_nights, true)}
                            </small>
                          </span>,
                          <div>
                            {quoteHotels.map((quoteHotel, i) => {
                              const {
                                meal_plan,
                                room_type,
                                no_of_rooms,
                                comments,
                                given_price,
                                adults_with_extra_bed,
                                children_with_extra_bed,
                                children_without_extra_bed,
                              } = quoteHotel
                              return (
                                <div
                                  key={`${
                                    quoteHotel.id
                                  }-${formatedCheckin}-${i}`}
                                >
                                  <div>
                                    {joinAttributes(
                                      meal_plan.name,
                                      `${no_of_rooms} ${room_type.name}`,
                                      [
                                        !!adults_with_extra_bed,
                                        `${adults_with_extra_bed} AWEB`,
                                      ],
                                      [
                                        !!children_with_extra_bed,
                                        `${children_with_extra_bed} CWEB`,
                                      ],
                                      [
                                        !!children_without_extra_bed,
                                        `${children_without_extra_bed} CWoEB`,
                                      ]
                                    )}{" "}
                                    ({numberToLocalString(given_price)})
                                  </div>
                                  {comments ? (
                                    <blockquote>{comments}</blockquote>
                                  ) : null}
                                </div>
                              )
                            })}
                          </div>,
                          numberToLocalString(total_given_price),
                        ]
                      }
                    )}
                  />
                </div>
              </Col>
            </Grid>
          </div>
        )
      })}
    </div>
  )
}
