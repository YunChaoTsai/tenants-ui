import React, { useEffect, Fragment, useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import moment from "moment"
import Helmet from "react-helmet-async"
import { Table, Icons, Paginate, Button, Badge } from "@tourepedia/ui"

import Search, { useSearch } from "../Shared/Search"
import Listable from "./../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { numberToLocalString, joinAttributes } from "../utils"
import { SelectTags, store as tagStore } from "../Tags"
import { Formik, Form } from "formik"
import { FormikFormGroup, OnFormChange } from "../Shared/InputField"
import { useTrips } from "./List"
import { mergeByHotel, QuoteHotelBookingStage } from "./HotelBookings"
import { IQuoteHotel } from "./store"

interface IFilters {
  q?: string
  tags?: Array<tagStore.ITag>
}

export default function HotelsBookingPendingList({  }: RouteComponentProps) {
  const [params, setParams] = useSearch<IFilters>()
  const {
    trips,
    fetchTrips,
    total,
    from,
    to,
    currentPage,
    lastPage,
    isFetching,
  } = useTrips()
  const getTrips = useCallback(
    params => {
      fetchTrips(params)
    },
    [fetchTrips]
  )
  useEffect(() => {
    const { tags = [], ...otherParams } = params
    getTrips({
      tags: tags.map(t => t.name),
      hotels_not_booked: 1,
      ...otherParams,
      page: 1,
    })
  }, [params, getTrips])
  return (
    <Fragment>
      <Helmet>
        <title>List of trips</title>
      </Helmet>
      <div>
        <Link to="new" className="float-right btn">
          Add New Trip
        </Link>
        <h2>List of Trips</h2>
      </div>
      <hr />
      <Grid>
        <Col>
          <Search
            placeholder="Search by id, destination..."
            onSearch={newParams => {
              setParams({ ...params, ...newParams })
            }}
          />
        </Col>
        <Col className="text-right">
          <Paginate
            total={total}
            from={from}
            to={to}
            currentPage={currentPage}
            lastPage={lastPage}
            isFetching={isFetching}
            onChange={page => getTrips({ ...params, page })}
          />
        </Col>
      </Grid>
      <Grid>
        <Col md="auto">
          <Filters
            onChange={({ tags = [], ...otherParams }) => {
              setParams({
                ...params,
                tags,
                ...otherParams,
              })
            }}
          />
        </Col>
        <Col>
          <Listable total={total} isFetching={isFetching}>
            <Table
              striped
              bordered
              responsive
              headers={["Basic Details", "Hotels"]}
              rows={trips.map(
                ({
                  id,
                  trip_source,
                  trip_id,
                  start_date,
                  end_date,
                  locations,
                  no_of_adults,
                  children,
                  contact,
                  created_by,
                  created_at,
                  latest_given_quote,
                }) => {
                  const mergedByHotel: {
                    [key: string]: Array<IQuoteHotel>
                  } = latest_given_quote ? mergeByHotel(latest_given_quote) : {}
                  return [
                    <div>
                      <h4>
                        <Link to={`${id}`}>
                          {locations.map(l => l.short_name).join(" • ")}
                          {latest_given_quote ? (
                            <span>
                              {" "}
                              (
                              {latest_given_quote.locations
                                .map(l => l.short_name)
                                .join("-")}
                              )
                            </span>
                          ) : null}
                        </Link>
                      </h4>
                      <div className="flex items-center">
                        <div className="mr-2">
                          <Icons.CalendarIcon />
                        </div>
                        <div>
                          {joinAttributes(
                            moment
                              .utc(start_date)
                              .local()
                              .format("Do MMM, YYYY"),
                            <span>
                              {moment(end_date).diff(start_date, "days")} Nights
                            </span>,
                            <span>
                              {moment.utc().isBefore(start_date)
                                ? `${moment
                                    .utc(start_date)
                                    .local()
                                    .diff(moment(), "days")} days remaining`
                                : moment.utc().isAfter(end_date)
                                ? `${moment
                                    .utc()
                                    .diff(end_date, "days")} days ago`
                                : "On Trip"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2">
                          <Icons.UsersIcon />
                        </div>
                        <div>
                          {joinAttributes(`${no_of_adults} Adults`, [
                            children,
                            `with ${children}`,
                          ])}
                        </div>
                      </div>
                      <div className="text-sm my-3">
                        {joinAttributes(
                          [
                            latest_given_quote,
                            <span>
                              {latest_given_quote ? (
                                <span>
                                  <Badge primary>
                                    <Icons.RupeeIcon />{" "}
                                    {numberToLocalString(
                                      latest_given_quote.given_price
                                    )}
                                  </Badge>{" "}
                                  by {latest_given_quote.created_by.name}
                                  {" • "}
                                  {moment
                                    .utc(created_at)
                                    .local()
                                    .fromNow()}
                                </span>
                              ) : (
                                <span>
                                  Initiated by {created_by.name} •{" "}
                                  {moment
                                    .utc(created_at)
                                    .local()
                                    .fromNow()}
                                </span>
                              )}
                            </span>,
                          ],
                          <Link to={`/trips/${id.toString()}`}>
                            {trip_id || id}-{trip_source.short_name}
                          </Link>
                        )}
                      </div>
                      {contact ? (
                        <div>
                          <div>{contact.name}</div>
                          <div className="text-sm">
                            {joinAttributes(
                              [
                                contact.phone_number,
                                <a
                                  href={`tel:${contact.phone_number}`}
                                  className="text-gray-600"
                                >
                                  {contact.phone_number}
                                </a>,
                              ],
                              [
                                contact.email,
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="text-gray-600"
                                >
                                  {contact.email}
                                </a>,
                              ]
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>,
                    <div>
                      {Object.keys(mergedByHotel).map((hotelId: string) => {
                        const quoteHotels = mergedByHotel[hotelId]
                        if (!quoteHotels.length) return null
                        const quoteHotel = quoteHotels[0]
                        const { hotel } = quoteHotel
                        return (
                          <div key={hotelId} className="mb-4">
                            <Grid>
                              <Col>
                                <h4 className="mb-2 font-semibold">
                                  {hotel.name}
                                </h4>
                                <div className="text-sm text-gray-600">
                                  {joinAttributes(
                                    hotel.location.short_name,
                                    `${hotel.stars} Star`
                                  )}
                                </div>
                              </Col>
                              <Col>
                                <QuoteHotelBookingStage
                                  quoteHotels={quoteHotels}
                                />
                              </Col>
                            </Grid>
                          </div>
                        )
                      })}
                    </div>,
                  ]
                }
              )}
            />
          </Listable>
        </Col>
      </Grid>
    </Fragment>
  )
}

interface FilterProps {
  label?: string
  onChange: (filters: IFilters) => void
}

function Filters({ label = "Filters", onChange }: FilterProps) {
  return (
    <Formik
      initialValues={{}}
      onSubmit={values => {
        onChange(values)
      }}
      render={({ setFieldValue }) => (
        <Form noValidate>
          <h5 className="mb-4 border-b">{label}</h5>
          <FormikFormGroup
            name="tags"
            render={({ field }) => (
              <SelectTags
                {...field}
                type="trip"
                label="Tags"
                placeholder="Search and select tag(s)..."
                onChange={(value, name) => setFieldValue(name, value)}
              />
            )}
          />
          <OnFormChange
            onChange={({ values }) => {
              onChange(values)
            }}
          />
          <Button type="submit">Filter</Button>
        </Form>
      )}
    />
  )
}
