import { createAsyncAction, getType, ActionType } from "typesafe-actions"
import { IBaseItem, IBaseState, init, model } from "./../model"

export const key = "TRIP_SOURCES_STATE"

export interface ITripSource extends IBaseItem {
  id: number
  name: string
  short_name: string
}

export interface ITripSources extends IBaseState<ITripSource> {}

export interface IState {
  readonly isFetching: boolean
  readonly tripSources: ITripSources
}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  tripSources: init<ITripSource>(),
}

export const actions = {
  list: createAsyncAction(
    "@TRIP_SOURCES/LIST_FETCH_REQUEST",
    "@TRIP_SOURCES/LIST_FETCH_SUCCESS",
    "@TRIP_SOURCES/LIST_FETCH_FAILED"
  )<any, ITripSource[], Error>(),
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
        tripSources: model(state.tripSources).insert(action.payload),
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
    get tripSources(): ITripSource[] {
      return model<ITripSource>(this.state.tripSources).get()
    },
    getTripSource(id?: string | number): ITripSource | undefined {
      if (!id) return
      return model<ITripSource>(this.state.tripSources).getItem(id)
    },
  }
}
