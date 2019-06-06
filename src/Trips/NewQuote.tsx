import React, { useState } from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"
import Button from "@tourepedia/button"
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
    saveQuote(tripId: string | number, data: any): Promise<IQuote> {
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
  function saveQuote() {
    XHR(xhr)
      .saveQuote(trip.id, {
        total_price: hotelPrice + cabPrice,
        hotels,
        cabs,
        comments,
      })
      .then(resp => {
        navigate && navigate("../quotes")
      })
  }
  return (
    <div className="pb-8">
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
              initialValues={
                quote
                  ? {
                      hotels: quote.hotels.map(
                        ({
                          date,
                          room_type,
                          adults_with_extra_bed,
                          children_with_extra_bed,
                          children_without_extra_bed,
                          no_of_rooms,
                          ...hotel
                        }) => ({
                          ...hotel,
                          start_date: moment
                            .utc(date)
                            .local()
                            .format("YYYY-MM-DD"),
                          no_of_nights: 1,
                          room_details: [
                            {
                              room_type,
                              adults_with_extra_bed,
                              children_with_extra_bed,
                              children_without_extra_bed,
                              no_of_rooms,
                            },
                          ],
                        })
                      ),
                    }
                  : undefined
              }
              onChange={(hotelPrice, hotels) => {
                setHotelPrice(hotelPrice)
                setHotels(hotels)
              }}
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
              initialValues={
                quote
                  ? {
                      cabs: quote.cabs.map(({ date, ...cab }) => ({
                        start_date: moment
                          .utc(date)
                          .local()
                          .format("YYYY-MM-DD"),
                        no_of_days: 1,
                        ...cab,
                      })),
                    }
                  : undefined
              }
              onChange={(cabPrice, cabs) => {
                setCabPrice(cabPrice)
                setCabs(cabs)
              }}
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
    </div>
  )
}

export default withXHR(NewQuote)
