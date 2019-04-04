import React, { useEffect, Fragment } from "react"
import { RouteComponentProps, Link, Redirect } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { connect } from "react-redux"
import moment from "moment"

import { ThunkAction, ThunkDispatch } from "./../types"
import { RedirectUnlessAuthenticated } from "./../Auth"
import { ICab, actions, IStateWithKey, selectors } from "./store"

function XHR(xhr: AxiosInstance) {
  return {
    getCab(id: string): Promise<ICab> {
      return xhr.get(`/cabs/${id}`).then(({ data }) => data.cab)
    },
  }
}

export const getCab = (id: string): ThunkAction<Promise<ICab>> => (
  dispatch,
  getState,
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

interface StateProps {
  isFetching: boolean
  cab?: ICab
}
interface DispatchProps {
  getCab: (id: string) => Promise<ICab>
}
interface OwnProps {
  cabId?: string
  render: (props: StateProps & { cabId?: string }) => React.ReactNode
}
interface CabsProps extends OwnProps, StateProps, DispatchProps {}

export const withCabData = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  (state, ownProps) => {
    const cabsSelector = selectors(state)
    return {
      isFetching: cabsSelector.isFetching,
      cab: cabsSelector.getCab(ownProps.cabId),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getCab: (id: string) => dispatch(getCab(id)),
  })
)

export const CabDataProvider = withCabData(function CabDataProvider({
  getCab,
  cab,
  isFetching,
  cabId,
  render,
}: CabsProps) {
  useEffect(() => {
    if (cabId) getCab(cabId)
  }, [])
  return (
    <Fragment>
      {render({
        cab,
        isFetching,
        cabId,
      })}
    </Fragment>
  )
})

export default function Cab({
  cabId,
  navigate,
}: RouteComponentProps<{ cabId: string }>) {
  return (
    <CabDataProvider
      cabId={cabId}
      render={({ cab, isFetching }) => {
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
                {cab.cab_type.name} - {cab.number_plate}
                <br />
                Created at:{" "}
                {moment
                  .utc(cab.created_at)
                  .local()
                  .toLocaleString()}
                <br />
              </div>
            ) : (
              <Redirect noThrow to="/users" />
            )}
          </Fragment>
        )
      }}
    />
  )
}
