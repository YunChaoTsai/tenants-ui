import { createAsyncAction, getType, ActionType } from "typesafe-actions"
import {
  IBaseItem,
  IBaseState,
  init,
  model,
  IMeta,
  IModelState,
  createReducer,
} from "./../model"
import { store as transportServiceStore } from "./../TransportServices"

export const key = "CAB_TYPES_STATE"

export interface ICabType extends IBaseItem {
  id: number
  name: string
  capacity: number
}

export interface ICabPrice {
  id: number
  start_date: string
  end_date: string
  cab_type_id: number
  cab_type: ICabType
  transport_service_id: number
  transport_service: transportServiceStore.ITransportService
  price?: number
  per_km_charges?: number
  minimum_km_per_day?: number
  toll_charges: number
  parking_charges: number
  night_charges: number
}

export interface ICabTypes extends IBaseState<ICabType> {}

export interface IState extends IModelState<ICabType> {}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<ICabType>(),
}

export const actions = {
  list: createAsyncAction(
    "@CAB_TYPES/LIST_FETCH_REQUEST",
    "@CAB_TYPES/LIST_FETCH_SUCCESS",
    "@CAB_TYPES/LIST_FETCH_FAILED"
  )<any, { data: ICabType[]; meta: IMeta }, Error>(),
}

export type TActions = ActionType<typeof actions>

export const reducer = createReducer<ICabType, IState>(
  INITIAL_STATE,
  actions as any
)

export function selectors<State extends IStateWithKey>(state: State) {
  const myState = state[key]
  return {
    ...model<ICabType>(myState.state),
    get state(): IState {
      return myState
    },
    get isFetching(): boolean {
      return this.state.isFetching
    },
  }
}
