import { createAsyncAction, ActionType } from "typesafe-actions"

import {
  IBaseItem,
  IBaseState,
  model,
  init,
  IMeta,
  IModelState,
  createReducer,
} from "./../model"
import { store as locationStore } from "./../Locations"
import { store as transportServiceStore } from "./../TransportServices"
import { store as transportLocationStore } from "./../TransportLocations"
import { store as tripSourceStore } from "./../TripSources"
import { store as hotelStore } from "./../Hotels"
import { store as cabTypeStore } from "./../CabTypes"
import { store as userStore } from "./../Users"
import { store as contactStore } from "./../Contacts"
import { store as tripStageStore } from "./../TripStages"
import { store as paymentStore } from "./../Payments"
import { store as hotelBookingStageStore } from "./../HotelBookingStages"
import { store as tagStore } from "./../Tags"
import { store as extraServiceStore } from "./../ExtraServices"
import { store as activityLogStore } from "./../ActivityLogs"

export const key = "TRIP_LIST_STATE"

export interface IQuoteHotel {
  id: number
  quote_id: number
  checkin: string
  checkout: string
  hotel_id: number
  hotel: hotelStore.IHotel
  meal_plan_id: number
  meal_plan: hotelStore.IHotelMealPlan
  room_type_id: number
  room_type: hotelStore.IHotelRoomType
  adults_with_extra_bed: number
  children_with_extra_bed: number
  children_without_extra_bed: number
  no_of_rooms: number
  calculated_price?: number
  given_price: number
  comments: string
  booking_stages: hotelBookingStageStore.IHotelBookingStage[]
  latest_booking_stage?: hotelBookingStageStore.IHotelBookingStage
}
export interface IQuoteCab {
  id: number
  quote_id: number
  from_date: string
  to_date: string
  cab_type_id: number
  cab_type: cabTypeStore.ICabType
  transport_service_id: number
  transport_service: transportServiceStore.ITransportService
  cab_locality?: transportLocationStore.ITransportLocation
  no_of_cabs: number
  calculated_price?: number
  given_price: number
  comments: string
}

export interface IQuoteHotelExtras {
  id: number
  service: extraServiceStore.IExtraService
  date?: string
  calculated_price?: number
  given_price?: number
  hotel?: hotelStore.IHotel
  comments: string
}

export interface IQuoteTransportExtras {
  id: number
  service: extraServiceStore.IExtraService
  date?: string
  calculated_price?: number
  given_price?: number
  comments: string
}

export interface IQuoteOtherExtras {
  id: number
  service: extraServiceStore.IExtraService
  date?: string
  calculated_price?: number
  given_price?: number
  comments: string
}

export interface IQuote {
  id: number
  trip_id: number
  total_price: number
  given_price: number
  comments: string
  hotels: IQuoteHotel[]
  cabs: IQuoteCab[]
  hotel_extras: IQuoteHotelExtras[]
  transport_extras: IQuoteTransportExtras[]
  other_extras: IQuoteTransportExtras[]
  created_by: userStore.IUser
  updated_by: userStore.IUser
  created_at: string
}

export interface IGivenQuote {
  id: number
  quote_id: number
  quote: IQuote
  given_price: number
  comments?: string
  created_by: userStore.IUser
  created_at: string
  locations: Array<locationStore.ILocation>
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
  latest_given_quote?: IGivenQuote
  given_quotes?: IGivenQuote[]
  contacts: contactStore.IContact[]
  contact: contactStore.IContact
  stages: tripStageStore.ITripStage[]
  latest_stage?: tripStageStore.ITripStage
  converted_at?: string
  customer_payments?: paymentStore.IPayment<ITrip>[]
  hotel_payments?: paymentStore.IPayment<IQuoteHotel>[]
  cab_payments?: paymentStore.IPayment<IQuoteCab>[]
  tags?: Array<tagStore.ITag>
  created_by: userStore.IUser
  activity_logs?: Array<activityLogStore.IActivityLog>
  sales_team?: Array<userStore.IUser>
  operations_team?: Array<userStore.IUser>
}

export interface ITrips extends IBaseState<ITrip> {}

export interface IState extends IModelState<ITrip> {}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<ITrip>(),
}

export const actions = {
  list: createAsyncAction(
    "@TRIPS/LIST_FETCH_REQUEST",
    "@TRIPS/LIST_FETCH_SUCCESS",
    "@TRIPS/LIST_FETCH_FAILED"
  )<undefined, { data: ITrip[]; meta: IMeta }, Error>(),
  item: createAsyncAction(
    "@TRIPS/ITEM_FETCH_REQUEST",
    "@TRIPS/ITEM_FETCH_SUCCESS",
    "@TRIPS/ITEM_FETCH_FAILED"
  )<undefined, ITrip, Error>(),
}

export type TActions = ActionType<typeof actions>

export const reducer = createReducer(INITIAL_STATE, actions as any)

export function selectors<State extends IStateWithKey>(state: State) {
  const myState = state[key]
  return {
    ...model(myState.state),
    get state(): IState {
      return myState
    },
    get isFetching(): boolean {
      return this.state.isFetching
    },
  }
}
