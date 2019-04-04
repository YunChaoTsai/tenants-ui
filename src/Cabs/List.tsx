import React, { useEffect, Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { connect } from "react-redux"
import { Omit } from "utility-types"

import { ThunkAction, ThunkDispatch } from "./../types"
import { RedirectUnlessAuthenticated } from "./../Auth"
import { ICab, actions, IStateWithKey, selectors } from "./store"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "./../Shared/Select"

export function XHR(xhr: AxiosInstance) {
  return {
    getCabs(params?: any): Promise<ICab[]> {
      return xhr.get("/cabs", { params }).then(({ data }) => data.cabs)
    },
  }
}

export const getCabs = (params?: any): ThunkAction<Promise<ICab[]>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getCabs(params)
    .then(cabs => {
      dispatch(actions.list.success(cabs))
      return cabs
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
  cabs: ICab[]
}
interface DispatchProps {
  getCabs: (params?: any) => Promise<ICab[]>
}
interface OwnProps extends RouteComponentProps {}
interface CabsProps extends OwnProps, StateProps, DispatchProps {}
export function Cabs({ getCabs, cabs, isFetching }: CabsProps) {
  useEffect(() => {
    getCabs()
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Cabs</title>
      </Helmet>
      {!isFetching ? `Total: ${cabs.length}` : ""}
      <ul>
        {isFetching ? (
          <li>Loading...</li>
        ) : (
          cabs.map(r => (
            <li key={r.id}>
              <Link to={r.id.toString()}>
                {r.cab_type.name} - {r.number_plate}
              </Link>
            </li>
          ))
        )}
      </ul>
    </Fragment>
  )
}

export default connect<StateProps, DispatchProps, OwnProps, IStateWithKey>(
  state => {
    const cabsSelector = selectors(state)
    return {
      isFetching: cabsSelector.isFetching,
      cabs: cabsSelector.cabs,
    }
  },
  (dispatch: ThunkDispatch) => ({
    getCabs: (params?: any) => dispatch(getCabs(params)),
  })
)(Cabs)

interface SelectCabsProps extends XHRProps, Omit<AsyncProps, "fetch"> {
  value?: ICab[]
  onChange: (cabs: ICab[]) => void
}

export const SelectCabs = withXHR<SelectCabsProps>(function SelectCabs({
  xhr,
  ...otherProps
}: SelectCabsProps) {
  return <Async multiple fetch={q => XHR(xhr).getCabs()} {...otherProps} />
})
