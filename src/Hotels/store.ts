import { createAsyncAction, ActionType } from "typesafe-actions"
import { combineReducers } from "redux"

import {
  IBaseItem,
  IBaseState,
  init,
  model,
  createReducer,
  IModelState,
  IMeta,
} from "./../model"
import { store as mealPlanStore } from "./../MealPlans"
import { store as roomTypeStore } from "./../RoomTypes"
import { store as locationStore } from "./../Locations"
import { store as contactStore } from "./../Contacts"
import { store as hotelPaymentPreferenceStore } from "./../HotelPaymentPreferences"

export const key = "HOTEL_LIST_STATE"

export interface IPrice {
  id: number
  hotel_id: number
  base_price: number
  persons: number
  adult_with_extra_bed_price: number
  child_with_extra_bed_price: number
  child_without_extra_bed_price: number
  start_date: string
  end_date: string
  meal_plan_id: number
  room_type_id: number
  meal_plan: mealPlanStore.IMealPlan
  room_type: roomTypeStore.IRoomType
}

export interface IHotelRoomType extends roomTypeStore.IRoomType {
  allowed_extra_beds: number
}
export interface IHotelMealPlan extends mealPlanStore.IMealPlan {}

export interface IHotelLocation extends locationStore.ILocation {}

export interface IHotel extends IBaseItem {
  id: number
  name: string
  stars: number
  extra_bed_child_age_start: number
  extra_bed_child_age_end: number
  meal_plans: IHotelMealPlan[]
  room_types: IHotelRoomType[]
  location: IHotelLocation
  prices?: IPrice[]
  contacts?: contactStore.IContact[]
  payment_preference?: hotelPaymentPreferenceStore.IHotelPaymentPreference
}

export interface IHotels extends IBaseState<IHotel> {}
export interface IPrices extends IBaseState<IPrice> {}

export interface IHotelState extends IModelState<IHotel> {}
export interface IHotelPriceState extends IModelState<IPrice> {}

export interface IState {
  hotels: IHotelState
  prices: IHotelPriceState
}

export interface IStateWithKey {
  readonly [key]: IState
}

export const hotelActions = {
  list: createAsyncAction(
    "@HOTELS/LIST_FETCH_REQUEST",
    "@HOTELS/LIST_FETCH_SUCCESS",
    "@HOTELS/LIST_FETCH_FAILED"
  )<undefined, { data: IHotel[]; meta: IMeta }, Error>(),
  item: createAsyncAction(
    "@HOTELS/ITEM_FETCH_REQUEST",
    "@HOTELS/ITEM_FETCH_SUCCESS",
    "@HOTELS/ITEM_FETCH_FAILED"
  )<undefined, IHotel, Error>(),
}
export const priceActions = {
  list: createAsyncAction(
    "@HOTEL_PRICES/LIST_FETCH_REQUEST",
    "@HOTEL_PRICES/LIST_FETCH_SUCCESS",
    "@HOTEL_PRICES/LIST_FETCH_FAILED"
  )<undefined, { data: IPrice[]; meta: IMeta }, Error>(),
}

export const actions = {
  hotels: hotelActions,
  prices: priceActions,
}

export type TActions = ActionType<typeof actions>

const INITIAL_STATE: IState = {
  hotels: {
    isFetching: true,
    state: init<IHotel>(),
  },
  prices: {
    isFetching: true,
    state: init<IPrice>(),
  },
}

export const reducer = combineReducers({
  hotels: createReducer(INITIAL_STATE.hotels, actions.hotels as any),
  prices: createReducer(INITIAL_STATE.prices, actions.prices as any),
})

export function selectors<State extends IStateWithKey>(state: State) {
  const myState = state[key]
  const hotelState = myState.hotels
  const priceState = myState.prices
  return {
    hotels: {
      ...model(hotelState.state),
      get state() {
        return hotelState
      },
      get isFetching(): boolean {
        return this.state.isFetching
      },
    },
    prices: {
      ...model(priceState.state),
      get state() {
        return priceState
      },
      get isFetching(): boolean {
        return this.state.isFetching
      },
    },
    getHotelPrices(id: number): IPrice[] {
      return model(priceState.state)
        .get()
        .filter(price => price.hotel_id === id)
    },
  }
}
