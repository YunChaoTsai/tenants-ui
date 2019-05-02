import { createAsyncAction, getType, ActionType } from "typesafe-actions"
import {
  IBaseItem,
  IBaseState,
  init,
  model,
  IModelState,
  IMeta,
  createReducer,
} from "./../model"

export const key = "HOTEL_PAYMENT_PREFERENCES_STATE"

export interface IHotelPaymentPreferenceBreakdown {
  id: number
  reference_name: string
  day_offset: number
  amount_share: number
  name: string
}

export interface IHotelPaymentPreference extends IBaseItem {
  id: number
  name: string
  breakdowns: IHotelPaymentPreferenceBreakdown[]
}

export interface IHotelPaymentPreferences
  extends IBaseState<IHotelPaymentPreference> {}

export interface IState extends IModelState<IHotelPaymentPreference> {}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<IHotelPaymentPreference>(),
}

export const actions = {
  list: createAsyncAction(
    "@HOTEL_PAYMENT_PREFERENCES/LIST_FETCH_REQUEST",
    "@HOTEL_PAYMENT_PREFERENCES/LIST_FETCH_SUCCESS",
    "@HOTEL_PAYMENT_PREFERENCES/LIST_FETCH_FAILED"
  )<any, { data: IHotelPaymentPreference[]; meta: IMeta }, Error>(),
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
