import React, { useEffect, Fragment, useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { useSelector, useDispatch } from "react-redux"
import { Omit } from "utility-types"

import { ThunkAction, ThunkDispatch } from "./../types"
import { ICab, actions, IStateWithKey, selectors } from "./store"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import { Search, useSearch } from "./../Shared/Search"
import { List } from "./../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { Table, Paginate } from "@tourepedia/ui"
import { IPaginate } from "./../model"

export function XHR(xhr: AxiosInstance) {
  return {
    async getCabs(params?: any): Promise<{ data: ICab[]; meta: any }> {
      return xhr.get("/cabs", { params }).then(resp => resp.data)
    },
  }
}

export const getCabsAction = (
  params?: any
): ThunkAction<Promise<ICab[]>> => async (dispatch, _, { xhr }) => {
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

function useCabsState() {
  interface StateProps extends IPaginate {
    cabs: ICab[]
    isFetching: boolean
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const cabsSelector = selectors(state)
    return {
      ...cabsSelector.meta,
      isFetching: cabsSelector.isFetching,
      cabs: cabsSelector.get(),
    }
  })
}

function useCabsFetch() {
  const dispatch = useDispatch<ThunkDispatch>()
  return useCallback((params?: any) => dispatch(getCabsAction(params)), [
    dispatch,
  ])
}

export function useCabs() {
  return {
    ...useCabsState(),
    fetchCabs: useCabsFetch(),
  }
}

export default function Cabs(_: RouteComponentProps) {
  const {
    cabs,
    total,
    from,
    to,
    currentPage,
    lastPage,
    isFetching,
    fetchCabs: getCabs,
  } = useCabs()
  const [params, setParams] = useSearch()
  useEffect(() => {
    getCabs({ page: currentPage })
  }, [getCabs])
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
            total={total}
            from={from}
            to={to}
            currentPage={currentPage}
            lastPage={lastPage}
            isFetching={isFetching}
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
          .getCabs({ q })
          .then(resp => resp.data)
      }
      {...otherProps}
    />
  )
})
