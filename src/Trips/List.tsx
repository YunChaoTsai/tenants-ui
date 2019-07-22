import React, { useEffect, Fragment, useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { AxiosInstance } from "axios"
import moment from "moment"
import Helmet from "react-helmet-async"
import { Table, Icons, Paginate, Button } from "@tourepedia/ui"

import { ITrip, IStateWithKey, actions, selectors } from "./store"
import { ThunkAction } from "./../types"
import Search, { useSearch } from "../Shared/Search"
import Listable from "./../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "../model"
import { useSelector } from "react-redux"
import { useThunkDispatch } from "../utils"
import { SelectTripStages, store as tripStageStore } from "../TripStages"
import { SelectTags, store as tagStore } from "../Tags"
import { Formik, Form } from "formik"
import { FormikFormGroup, OnFormChange } from "../Shared/InputField"

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

function useTripsState() {
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

function useTripsFetch() {
  const dispatch = useThunkDispatch()
  return useCallback((params?: any) => dispatch(getTripsAction(params)), [
    dispatch,
  ])
}

function useTrips() {
  return {
    ...useTripsState(),
    fetchTrips: useTripsFetch(),
  }
}

export default function List({  }: RouteComponentProps) {
  const [params, setParams] = useSearch()
  const {
    trips,
    fetchTrips: getTrips,
    total,
    from,
    to,
    currentPage,
    lastPage,
    isFetching,
  } = useTrips()
  useEffect(() => {
    getTrips({ page: currentPage })
  }, [getTrips])
  return (
    <Fragment>
      <Helmet>
        <title>List of trips</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getTrips({ ...params, page: 1 })
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
            onChange={({ stages = [], tags = [] }) => {
              getTrips({
                stages: stages.map(s => s.name),
                tags: tags.map(t => t.name),
                ...params,
                page: 1,
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
              headers={[
                "ID",
                "Dates",
                "Stages",
                "Destinations",
                "Traveler",
                "Pax",
              ]}
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
                }) => [
                  <Link to={id.toString()}>
                    {trip_source.short_name}-{trip_id || id}
                  </Link>,
                  `${moment
                    .utc(start_date)
                    .local()
                    .format("DD/MM/YYYY")} to ${moment
                    .utc(end_date)
                    .local()
                    .format("DD/MM/YYYY")}`,
                  latest_stage ? latest_stage.name : "Initiated",
                  locations.map(l => l.short_name).join(" • "),
                  contact ? (
                    <div>
                      {contact.name}
                      <br />
                      <a
                        href={`tel:${contact.phone_number}`}
                        className="btn--icon"
                      >
                        <Icons.PhoneIcon
                          title={`Call to ${contact.name} on ${
                            contact.phone_number
                          }`}
                        />
                      </a>
                      <a href={`mailto:${contact.email}`} className="btn--icon">
                        <Icons.MailIcon
                          title={`Send Email to ${contact.name} at ${
                            contact.email
                          }`}
                        />
                      </a>
                    </div>
                  ) : null,
                  `${no_of_adults} Adults${
                    children ? " with " + children : ""
                  }`,
                ]
              )}
            />
          </Listable>
        </Col>
      </Grid>
    </Fragment>
  )
}

interface IFilters {
  q?: string
  stages?: Array<tripStageStore.ITripStage>
  tags?: Array<tagStore.ITag>
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
