import { createAsyncAction, ActionType, getType } from "typesafe-actions"

import { IBaseItem, IBaseState, init, model } from "./../model"
import { store as mealPlanStore } from "./../MealPlans"
import { store as roomTypeStore } from "./../RoomTypes"
import { store as locationStore } from "./../Locations"

export const key = "HOTEL_LIST_STATE"

export interface IHotel extends IBaseItem {
  id: number
  name: string
  eb_child_age_start: number
  eb_child_age_end: number
  meal_plans: mealPlanStore.IMealPlan[]
  room_types: roomTypeStore.IRoomType[]
  locations: locationStore.ILocation[]
}

export interface IHotels extends IBaseState<IHotel> {}

export interface IState {
  readonly isFetching: boolean
  readonly hotels: IHotels
}

export interface IStateWithKey {
  readonly [key]: IState
}

export const actions = {
  list: createAsyncAction(
    "@HOTELS/LIST_FETCH_REQUEST",
    "@HOTELS/LIST_FETCH_SUCCESS",
    "@HOTELS/LIST_FETCH_FAILED"
  )<any, IHotel[], Error>(),
  item: createAsyncAction(
    "@HOTELS/ITEM_FETCH_REQUEST",
    "@HOTELS/ITEM_FETCH_SUCCESS",
    "@HOTELS/ITEM_FETCH_FAILED"
  )<any, IHotel, Error>(),
}

export type TActions = ActionType<typeof actions>

const INITIAL_STATE = {
  isFetching: true,
  hotels: init<IHotel>(),
}

export function reducer(
  state: IState = INITIAL_STATE,
  action: TActions
): IState {
  switch (action.type) {
    case getType(actions.list.request):
      return { ...state, isFetching: true }
    case getType(actions.list.success):
      return {
        ...state,
        hotels: model(state.hotels).insert(action.payload),
        isFetching: false,
      }
    case getType(actions.list.failure):
      return { ...state, isFetching: false }
    case getType(actions.item.request):
      return { ...state, isFetching: true }
    case getType(actions.item.success):
      return {
        ...state,
        hotels: model(state.hotels).insert([action.payload]),
        isFetching: false,
      }
    case getType(actions.item.failure):
      return { ...state, isFetching: false }
    default:
      return state
  }
}

export function selectors<State extends IStateWithKey>(state: State) {
  return {
    get state(): IState {
      return state[key]
    },
    get isFetching(): boolean {
      return this.state.isFetching
    },
    get hotels(): IHotel[] {
      return model<IHotel>(this.state.hotels).get()
    },
    getHotel(id?: string | number): IHotel | undefined {
      if (!id) return
      return model<IHotel>(this.state.hotels).getItem(id)
    },
  }
}
