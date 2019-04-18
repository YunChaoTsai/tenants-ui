import { createAsyncAction, getType, ActionType } from "typesafe-actions"
import { IBaseItem, IBaseState, init, model } from "./../model"

export const key = "TRIP_STAGES_STATE"

export interface ITripStage extends IBaseItem {
  id: number
  name: string
  description: string
}

export interface ITripStages extends IBaseState<ITripStage> {}

export interface IState {
  readonly isFetching: boolean
  readonly tripStages: ITripStages
}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  tripStages: init<ITripStage>(),
}

export const actions = {
  list: createAsyncAction(
    "@TRIP_STAGES/LIST_FETCH_REQUEST",
    "@TRIP_STAGES/LIST_FETCH_SUCCESS",
    "@TRIP_STAGES/LIST_FETCH_FAILED"
  )<any, ITripStage[], Error>(),
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
        tripStages: model(state.tripStages).insert(action.payload),
        isFetching: false,
      }
    case getType(actions.list.failure):
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
    get tripStages(): ITripStage[] {
      return model<ITripStage>(this.state.tripStages).get()
    },
    getTripStage(id?: string | number): ITripStage | undefined {
      if (!id) return
      return model<ITripStage>(this.state.tripStages).getItem(id)
    },
  }
}
