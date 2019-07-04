import React, { useEffect, Fragment, useCallback } from "react"
import { RouteComponentProps, Link, Redirect } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { useSelector } from "react-redux"
import moment from "moment"

import { ThunkAction } from "./../types"
import { ICab, actions, IStateWithKey, selectors } from "./store"
import { useThunkDispatch } from "../utils"

function XHR(xhr: AxiosInstance) {
  return {
    async getCab(id: string): Promise<ICab> {
      return xhr.get(`/cabs/${id}`).then(({ data }) => data.data)
    },
  }
}

export const getCabAction = (id: string): ThunkAction<Promise<ICab>> => async (
  dispatch,
  _,
  { xhr }
) => {
  dispatch(actions.item.request())
  return XHR(xhr)
    .getCab(id)
    .then(cab => {
      dispatch(actions.item.success(cab))
      return cab
    })
    .catch(error => {
      dispatch(actions.item.failure(error))
      return Promise.reject(error)
    })
}

export function useCabState(cabId?: number | string) {
  interface StateProps {
    isFetching: boolean
    cab?: ICab
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const cabsSelector = selectors(state)
    return {
      isFetching: cabsSelector.isFetching,
      cab: cabsSelector.getItem(cabId),
    }
  })
}

export function useCabFetch() {
  const dispatch = useThunkDispatch()
  return useCallback((cabId: string) => dispatch(getCabAction(cabId)), [
    dispatch,
  ])
}

export function useCab(cabId?: string, shouldFetch: boolean = false) {
  const state = useCabState(cabId)
  const fetchCab = useCabFetch()
  useEffect(() => {
    if (shouldFetch) {
      cabId && fetchCab(cabId)
    }
  }, [cabId, shouldFetch, fetchCab])
  return {
    ...state,
    fetchCab,
  }
}

export default function Cab({
  cabId,
  navigate,
}: RouteComponentProps<{ cabId: string }>) {
  const { cab, isFetching } = useCab(cabId, true)
  if (!cabId) {
    navigate && navigate("/cabs")
    return null
  }
  return (
    <Fragment>
      <Helmet>
        <title>{cab ? cab.number_plate : ""} Cab</title>
      </Helmet>
      <Link to="..">Back to list</Link>
      {isFetching ? (
        "Loading..."
      ) : cab ? (
        <div>
          {cab.name} - {cab.cab_type.name} - {cab.number_plate}
          <br />
          Created at:{" "}
          {moment
            .utc(cab.created_at)
            .local()
            .toLocaleString()}
          <br />
        </div>
      ) : (
        <Redirect noThrow to="/cabs" />
      )}
    </Fragment>
  )
}
