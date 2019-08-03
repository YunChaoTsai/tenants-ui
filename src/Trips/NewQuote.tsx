import React, { useState, useCallback, useMemo, useRef } from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"
import { Button, ownerDocument } from "@tourepedia/ui"
import moment from "moment"

import { withXHR, XHRProps } from "./../xhr"
import { ITrip, IQuote } from "./store"
import { CalculatePriceForm as CalculateHotelPrice } from "./../Hotels"
import { CalculatePriceForm as CalculateCabPrice } from "./../TransportServicePrices"
import { Input, FormGroup } from "./../Shared/InputField"
import { Grid, Col } from "../Shared/Layout"
import { numberToLocalString } from "../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async saveQuote(tripId: string | number, data: any): Promise<IQuote> {
      return xhr
        .post(`/trips/${tripId}/quotes`, data)
        .then(resp => resp.data.quote)
    },
  }
}

interface NewQuoteProps extends RouteComponentProps, XHRProps {
  trip: ITrip
}

function NewQuote({ xhr, navigate, trip, location }: NewQuoteProps) {
  const quote: IQuote | undefined =
    location && location.state && location.state.quote
  const [hotelPrice, setHotelPrice] = useState<number>(0)
  const [cabPrice, setCabPrice] = useState<number>(0)
  const [hotels, setHotels] = useState<any>([])
  const [cabs, setCabs] = useState<any>([])
  const [comments, setComments] = useState<string>(quote ? quote.comments : "")
  const [errors, setErrors] = useState<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const saveQuote = useCallback(() => {
    setErrors(null)
    XHR(xhr)
      .saveQuote(trip.id, {
        total_price: hotelPrice + cabPrice,
        hotels,
        cabs,
        comments,
      })
      .then(() => {
        navigate && navigate("../quotes")
      })
      .catch(e => {
        setErrors(e)
        const document = containerRef.current
        if (document) {
          const buttons: NodeListOf<
            HTMLButtonElement
          > = document.querySelectorAll("[type='submit']")
          buttons.forEach(btn =>
            typeof btn.click === "function" ? btn.click() : null
          )
        }
      })
  }, [xhr, trip, hotelPrice, cabPrice, hotels, cabs, comments, navigate])
  const handleHotelChange = useCallback(
    (hotelPrice, hotels) => {
      setErrors(null)
      setHotelPrice(hotelPrice)
      setHotels(hotels)
    },
    [setHotelPrice, setHotels]
  )
  const handleCabChange = useCallback(
    (cabPrice, cabs) => {
      setErrors(null)
      setCabPrice(cabPrice)
      setCabs(cabs)
    },
    [setCabPrice, setCabs]
  )
  const initialQuote = useMemo(() => {
    const hotels = quote
      ? {
          hotels: quote.hotels.map(
            ({
              checkin,
              checkout,
              room_type,
              adults_with_extra_bed,
              children_with_extra_bed,
              children_without_extra_bed,
              no_of_rooms,
              ...hotel
            }) => ({
              ...hotel,
              start_date: moment
                .utc(checkin)
                .local()
                .format("YYYY-MM-DD"),
              no_of_nights:
                moment.utc(checkout).diff(moment.utc(checkin), "days") + 1,
              rooms_detail: {
                room_type,
                adults_with_extra_bed,
                children_with_extra_bed,
                children_without_extra_bed,
                no_of_rooms,
              },
            })
          ),
        }
      : undefined
    const cabs = quote
      ? {
          cabs: quote.cabs.map(({ from_date, to_date, ...cab }) => ({
            start_date: moment
              .utc(from_date)
              .local()
              .format("YYYY-MM-DD"),
            no_of_days:
              moment.utc(to_date).diff(moment.utc(from_date), "days") + 1,
            ...cab,
          })),
        }
      : undefined
    return { hotels, cabs }
  }, [quote])
  const bookingFrom = moment
    .utc(trip.start_date)
    .local()
    .format("YYYY-MM-DD HH:mm:ss")
  const bookingTo = moment
    .utc(trip.end_date)
    .local()
    .format("YYYY-MM-DD HH:mm:ss")
  return (
    <div className="pb-8" ref={containerRef}>
      <h3 className="mb-8">Create a new quote</h3>
      <section className="mb-16">
        <Grid>
          <Col lg={2}>
            <h5>Calculate Prices for hotels</h5>
            <p>
              Please fill hotel details and then click on get price to get the
              respective prices. Update the given price if necessary.
            </p>
          </Col>
          <Col>
            <CalculateHotelPrice
              bookingFrom={bookingFrom}
              bookingTo={bookingTo}
              initialValues={initialQuote.hotels}
              onChange={handleHotelChange}
            />
            <footer className="mt-4">
              <mark>
                Total price for Accommodation: {numberToLocalString(hotelPrice)}
              </mark>
            </footer>
          </Col>
        </Grid>
      </section>
      <section className="mb-16">
        <Grid>
          <Col lg={2}>
            <h5>Calculate Prices for Cabs</h5>
            <p>
              Please fill the transportation details and click on get price to
              get the corresponding prices. Update given prices if necessary.
            </p>
          </Col>
          <Col>
            <CalculateCabPrice
              bookingFrom={bookingFrom}
              bookingTo={bookingTo}
              initialValues={initialQuote.cabs}
              onChange={handleCabChange}
            />
            <footer className="mt-4">
              <mark>
                Total price for Transportation: {numberToLocalString(cabPrice)}
              </mark>
            </footer>
          </Col>
        </Grid>
      </section>
      <hr />
      <h3>
        <mark>
          Total Cost Price: {numberToLocalString(hotelPrice + cabPrice)}
        </mark>
      </h3>
      <FormGroup>
        <label>Any Comment</label>
        <Input
          name="comments"
          as="textarea"
          value={comments}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setComments(e.target.value)
          }
          placeholder="Any comments regarding other services or anything else..."
          maxLength={191}
        />
      </FormGroup>
      <Button primary onClick={saveQuote}>
        Save Quote
      </Button>
      {errors ? <p className="text-red-700 my-2">{errors.message}</p> : null}
    </div>
  )
}

export default withXHR(NewQuote)
