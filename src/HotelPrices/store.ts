import { createAsyncAction, ActionType } from "typesafe-actions"
import {
  IBaseItem,
  IBaseState,
  init,
  model,
  IMeta,
  IModelState,
  createReducer,
} from "./../model"
import { store as mealPlanStore } from "./../MealPlans"
import { store as roomTypeStore } from "./../RoomTypes"
import { store as hotelStore } from "./../Hotels"

export const key = "HOTEL_PRICES_STATE"

export interface IHotelPrice extends IBaseItem {
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
  hotel: hotelStore.IHotel
  meal_plan: mealPlanStore.IMealPlan
  room_type: roomTypeStore.IRoomType
}

export interface IHotelPrices extends IBaseState<IHotelPrice> {}

export interface IState extends IModelState<IHotelPrice> {}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<IHotelPrice>(),
}

export const actions = {
  list: createAsyncAction(
    "@HOTEL_PRICES/LIST_FETCH_REQUEST",
    "@HOTEL_PRICES/LIST_FETCH_SUCCESS",
    "@HOTEL_PRICES/LIST_FETCH_FAILED"
  )<undefined, { data: IHotelPrice[]; meta: IMeta }, Error>(),
}

export type TActions = ActionType<typeof actions>

export const reducer = createReducer<IHotelPrice, IState>(
  INITIAL_STATE,
  actions as any
)
export function selectors<State extends IStateWithKey>(state: State) {
  const myState = state[key]
  return {
    ...model<IHotelPrice>(myState.state),
    get state(): IState {
      return myState
    },
    get isFetching(): boolean {
      return this.state.isFetching
    },
  }
}
