import React, { useEffect, Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { connect } from "react-redux"
import { Omit } from "utility-types"

import { ThunkAction, ThunkDispatch } from "./../types"
import { ICab, actions, IStateWithKey, selectors } from "./store"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import { Paginate, PaginateProps } from "./../Shared/Paginate"
import { Search, useSearch } from "./../Shared/Search"
import { List } from "./../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { Table } from "@tourepedia/ui"

export function XHR(xhr: AxiosInstance) {
  return {
    getCabs(params?: any): Promise<{ data: ICab[]; meta: any }> {
      return xhr.get("/cabs", { params }).then(resp => resp.data)
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
    .then(({ data, meta }) => {
      dispatch(actions.list.success({ data, meta }))
      return data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps extends PaginateProps {
  cabs: ICab[]
}
interface DispatchProps {
  getCabs: (params?: any) => Promise<any>
}
interface OwnProps extends RouteComponentProps {}
interface CabsProps extends OwnProps, StateProps, DispatchProps {}
export function Cabs({ getCabs, cabs, ...otherProps }: CabsProps) {
  const { isFetching, currentPage, total } = otherProps
  const [params, setParams] = useSearch()
  useEffect(() => {
    getCabs({ page: currentPage })
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Cabs</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getCabs({ ...params, page: 1 })
            }}
          />
        </Col>
        <Col className="text-right">
          <Paginate
            {...otherProps}
            onChange={page => getCabs({ ...params, page })}
          />
        </Col>
      </Grid>
      <List isFetching={isFetching} total={total}>
        <Table
          headers={["Name", "Number Plate"]}
          striped
          bordered
          rows={cabs.map(r => [
            <Link to={r.id.toString()}>{r.name}</Link>,
            r.number_plate,
          ])}
        />
      </List>
    </Fragment>
  )
}

export default connect<StateProps, DispatchProps, OwnProps, IStateWithKey>(
  state => {
    const cabsSelector = selectors(state)
    return {
      ...cabsSelector.meta,
      isFetching: cabsSelector.isFetching,
      cabs: cabsSelector.get(),
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
  return (
    <Async
      multiple
      fetch={q =>
        XHR(xhr)
          .getCabs()
          .then(resp => resp.data)
      }
      {...otherProps}
    />
  )
})
