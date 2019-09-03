import React, { useMemo, useState } from "react"
import { RouteComponentProps } from "@reach/router"
import moment from "moment"
import { Table, Button, Badge, Icons } from "@tourepedia/ui"
import * as Validator from "yup"
import { Formik, Form } from "formik"
import { AxiosInstance } from "axios"

import { ITrip, isTripConverted, IQuoteHotel, IGivenQuote } from "./store"
import { numberToLocalString, joinAttributes } from "../utils"
import { useXHR } from "../xhr"
import { FormikFormGroup } from "./../Shared/InputField"
import { SelectHotelBookingStages } from "../HotelBookingStages"
import { Grid, Col } from "../Shared/Layout"

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
            <span>by {latest_booking_stage.pivot.created_by.name}</span>,
            <span>
              {moment
                .utc(latest_booking_stage.pivot.created_at)
                .local()
                .fromNow()}
            </span>
          )}
        </div>
      ) : null}
    </div>
  )
}

export function mergeByHotel(quote: IGivenQuote) {
  const {
    quote: { hotels: quoteHotels },
  } = quote
  return quoteHotels.reduce(
    (byHotelId: { [key: string]: Array<IQuoteHotel> }, quoteHotel) => {
      const { hotel } = quoteHotel
      if (!byHotelId[hotel.id]) {
        byHotelId[hotel.id] = []
      }
      byHotelId[hotel.id].push(quoteHotel)
      return byHotelId
    },
    {}
  )
}

interface IHotelBookings extends RouteComponentProps {
  trip: ITrip
}

export default function HotelBookings({ trip }: IHotelBookings) {
  const { latest_given_quote } = trip
  const isConverted = isTripConverted(trip)
  const mergedByHotel: { [key: string]: Array<IQuoteHotel> } = useMemo(() => {
    if (!latest_given_quote) return {}
    return mergeByHotel(latest_given_quote)
  }, [latest_given_quote])
  if (!isConverted || !latest_given_quote) {
    return <div>Trip not converted Yet</div>
  }
  return (
    <div className="rounded-b bg-white">
      {Object.keys(mergedByHotel).map((hotelId: string) => {
        const quoteHotels = mergedByHotel[hotelId]
        if (!quoteHotels.length) return null
        const quoteHotel = quoteHotels[0]
        const { hotel } = quoteHotel
        const total_given_price = quoteHotels.reduce(
          (price, quoteHotel) => price + Number(quoteHotel.given_price),
          0
        )
        return (
          <div key={hotelId} className="p-4 border-b">
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
                  <QuoteHotelBookingStage quoteHotels={quoteHotels} />
                </div>
              </Col>
              <Col>
                <div>
                  <Table
                    striped
                    bordered
                    responsive
                    headers={["Date", "Meal Plan", "Rooms", "Price"]}
                    alignCols={{ 4: "right", 5: "center" }}
                    rows={quoteHotels.map(quoteHotel => {
                      const {
                        checkin,
                        checkout,
                        meal_plan,
                        room_type,
                        no_of_rooms,
                        comments,
                        given_price,
                        adults_with_extra_bed,
                        children_with_extra_bed,
                        children_without_extra_bed,
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
                          {meal_plan.name}
                          {comments ? (
                            <blockquote>{comments}</blockquote>
                          ) : null}
                        </div>,
                        <div>
                          {joinAttributes(
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
                          )}
                        </div>,
                        numberToLocalString(given_price),
                      ]
                    })}
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
