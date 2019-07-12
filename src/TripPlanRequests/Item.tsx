import React, { useEffect, Fragment, useCallback } from "react"
import { RouteComponentProps, Link, Redirect } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { useSelector } from "react-redux"
import moment from "moment"

import { ThunkAction } from "./../types"
import { ITripPlanRequest, actions, IStateWithKey, selectors } from "./store"
import { useThunkDispatch } from "../utils"

function XHR(xhr: AxiosInstance) {
  return {
    async getTripPlanRequest(id: string): Promise<ITripPlanRequest> {
      return xhr.get(`/trip-plan-requests/${id}`).then(({ data }) => data.data)
    },
  }
}

export const getCabAction = (
  id: string
): ThunkAction<Promise<ITripPlanRequest>> => async (dispatch, _, { xhr }) => {
  dispatch(actions.item.request())
  return XHR(xhr)
    .getTripPlanRequest(id)
    .then(cab => {
      dispatch(actions.item.success(cab))
      return cab
    })
    .catch(error => {
      dispatch(actions.item.failure(error))
      return Promise.reject(error)
    })
}

export function useTripPlanRequestState(itemId?: number | string) {
  interface StateProps {
    isFetching: boolean
    item?: ITripPlanRequest
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const selector = selectors(state)
    return {
      isFetching: selector.isFetching,
      item: selector.getItem(itemId),
    }
  })
}

export function useTripPlanRequestFetch() {
  const dispatch = useThunkDispatch()
  return useCallback((itemId: string) => dispatch(getCabAction(itemId)), [
    dispatch,
  ])
}

export function useCab(itemId?: string, shouldFetch: boolean = false) {
  const state = useTripPlanRequestState(itemId)
  const fetch = useTripPlanRequestFetch()
  useEffect(() => {
    if (shouldFetch) {
      itemId && fetch(itemId)
    }
  }, [itemId, shouldFetch, fetch])
  return {
    ...state,
    fetch,
  }
}

export default function TripPlanRequest({
  cabId: itemId,
  navigate,
}: RouteComponentProps<{ cabId: string }>) {
  const { item, isFetching } = useCab(itemId, true)
  if (!itemId) {
    navigate && navigate("/trip-plan-requests")
    return null
  }
  return (
    <Fragment>
      <Helmet>
        <title>
          Request from {item ? item.name : ""} {item ? item.phone_number : ""}
        </title>
      </Helmet>
      <Link to="..">Back to list</Link>
      {isFetching ? (
        "Loading..."
      ) : item ? (
        <div>
          {item.name} - {item.phone_number} - {item.destination}
          <br />
          Created at:{" "}
          {moment
            .utc(item.created_at)
            .local()
            .toLocaleString()}
          <br />
        </div>
      ) : (
        <Redirect noThrow to="/trip-plan-requests" />
      )}
    </Fragment>
  )
}
