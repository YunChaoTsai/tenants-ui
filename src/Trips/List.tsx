import React, { useEffect, Fragment, useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { AxiosInstance } from "axios"
import moment from "moment"
import Helmet from "react-helmet-async"
import { Table, Icons, Paginate, Button, Badge } from "@tourepedia/ui"

import { ITrip, IStateWithKey, actions, selectors } from "./store"
import { ThunkAction } from "./../types"
import Search, { useSearch } from "../Shared/Search"
import Listable from "./../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "../model"
import { useSelector } from "react-redux"
import { useThunkDispatch, numberToLocalString } from "../utils"
import { SelectTripStages, store as tripStageStore } from "../TripStages"
import { SelectTags, store as tagStore } from "../Tags"
import { Formik, Form } from "formik"
import { FormikFormGroup, OnFormChange, InputField } from "../Shared/InputField"

export function XHR(xhr: AxiosInstance) {
  return {
    async getTrips(params?: any): Promise<{ data: ITrip[]; meta: any }> {
      return xhr.get("/trips", { params }).then(resp => resp.data)
    },
  }
}

export const getTripsAction = (
  params?: any
): ThunkAction<Promise<ITrip[]>> => async (dispatch, _, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getTrips(params)
    .then(trips => {
      dispatch(actions.list.success(trips))
      return trips.data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

export function useTripsState() {
  interface StateProps extends IPaginate {
    trips: ITrip[]
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const tripSelector = selectors(state)
    return {
      ...tripSelector.meta,
      isFetching: tripSelector.isFetching,
      trips: tripSelector.get(),
    }
  })
}

export function useTripsFetch() {
  const dispatch = useThunkDispatch()
  return useCallback((params?: any) => dispatch(getTripsAction(params)), [
    dispatch,
  ])
}

export function useTrips() {
  return {
    ...useTripsState(),
    fetchTrips: useTripsFetch(),
  }
}

interface IFilters {
  q?: string
  stages?: Array<tripStageStore.ITripStage>
  tags?: Array<tagStore.ITag>
  hotels_not_booked?: boolean
}

export default function List({  }: RouteComponentProps) {
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
    const {
      stages = [],
      tags = [],
      hotels_not_booked = false,
      ...otherParams
    } = params
    getTrips({
      stages: stages.map(s => s.name),
      tags: tags.map(t => t.name),
      hotels_not_booked: Number(hotels_not_booked),
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
            onChange={({
              stages = [],
              tags = [],
              hotels_not_booked = false,
              ...otherParams
            }) => {
              setParams({
                ...params,
                stages,
                tags,
                hotels_not_booked,
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
              headers={["Destinations", "Dates", "Traveler", "Stage", "Teams"]}
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
                  latest_stage,
                  created_by,
                  created_at,
                  latest_given_quote,
                  sales_team = [],
                  operations_team = [],
                }) => [
                  <div>
                    <div>
                      <Link to={id.toString()}>
                        {trip_id || id}-{trip_source.short_name}
                      </Link>
                    </div>
                    <div>
                      {locations.map(l => l.short_name).join(" • ")}
                      {latest_given_quote ? (
                        <small>
                          {" "}
                          (
                          {latest_given_quote.locations
                            .map(l => l.short_name)
                            .join("-")}
                          )
                        </small>
                      ) : null}
                    </div>
                  </div>,
                  <div>
                    <div>
                      {moment
                        .utc(start_date)
                        .local()
                        .format("Do MMM, YYYY")}{" "}
                      • {moment(end_date).diff(start_date, "days")} Nights
                    </div>
                    <small>
                      (
                      {moment.utc().isBefore(start_date)
                        ? `${moment
                            .utc(start_date)
                            .local()
                            .diff(moment(), "days")} days remaining`
                        : moment.utc().isAfter(end_date)
                        ? `${moment.utc().diff(end_date, "days")} days ago`
                        : "On Trip"}
                      )
                    </small>
                  </div>,
                  contact ? (
                    <div>
                      <div>{contact.name}</div>
                      <small>
                        {no_of_adults} Adults
                        {children ? " with " + children : ""}
                        {contact.phone_number || contact.email ? " • " : ""}
                        {contact.phone_number ? (
                          <a href={`tel:${contact.phone_number}`}>
                            {contact.phone_number}
                          </a>
                        ) : null}
                        {contact.phone_number && contact.email ? " • " : ""}
                        {contact.email ? (
                          <a href={`mailto:${contact.email}`}>
                            {contact.email}
                          </a>
                        ) : null}
                      </small>
                    </div>
                  ) : null,
                  <div>
                    <div>{latest_stage ? latest_stage.name : "Initiated"}</div>
                    <small>
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
                    </small>
                  </div>,
                  <div>
                    <div>
                      Sales Team:{" "}
                      {sales_team.map(user => user.name).join(" • ")}
                    </div>
                    <div>
                      Ops Team:{" "}
                      {operations_team.map(user => user.name).join(" • ")}
                    </div>
                  </div>,
                ]
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
            name="stages"
            render={({ field }) => (
              <SelectTripStages
                {...field}
                label="Trip Stage"
                fetchOnMount
                placeholder="Select stage(s)..."
                onChange={(value, name) => setFieldValue(name, value)}
              />
            )}
          />
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
          <InputField
            name="hotels_not_booked"
            type="checkbox"
            label="Hotels Not Booked"
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
