import React, { useEffect, useCallback, Fragment } from "react"
import { RouteComponentProps, Router, Link } from "@reach/router"
import { AxiosInstance } from "axios"
import moment from "moment"
import Helmet from "react-helmet-async"
import { Icons, Button, Badge, BadgeList, Table } from "@tourepedia/ui"

import { ITrip, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction } from "./../types"
import Quotes from "./Quotes"
import GivenQuotes from "./GivenQuotes"
import NewQuote from "./NewQuote"
import { Grid, Col } from "../Shared/Layout"
import Spinner from "../Shared/Spinner"
import { useThunkDispatch } from "./../utils"
import NavLink from "../Shared/NavLink"
import Component from "../Shared/Component"
import EditTags from "../Tags/EditTags"
import EditOwners from "./EditOwners"
import { useSelector } from "react-redux"
import Payments from "./Payments"
import LatestGivenQuote from "./LatestGivenQuote"
import { SelectTripStages } from "../TripStages"
import { Formik, Form } from "formik"
import { FormikFormGroup } from "../Shared/InputField"
import { useXHR } from "../xhr"
import { useCheckPermissions, PERMISSIONS } from "../Auth"
import HotelBookings from "./HotelBookings"

export function XHR(xhr: AxiosInstance) {
  return {
    async getTrip(tripId: string): Promise<ITrip> {
      return xhr.get(`/trips/${tripId}`).then(resp => resp.data.data)
    },
    async convertTrip(data: any): Promise<ITrip> {
      return xhr.post("/converted-trips", data).then(resp => resp.data.data)
    },
    async changeTripStage(data: any): Promise<ITrip[]> {
      return xhr.put("/trip-active-stages", data).then(resp => resp.data.data)
    },
  }
}

export const getTripAction = (
  tripId: string
): ThunkAction<Promise<ITrip>> => async (dispatch, _, { xhr }) => {
  dispatch(actions.item.request())
  return XHR(xhr)
    .getTrip(tripId)
    .then(trip => {
      dispatch(actions.item.success(trip))
      return trip
    })
    .catch(error => {
      dispatch(actions.item.failure(error))
      return Promise.reject(error)
    })
}

function Breadcrumbs({ trip }: { trip: ITrip }) {
  const { trip_id, id } = trip
  return (
    <nav className="flex items-center mb-2">
      <Link to="/" className="text-gray-600">
        Home
      </Link>
      <Icons.ChevronDownIcon className="rotate-270 text-gray-500 text-sm" />
      <Link to="/trips" className="text-gray-600">
        Trips
      </Link>
      <Icons.ChevronDownIcon className="rotate-270 text-gray-500 text-sm" />
      <Link to={`/trips/${id}`} className="text-gray-500">
        {trip_id}
      </Link>
    </nav>
  )
}

export function BasicDetails({ trip }: { trip: ITrip }) {
  const { hasPermission } = useCheckPermissions()
  const xhr = useXHR()
  const {
    id,
    start_date,
    end_date,
    locations,
    no_of_adults,
    children,
    trip_source,
    trip_id,
    contacts,
    tags,
    latest_stage,
    created_by,
    created_at,
    latest_given_quote,
    sales_team = [],
    operations_team = [],
  } = trip
  return (
    <section>
      <header className="px-4 py-2 rounded-t bg-white">
        <Grid>
          <Col className="my-2">
            <h3 className="text-2xl m-0">
              {locations.map(l => l.short_name)}
              {latest_given_quote ? (
                <span className="ml-1">
                  (
                  {latest_given_quote.locations
                    .map(l => l.short_name)
                    .join("-")}
                  )
                </span>
              ) : null}
            </h3>
            <div className="text-sm text-gray-600">
              {trip_id || id}-{trip_source.short_name}
            </div>
            <div className="mt-2">
              <div className="flex items-center py-1">
                <Icons.CalendarIcon className="mr-2" />
                <div className="whitespace-pre">
                  {moment
                    .utc(start_date)
                    .local()
                    .format("DD MMM, YYYY")}
                  {" • "}
                  {moment
                    .utc(end_date)
                    .diff(moment.utc(start_date), "days")}{" "}
                  Nights,{" "}
                  {moment.utc(end_date).diff(moment.utc(start_date), "days") +
                    1}{" "}
                  Days
                </div>
              </div>
              <div className="flex items-center py-1">
                <Icons.UsersIcon className="mr-2" />
                <div>
                  {no_of_adults} Adults
                  {children ? <span> with {children} Children</span> : ""}
                </div>
              </div>
            </div>
          </Col>
          <Col className="my-2">
            <div className="mb-1 uppercase text-gray-600 font-bold text-sm tracking-wide">
              Guest
            </div>
            <div>
              {contacts.map(contact => (
                <div key={contact.id}>
                  <div className="mb-1">{contact.name}</div>
                  <div className="text-sm">
                    {contact.phone_number ? (
                      <div>
                        <a
                          href={`tel:${contact.phone_number}`}
                          className="text-gray-600"
                        >
                          {contact.phone_number}
                        </a>
                      </div>
                    ) : null}
                    {contact.email ? (
                      <div>
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-gray-600"
                        >
                          {contact.email}
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Col>
          <Col className="my-2">
            <Component initialState={false}>
              {({ state: isEditing, setState: setIsEditing }) => (
                <div>
                  {!isEditing ? (
                    <header>
                      <div className="mb-1 uppercase text-gray-600 font-bold text-sm tracking-wide">
                        Stage
                        <button
                          onClick={() => setIsEditing(true)}
                          className="ml-2"
                        >
                          <span className="rotate-90 inline-block">
                            &#9998;
                          </span>
                        </button>
                      </div>
                    </header>
                  ) : null}
                  {isEditing ? (
                    <Formik
                      initialValues={{
                        stage: latest_stage,
                      }}
                      onSubmit={(values, actions) => {
                        const { stage } = values
                        XHR(xhr)
                          .changeTripStage({
                            trips: [id],
                            stage: stage ? stage.id : null,
                          })
                          .then(() => {
                            actions.setSubmitting(false)
                            setIsEditing(false)
                          })
                          .catch(error => {
                            actions.setStatus(error.message)
                            if (error.formikErrors) {
                              actions.setErrors(error.formikErrors)
                            }
                            actions.setSubmitting(false)
                            return Promise.reject(error)
                          })
                      }}
                      render={({ setFieldValue, isSubmitting, status }) => (
                        <Form noValidate>
                          <fieldset>
                            <legend>Edit Trip Stage</legend>
                            {status ? (
                              <p className="text-red-700 mb-2">{status}</p>
                            ) : null}
                            <FormikFormGroup
                              name="stage"
                              render={({ field }) => (
                                <SelectTripStages
                                  {...field}
                                  label="Select next stage for the trip*"
                                  fetchOnMount
                                  multiple={false}
                                  onChange={(value, name) =>
                                    setFieldValue(name, value)
                                  }
                                />
                              )}
                            />
                            <footer>
                              <Button
                                disabled={isSubmitting}
                                type="submit"
                                primary
                              >
                                Update
                              </Button>{" "}
                              <Button
                                disabled={isSubmitting}
                                onClick={() => setIsEditing(false)}
                              >
                                Cancel
                              </Button>
                            </footer>
                          </fieldset>
                        </Form>
                      )}
                    />
                  ) : (
                    <div>
                      <div className="mb-1">
                        {latest_stage ? latest_stage.name : "Initiated"}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>
                          by{" "}
                          {latest_stage
                            ? latest_stage.pivot.created_by.name
                            : created_by.name}
                        </div>
                        <div>
                          {moment
                            .utc(
                              latest_stage
                                ? latest_stage.pivot.created_at
                                : created_at
                            )
                            .local()
                            .fromNow()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Component>
          </Col>
          <Col className="my-2">
            <Component initialState={false}>
              {({ state: isEditing, setState: setIsEditing }) => (
                <div>
                  {!isEditing ? (
                    <header className="mb-2">
                      <div className="mb-1 uppercase text-gray-600 font-bold text-sm tracking-wide">
                        Tags
                        <button
                          className="ml-2"
                          onClick={() => {
                            setIsEditing(true)
                          }}
                        >
                          <span className="rotate-90 inline-block">
                            &#9998;
                          </span>
                        </button>
                      </div>
                    </header>
                  ) : null}
                  {isEditing ? (
                    <EditTags
                      type="trip"
                      tags={tags}
                      itemId={trip.id}
                      onSuccess={() => {
                        setIsEditing(false)
                      }}
                      onCancel={() => {
                        setIsEditing(false)
                      }}
                    />
                  ) : (
                    <div>
                      {tags && tags.length ? (
                        <BadgeList style={{ marginLeft: "-5px" }}>
                          {tags.map(t => (
                            <Badge key={t.id}>{t.name}</Badge>
                          ))}
                        </BadgeList>
                      ) : (
                        <div
                          className="text-gray-600 text-sm"
                          title={`Tag trips to quickly indentify and group trips`}
                        >
                          No Tags
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Component>
          </Col>
        </Grid>
      </header>
      <footer className="px-4 py-2 text-sm bg-gray-200 rounded-b">
        <Grid>
          <Col className="py-1">
            <div className="flex items-center">
              <span className="text-gray-600">Sales Team: </span>
              <div className="ml-2">
                <div className="flex items-center">
                  <span>{sales_team.map(user => user.name)}</span>
                  {hasPermission(PERMISSIONS.MANAGE_TRIP_OWNERS) ? (
                    <Component initialState={false}>
                      {({ state: isEditing, setState: setIsEditing }) => (
                        <div className="ml-2">
                          {!isEditing ? (
                            <button
                              className="text-sm"
                              onClick={() => {
                                setIsEditing(true)
                              }}
                            >
                              <span className="rotate-90 inline-block mr-1">
                                &#9998;
                              </span>
                            </button>
                          ) : null}
                          {isEditing ? (
                            <EditOwners
                              type="sales_team"
                              users={sales_team}
                              itemId={trip.id}
                              onSuccess={() => {
                                setIsEditing(false)
                              }}
                              onCancel={() => {
                                setIsEditing(false)
                              }}
                            />
                          ) : null}
                        </div>
                      )}
                    </Component>
                  ) : null}
                </div>
              </div>
            </div>
          </Col>
          <Col className="py-1">
            <div className="flex items-center">
              <span className="text-gray-600">Operations Team: </span>
              <div className="ml-2">
                <div className="flex items-center">
                  <span>{sales_team.map(user => user.name)}</span>
                  {hasPermission(PERMISSIONS.MANAGE_TRIP_OWNERS) ? (
                    <Component initialState={false}>
                      {({ state: isEditing, setState: setIsEditing }) => (
                        <div className="ml-2">
                          {!isEditing ? (
                            <button
                              className="text-sm"
                              onClick={() => {
                                setIsEditing(true)
                              }}
                            >
                              <span className="rotate-90 inline-block mr-1">
                                &#9998;
                              </span>
                            </button>
                          ) : null}
                          {isEditing ? (
                            <EditOwners
                              type="operations_team"
                              users={operations_team}
                              itemId={trip.id}
                              onSuccess={() => {
                                setIsEditing(false)
                              }}
                              onCancel={() => {
                                setIsEditing(false)
                              }}
                            />
                          ) : null}
                        </div>
                      )}
                    </Component>
                  ) : null}
                </div>
              </div>
            </div>
          </Col>
        </Grid>
      </footer>
    </section>
  )
}

function Activities({ trip }: { trip: ITrip } & RouteComponentProps) {
  const { activity_logs } = trip
  return (
    <div className="p-4 bg-white rounded-b">
      {activity_logs && trip.total_quotes ? (
        <div>
          <h5>Activities</h5>
          <ol className="list-disc pl-4">
            {activity_logs.map(activity => (
              <li key={activity.id} className="py-2">
                <span>{activity.description}</span> <br />
                {activity.causer ? (
                  <small className="text-gray-600">
                    {" "}
                    by {activity.causer.name} •{" "}
                    {moment
                      .utc(activity.created_at)
                      .local()
                      .fromNow()}
                  </small>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  )
}

function useTripState(tripId?: string | number) {
  interface StateProps {
    isFetching: boolean
    trip?: ITrip
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const tripSelector = selectors(state)
    return {
      isFetching: tripSelector.isFetching,
      trip: tripSelector.getItem(tripId),
    }
  })
}

function useTripFetch() {
  const dispatch = useThunkDispatch()
  return useCallback((tripId: string) => dispatch(getTripAction(tripId)), [
    dispatch,
  ])
}

export function useTrip(tripId?: string, shouldFetch: boolean = false) {
  const state = useTripState(tripId)
  const fetchTrip = useTripFetch()
  useEffect(() => {
    if (shouldFetch) {
      tripId && fetchTrip(tripId)
    }
  }, [shouldFetch, tripId, fetchTrip])
  return {
    ...state,
    fetchTrip,
  }
}

export default function Item({
  tripId,
  navigate,
}: RouteComponentProps<{ tripId: string }>) {
  const { trip, isFetching } = useTrip(tripId, true)
  if (!tripId) {
    navigate && navigate("..")
    return null
  }
  if (isFetching)
    return (
      <div className="text-center">
        <Spinner />
      </div>
    )
  if (!trip) {
    return null
  }
  const { locations, latest_given_quote, trip_id, trip_source } = trip
  return (
    <Fragment>
      <Helmet>
        <title>
          {`${locations.map(l => l.short_name)} (${
            latest_given_quote
              ? latest_given_quote.locations.map(l => l.short_name).join("-")
              : ""
          }) | ${trip_id}-${trip_source.short_name}`}
        </title>
      </Helmet>
      <div className="mb-16">
        <Breadcrumbs trip={trip} />
        <BasicDetails trip={trip} />
      </div>
      {!trip.total_quotes ? (
        <div className="my-4 text-center">
          <Link to="new-quote" className="btn btn-primary px-3 py-2 text-lg">
            Create Quote
          </Link>
        </div>
      ) : (
        <ul className="tabs bg-gray-200 border-b border-gray-400">
          {trip.converted_at ? (
            <NavLink to="hotel-bookings">Hotel Bookings</NavLink>
          ) : null}
          {trip.converted_at ? <NavLink to="payments">Payments</NavLink> : null}
          <NavLink to="">Latest Given Quote</NavLink>
          {trip.latest_given_quote ? (
            <NavLink to="given-quotes">Given Quotes</NavLink>
          ) : null}
          {trip.total_quotes && !trip.converted_at ? (
            <NavLink to="quotes">Quotes</NavLink>
          ) : null}
          {!trip.converted_at ? (
            <NavLink to="new-quote">New Quote</NavLink>
          ) : null}
          <NavLink to="activities">Activities</NavLink>
        </ul>
      )}
      <Router>
        <LatestGivenQuote path="/" trip={trip} />
        <GivenQuotes path="given-quotes" trip={trip} />
        <Quotes path="quotes" trip={trip} />
        <NewQuote path="new-quote" trip={trip} />
        <Payments path="payments" trip={trip} />
        <HotelBookings path="hotel-bookings" trip={trip} />
        <Activities path="activities" trip={trip} />
      </Router>
    </Fragment>
  )
}
