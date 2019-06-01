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
import { store as transportServiceStore } from "./../TransportServices"
import { store as cabTypeStore } from "./../CabTypes"

export const key = "TRANSPORT_SERVICE_PRICES_STATE"

export interface ITransportServicePrice extends IBaseItem {
  id: number
  start_date: string
  end_date: string
  cab_type_id: number
  cab_type: cabTypeStore.ICabType
  transport_service_id: number
  transport_service: transportServiceStore.ITransportService
  price?: number
  per_km_charges?: number
  minimum_km_per_day?: number
  toll_charges: number
  parking_charges: number
  night_charges: number
}

export interface ITransportServicePrices
  extends IBaseState<ITransportServicePrice> {}

export interface IState extends IModelState<ITransportServicePrice> {}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<ITransportServicePrice>(),
}

export const actions = {
  list: createAsyncAction(
    "@TRANSPORT_SERVICE_PRICES/LIST_FETCH_REQUEST",
    "@TRANSPORT_SERVICE_PRICES/LIST_FETCH_SUCCESS",
    "@TRANSPORT_SERVICE_PRICES/LIST_FETCH_FAILED"
  )<undefined, { data: ITransportServicePrice[]; meta: IMeta }, Error>(),
}

export type TActions = ActionType<typeof actions>

export const reducer = createReducer<ITransportServicePrice, IState>(
  INITIAL_STATE,
  actions as any
)

export function selectors<State extends IStateWithKey>(state: State) {
  const myState = state[key]
  return {
    ...model<ITransportServicePrice>(myState.state),
    get state(): IState {
      return myState
    },
    get isFetching(): boolean {
      return this.state.isFetching
    },
  }
}
