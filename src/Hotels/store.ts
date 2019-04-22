import { createAsyncAction, ActionType, getType } from "typesafe-actions"

import { IBaseItem, IBaseState, init, model } from "./../model"
import { store as mealPlanStore } from "./../MealPlans"
import { store as roomTypeStore } from "./../RoomTypes"
import { store as locationStore } from "./../Locations"
import { store as contactStore } from "./../Contacts"

export const key = "HOTEL_LIST_STATE"

export interface IPrice {
  id: number
  hotel_id: number
  base_price: number
  persons: number
  a_w_e_b: number
  c_w_e_b: number
  c_wo_e_b: number
  start_date: string
  end_date: string
  meal_plan_id: number
  room_type_id: number
  location_id: number
  meal_plan?: mealPlanStore.IMealPlan
  room_type?: roomTypeStore.IRoomType
  location?: locationStore.ILocation
}

export interface IHotel extends IBaseItem {
  id: number
  name: string
  eb_child_age_start: number
  eb_child_age_end: number
  meal_plans: mealPlanStore.IMealPlan[]
  room_types: roomTypeStore.IRoomType[]
  locations: locationStore.ILocation[]
  prices?: IPrice[]
  contacts?: contactStore.IContact[]
}

export interface IHotels extends IBaseState<IHotel> {}
export interface IPrices extends IBaseState<IPrice> {}

export interface IState {
  readonly isFetching: boolean
  readonly isFetchingPrices: boolean
  readonly hotels: IHotels
  readonly prices: IPrices
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
  prices: createAsyncAction(
    "@HOTEL_PRICES/LIST_FETCH_REQUEST",
    "@HOTEL_PRICES/LIST_FETCH_SUCCESS",
    "@HOTEL_PRICES/LIST_FETCH_FAILED"
  )<any, IPrice[], Error>(),
}

export type TActions = ActionType<typeof actions>

const INITIAL_STATE = {
  isFetching: true,
  isFetchingPrices: true,
  hotels: init<IHotel>(),
  prices: init<IPrice>(),
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
    case getType(actions.prices.request):
      return { ...state, isFetchingPrices: true }
    case getType(actions.prices.success):
      return {
        ...state,
        prices: model(state.prices).insert(action.payload),
        isFetchingPrices: false,
      }
    case getType(actions.prices.failure):
      return { ...state, isFetchingPrices: false }
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
    get isFetchingPrices(): boolean {
      return this.state.isFetchingPrices
    },
    getHotelPrices(id: number): IPrice[] {
      return model<IPrice>(this.state.prices)
        .get()
        .filter(price => price.hotel_id === id)
    },
  }
}
