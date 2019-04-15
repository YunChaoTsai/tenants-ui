import { createAsyncAction, getType, ActionType } from "typesafe-actions"

import { IBaseItem, IBaseState, model, init } from "./../model"
import { store as locationStore } from "./../Locations"
import { store as tripSourceStore } from "./../TripSources"
import { store as hotelStore } from "./../Hotels"
import { store as roomTypeStore } from "./../RoomTypes"
import { store as mealPlanStore } from "./../MealPlans"
import { store as cabTypeStore } from "./../CabTypes"
import { store as userStore } from "./../Users"

export const key = "TRIP_LIST_STATE"

export interface IQuoteHotel {
  id: number
  quote_id: number
  date: string
  hotel_id: number
  hotel: hotelStore.IHotel
  location_id: number
  location: locationStore.ILocation
  meal_plan_id: number
  meal_plan: mealPlanStore.IMealPlan
  room_type_id: number
  room_type: roomTypeStore.IRoomType
  a_w_e_b: number
  c_w_e_b: number
  c_wo_e_b: number
  no_of_rooms: number
  calculated_price?: number
  given_price: number
  comments: string
}
export interface IQuoteCab {
  id: number
  quote_id: number
  date: string
  cab_type_id: number
  cab_type: cabTypeStore.ICabType
  location_service_id: number
  location_service: locationStore.IService
  no_of_cabs: number
  calculated_price?: number
  given_price: number
  comments: string
}
export interface IQuote {
  id: number
  trip_id: number
  total_price: number
  given_price: number
  comments?: string
  hotels: IQuoteHotel[]
  cabs: IQuoteCab[]
  created_by: userStore.IUser
  updated_by: userStore.IUser
}

export interface IGivenQuote {
  id: number
  quote_id: number
  quote: IQuote
  given_price: number
  comments?: string
  created_by: userStore.IUser
}

export interface ITrip extends IBaseItem {
  id: number
  start_date: string
  end_date: string
  locations: locationStore.ILocation[]
  trip_source: tripSourceStore.ITripSource
  trip_id: string
  no_of_adults: number
  children?: string
  created_at: string
  updated_at: string
  quotes: IQuote[]
}

export interface ITrips extends IBaseState<ITrip> {}

export interface IState {
  readonly isFetching: boolean
  readonly trips: ITrips
}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  trips: init<ITrip>(),
}

export const actions = {
  list: createAsyncAction(
    "@TRIPS/LIST_FETCH_REQUEST",
    "@TRIPS/LIST_FETCH_SUCCESS",
    "@TRIPS/LIST_FETCH_FAILED"
  )<any, ITrip[], Error>(),
  item: createAsyncAction(
    "@TRIPS/ITEM_FETCH_REQUEST",
    "@TRIPS/ITEM_FETCH_SUCCESS",
    "@TRIPS/ITEM_FETCH_FAILED"
  )<any, ITrip, Error>(),
}

export type TActions = ActionType<typeof actions>

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
        trips: model(state.trips).insert(action.payload),
        isFetching: false,
      }
    case getType(actions.list.failure):
      return { ...state, isFetching: false }
    case getType(actions.item.request):
      return { ...state, isFetching: true }
    case getType(actions.item.success):
      return {
        ...state,
        trips: model(state.trips).insert([action.payload]),
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
    get trips(): ITrip[] {
      return model<ITrip>(this.state.trips).get()
    },
    getTrip(id?: string | number): ITrip | undefined {
      if (!id) return
      return model<ITrip>(this.state.trips).getItem(id)
    },
  }
}
