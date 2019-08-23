import React, { useEffect, useCallback } from "react"
import { RouteComponentProps, Router } from "@reach/router"
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
import { useSelector } from "react-redux"
import Payments from "./Payments"
import LatestGivenQuote from "./LatestGivenQuote"
import { SelectTripStages } from "../TripStages"
import { Formik, Form } from "formik"
import { FormikFormGroup } from "../Shared/InputField"
import { withXHR, XHRProps } from "../xhr"

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

const BasicDetails = withXHR(function BasicDetails({
  trip,
  xhr,
}: XHRProps & { trip: ITrip }) {
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
  } = trip
  return (
    <Grid>
      <Col>
        <Table autoWidth bordered>
          <tbody>
            <tr>
              <th>ID</th>
              <td>
                {trip_source.short_name}-{trip_id || id}
              </td>
            </tr>
            <tr>
              <th>Destination</th>
              <td>{locations.map(l => l.short_name)}</td>
            </tr>
            <tr>
              <th>Dates</th>
              <td>
                {moment
                  .utc(start_date)
                  .local()
                  .format("DD MMM, YYYY")}
                {" for "}
                {moment.utc(end_date).diff(moment.utc(start_date), "days")}{" "}
                Nights
              </td>
            </tr>
            <tr>
              <th>Traveler</th>
              <td>
                {contacts.map(contact => (
                  <div key={contact.id}>
                    {contact.name}
                    <br />
                    <small>
                      <a href={`tel:${contact.phone_number}`}>
                        {contact.phone_number}
                      </a>
                      {contact.phone_number && contact.email ? (
                        <span> • </span>
                      ) : null}
                      {contact.email ? (
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      ) : null}
                    </small>
                  </div>
                ))}
              </td>
            </tr>
            <tr>
              <th>Pax</th>
              <td>
                {no_of_adults} Adults
                {children ? <span> with {children} Children</span> : ""}
              </td>
            </tr>
            <tr>
              <th>Stage</th>
              <td>
                <div>{latest_stage ? latest_stage.name : "Initiated"}</div>
                <small>by {created_by.name}</small>
              </td>
            </tr>
          </tbody>
        </Table>
      </Col>
      <Col>
        <section>
          <Component initialState={false}>
            {({ state: isEditing, setState: setIsEditing }) => (
              <div>
                {!isEditing ? (
                  <header>
                    Stage{" "}
                    <Button
                      style={{ background: "none" }}
                      className="p-0 w-8 h-8 ml-2 border-transparent"
                      onClick={() => setIsEditing(true)}
                    >
                      <span className="rotate-90 inline-block">&#9998;</span>
                    </Button>
                  </header>
                ) : null}
                {isEditing ? (
                  <Formik
                    initialValues={{
                      stage: trip.latest_stage,
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
                    {trip.latest_stage ? trip.latest_stage.name : "Initiated"}
                  </div>
                )}
              </div>
            )}
          </Component>
        </section>
        <section className="mt-4">
          <Component initialState={false}>
            {({ state: isEditing, setState: setIsEditing }) => (
              <div>
                {!isEditing ? (
                  <header className="mb-2">
                    Tags
                    <Button
                      style={{ background: "none" }}
                      className="p-0 w-8 h-8 ml-2 border-transparent"
                      onClick={() => {
                        setIsEditing(true)
                      }}
                    >
                      <span className="rotate-90 inline-block">&#9998;</span>
                    </Button>
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
                      <BadgeList>
                        {tags.map(t => (
                          <Badge key={t.id}>{t.name}</Badge>
                        ))}
                      </BadgeList>
                    ) : (
                      <div>
                        No Tags Assigned
                        <br />
                        <small>
                          Use tags to quickly indentify and group trips
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Component>
        </section>
      </Col>
    </Grid>
  )
})

function Index({ trip }: RouteComponentProps & { trip: ITrip }) {
  const { id, locations, trip_source, trip_id, activity_logs } = trip
  return (
    <div>
      <Helmet>
        <title>
          {locations.map(l => l.short_name).join(" • ")} (
          {trip_source.short_name}-{trip_id || id.toString()})
        </title>
      </Helmet>
      <BasicDetails trip={trip} />
      <Payments trip={trip} />
      <LatestGivenQuote trip={trip} />
      {activity_logs ? (
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

function useTrip(tripId?: string, shouldFetch: boolean = false) {
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
  return (
    <div>
      <ul className="border-b flex mb-4 tabs">
        <NavLink to=".." className="border">
          <Icons.ChevronDownIcon className="rotate-90" />
        </NavLink>
        <NavLink to="" className="border">
          Trip Details
        </NavLink>
        <NavLink to="given-quotes" className="border">
          Given Quotes
        </NavLink>
        <NavLink to="quotes" className="border">
          Quotes
        </NavLink>
        <NavLink to="new-quote" className="border">
          New Quote
        </NavLink>
      </ul>
      <Router>
        <Index path="/" trip={trip} />
        <GivenQuotes path="given-quotes" trip={trip} />
        <Quotes path="quotes" trip={trip} />
        <NewQuote path="new-quote" trip={trip} />
      </Router>
    </div>
  )
}
