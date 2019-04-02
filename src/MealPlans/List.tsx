import React, { Fragment, useEffect, useState } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps, Link } from "@reach/router"
import { Omit } from "utility-types"

import { IMealPlan, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "./../Shared/Select"

export function XHR(xhr: AxiosInstance) {
  return {
    getMealPlans(params?: any): Promise<IMealPlan[]> {
      return xhr.get("/meal-plans").then(({ data }) => data.meal_plans)
    },
  }
}

export const getMealPlans = (
  params?: any
): ThunkAction<Promise<IMealPlan[]>> => (dispatch, getState, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getMealPlans(params)
    .then(mealPlans => {
      dispatch(actions.list.success(mealPlans))
      return mealPlans
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
  mealPlans: IMealPlan[]
}
interface DispatchProps {
  getMealPlans: (params?: any) => Promise<IMealPlan[]>
}
interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const mealPlansSelector = selectors(state)
    return {
      isFetching: mealPlansSelector.isFetching,
      mealPlans: mealPlansSelector.mealPlans,
    }
  },
  (dispatch: ThunkDispatch) => ({
    getMealPlans: (params?: any) => dispatch(getMealPlans(params)),
  })
)

interface ListProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}
function List({ getMealPlans, mealPlans, isFetching }: ListProps) {
  useEffect(() => {
    getMealPlans()
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Meal Plans</title>
      </Helmet>
      {!isFetching ? `Total: ${mealPlans.length}` : ""}
      <ul>
        {isFetching
          ? "Loading..."
          : mealPlans.map(mealPlan => (
              <li key={mealPlan.id}>
                {mealPlan.name} - {mealPlan.description}
                {/* <Link to={`${mealPlan.id.toString()}/edit`}>Edit</Link> */}
              </li>
            ))}
      </ul>
    </Fragment>
  )
}

export default connectWithList(List)

interface SelectMealPlanProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectMealPlans = withXHR<SelectMealPlanProps>(
  function SelectMealPlans({ xhr, ...otherProps }: SelectMealPlanProps) {
    return (
      <Async multiple {...otherProps} fetch={q => XHR(xhr).getMealPlans()} />
    )
  }
)
