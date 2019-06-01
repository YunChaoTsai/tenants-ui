import { createAsyncAction, ActionType } from "typesafe-actions"
import {
  IBaseItem,
  IBaseState,
  init,
  model,
  IModelState,
  IMeta,
  createReducer,
} from "./../model"

export const key = "HOTEL_BOOKING_STAGES_STATE"

export interface IHotelBookingStage extends IBaseItem {
  id: number
  name: string
  description: string
}

export interface IHotelBookingStages extends IBaseState<IHotelBookingStage> {}

export interface IState extends IModelState<IHotelBookingStage> {}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<IHotelBookingStage>(),
}

export const actions = {
  list: createAsyncAction(
    "@HOTEL_BOOKING_STAGES/LIST_FETCH_REQUEST",
    "@HOTEL_BOOKING_STAGES/LIST_FETCH_SUCCESS",
    "@HOTEL_BOOKING_STAGES/LIST_FETCH_FAILED"
  )<undefined, { data: IHotelBookingStage[]; meta: IMeta }, Error>(),
}

export type TActions = ActionType<typeof actions>

export const reducer = createReducer<IHotelBookingStage, IState>(
  INITIAL_STATE,
  actions as any
)

export function selectors<State extends IStateWithKey>(state: State) {
  const myState = state[key]
  return {
    ...model<IHotelBookingStage>(myState.state),
    get state(): IState {
      return myState
    },
    get isFetching(): boolean {
      return this.state.isFetching
    },
  }
}
