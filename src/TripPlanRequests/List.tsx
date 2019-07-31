import React, { useEffect, Fragment, useCallback, useState } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { useSelector, useDispatch } from "react-redux"
import { Omit } from "utility-types"
import moment from "moment"

import { ThunkAction, ThunkDispatch } from "./../types"
import { ITripPlanRequest, actions, IStateWithKey, selectors } from "./store"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import { Search, useSearch } from "./../Shared/Search"
import { List } from "./../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { Table, Paginate, Button } from "@tourepedia/ui"
import { IPaginate } from "./../model"
import { Formik, Form } from "formik"
import { FormikFormGroup } from "../Shared/InputField"
import { SelectUsers } from "../Users"

export function XHR(xhr: AxiosInstance) {
  return {
    async getTripPlanRequests(
      params?: any
    ): Promise<{ data: ITripPlanRequest[]; meta: any }> {
      return xhr.get("/trip-plan-requests", { params }).then(resp => resp.data)
    },
    async assignTripRequestsOwner(
      ownerId: number,
      requestIds: Array<number>
    ): Promise<{ data: ITripPlanRequest[]; meta: any }> {
      return xhr
        .post("/trip-plan-request-owners", {
          items: requestIds,
          owner_id: ownerId,
        })
        .then(resp => resp.data)
    },
  }
}

const Owner = withXHR(function Owner({
  xhr,
  request,
  onUpdate,
}: XHRProps & { request: ITripPlanRequest; onUpdate?: () => any }) {
  const { owner, assigned_at } = request
  const [isEditing, changeIsEditing] = useState(false)
  return (
    <span>
      {owner ? (
        <span>
          <Link to={`/users/${owner.id}`}>{owner.name}</Link> on{" "}
          {moment.utc(assigned_at).format("Do MMM, YYYY")}
        </span>
      ) : (
        <span>Not Set</span>
      )}
      {isEditing ? (
        <Formik
          initialValues={{
            owner,
          }}
          onSubmit={(values, actions) => {
            actions.setStatus()
            const { owner } = values
            if (!owner) return null
            XHR(xhr)
              .assignTripRequestsOwner(owner.id, [request.id])
              .then(data => {
                actions.setSubmitting(false)
                changeIsEditing(false)
                onUpdate && onUpdate()
                return data
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
          render={({ isSubmitting, setFieldValue, status }) => (
            <Form>
              <fieldset>
                {status ? <p className="text-red-700 my-2">{status}</p> : null}
                <FormikFormGroup
                  name="owner"
                  render={({ field }) => (
                    <SelectUsers
                      {...field}
                      multiple={false}
                      label="Select Owner"
                      onChange={(value, name) => setFieldValue(name, value)}
                    />
                  )}
                />
                <footer>
                  <Button primary type="submit" disabled={isSubmitting}>
                    Assign
                  </Button>
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => changeIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </footer>
              </fieldset>
            </Form>
          )}
        />
      ) : (
        <Button title="Edit" onClick={() => changeIsEditing(true)}>
          &#9998;
        </Button>
      )}
    </span>
  )
})

export const getTriPlanRequestsAction = (
  params?: any
): ThunkAction<Promise<ITripPlanRequest[]>> => async (dispatch, _, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getTripPlanRequests(params)
    .then(({ data, meta }) => {
      dispatch(actions.list.success({ data, meta }))
      return data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

function useTripPlanRequestsState() {
  interface StateProps extends IPaginate {
    items: ITripPlanRequest[]
    isFetching: boolean
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const selector = selectors(state)
    return {
      ...selector.meta,
      isFetching: selector.isFetching,
      items: selector.get(),
    }
  })
}

function useTripPlanRequestsFetch() {
  const dispatch = useDispatch<ThunkDispatch>()
  return useCallback(
    (params?: any) => dispatch(getTriPlanRequestsAction(params)),
    [dispatch]
  )
}

export function useTripPlanRequests() {
  return {
    ...useTripPlanRequestsState(),
    fetch: useTripPlanRequestsFetch(),
  }
}

export default function TripPlanRequests(_: RouteComponentProps) {
  const {
    items,
    total,
    from,
    to,
    currentPage,
    lastPage,
    isFetching,
    fetch,
  } = useTripPlanRequests()
  const [params, setParams] = useSearch()
  useEffect(() => {
    fetch({ page: currentPage })
  }, [fetch])
  return (
    <Fragment>
      <Helmet>
        <title>Trip Plan Requests</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              fetch({ ...params, page: 1 })
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
            onChange={page => fetch({ ...params, page })}
          />
        </Col>
      </Grid>
      <List isFetching={isFetching} total={total}>
        <Table
          headers={["Guest", "Destination", "Pax", "Comments", "Actions"]}
          striped
          bordered
          rows={items.map(r => [
            <span>
              <h4>{r.name}</h4>
              {r.phone_number} • {r.email}
            </span>,
            <span>
              <h4>{r.destination}</h4>
              <span>
                {r.start_date
                  ? moment
                      .utc(r.start_date)
                      .local()
                      .format("Do MMM, YYYY")
                  : null}{" "}
                • {r.no_of_days} Days
              </span>
            </span>,
            <span>
              {r.no_of_adults} Adults with {r.no_of_children} Children
            </span>,
            <span>
              {r.hotel_preference ? (
                <span>
                  Hotel Preference: {r.hotel_preference}
                  <br />
                </span>
              ) : null}
              <blockquote>{r.comments}</blockquote>
            </span>,
            <span>
              {r.trip_id ? (
                <Link to={`/trips/${r.trip_id}`}>View Associated Trip</Link>
              ) : null}
              <br />
              Owner:{" "}
              <Owner
                request={r}
                onUpdate={() => {
                  fetch({ page: currentPage, ...params })
                }}
              />{" "}
              <br />
              Created at: {moment.utc(r.created_at).format("Do MMM, YYYY")}
            </span>,
          ])}
        />
      </List>
    </Fragment>
  )
}

interface SelectTripPlanRequestsProps
  extends XHRProps,
    Omit<AsyncProps, "fetch"> {
  value?: ITripPlanRequest[]
  onChange: (items: ITripPlanRequest[]) => void
}

export const SelectTripPlanRequests = withXHR<SelectTripPlanRequestsProps>(
  function SelectTripPlanRequests({
    xhr,
    ...otherProps
  }: SelectTripPlanRequestsProps) {
    return (
      <Async
        multiple
        fetch={q =>
          XHR(xhr)
            .getTripPlanRequests({ q })
            .then(resp => resp.data)
        }
        {...otherProps}
      />
    )
  }
)
