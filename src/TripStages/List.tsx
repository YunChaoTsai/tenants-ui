import React, { Fragment, useEffect } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"

import { ITripStage, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import Paginate, { PaginateProps } from "../Shared/Paginate"
import Search, { useSearch } from "../Shared/Search"
import Listable from "../Shared/List"
import { Table } from "@tourepedia/ui"
import { Grid, Col } from "../Shared/Layout"

export function XHR(xhr: AxiosInstance) {
  return {
    getTripStages(params?: any): Promise<{ data: ITripStage[]; meta: any }> {
      return xhr.get("/trip-stages", { params }).then(resp => resp.data)
    },
  }
}

export const getTripStages = (
  params?: any
): ThunkAction<Promise<ITripStage[]>> => (dispatch, getState, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getTripStages(params)
    .then(tripStages => {
      dispatch(actions.list.success(tripStages))
      return tripStages.data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps extends PaginateProps {
  tripStages: ITripStage[]
}
interface DispatchProps {
  getTripStages: (params?: any) => Promise<ITripStage[]>
}
interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const tripStagesSelector = selectors(state)
    return {
      ...tripStagesSelector.meta,
      isFetching: tripStagesSelector.isFetching,
      tripStages: tripStagesSelector.get(),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getTripStages: (params?: any) => dispatch(getTripStages(params)),
  })
)

interface ListProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}
function List({ getTripStages, tripStages, ...otherProps }: ListProps) {
  const { total, isFetching, currentPage } = otherProps
  const [params, setParams] = useSearch()
  useEffect(() => {
    getTripStages({ page: currentPage })
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Trip Stages</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getTripStages({ ...params, page: 1 })
            }}
          />
        </Col>
        <Col className="text-right">
          <Paginate
            {...otherProps}
            onChange={page => getTripStages({ ...params, page })}
          />
        </Col>
      </Grid>
      <Listable total={total} isFetching={isFetching}>
        <Table
          striped
          bordered
          headers={["Name", "Description"]}
          rows={tripStages.map(tripStage => [
            tripStage.name,
            tripStage.description,
          ])}
        />
      </Listable>
    </Fragment>
  )
}

export default connectWithList(List)

interface SelectTripStagesProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectTripStages = withXHR<SelectTripStagesProps>(
  function SelectTripStages({ xhr, ...otherProps }: SelectTripStagesProps) {
    return (
      <Async
        multiple
        {...otherProps}
        fetch={q =>
          XHR(xhr)
            .getTripStages({ q })
            .then(resp => resp.data)
        }
      />
    )
  }
)
