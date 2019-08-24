import { getType, createAsyncAction, ActionType } from "typesafe-actions"

export interface IBaseItem {
  id: number
}

export interface IMeta {
  total: number
  from: number
  to: number
  current_page: number
  last_page: number
  path?: string
}

export interface IPaginate {
  total: number
  from: number
  to: number
  currentPage: number
  lastPage: number
  isFetching: boolean
}

export interface ILinks {
  first?: string
  last?: string
  prev?: string
  next?: string
}

export interface IBaseState<Item extends IBaseItem> {
  readonly items: number[]
  readonly byId: { [id: string]: Item }
  readonly meta: IMeta
  readonly links: ILinks
}

export function init<Item extends IBaseItem>(items?: Item[]): IBaseState<Item> {
  const state: IBaseState<Item> = {
    items: [],
    byId: {},
    meta: {
      from: 0,
      to: 0,
      total: 0,
      current_page: 1,
      last_page: 1,
    },
    links: {},
  }
  return model<Item>(state).insert(items)
}

export function model<Item extends IBaseItem>(prevState?: IBaseState<Item>) {
  const state = prevState || init<Item>()
  return {
    insert(items?: Item[], meta?: IMeta): IBaseState<Item> {
      if (!items) return state
      return items.reduce((state: IBaseState<Item>, item) => {
        let { byId, items, meta: stateMeta } = state
        if (!byId[item.id]) {
          items = items.concat(item.id)
        }
        byId[item.id] = item
        return {
          ...state,
          byId: { ...byId },
          items: [...items],
          meta: { ...stateMeta, ...(meta || {}) },
        }
      }, state)
    },
    get(): Item[] {
      return state.items.map(id => state.byId[id])
    },
    getItem(id?: string | number) {
      if (!id) return
      return state.byId[id]
    },
    getMeta(): IMeta {
      return state.meta
    },
    get total(): number {
      return this.getMeta().total || 0
    },
    get currentPage(): number {
      return this.getMeta().current_page || 1
    },
    get lastPage(): number {
      return this.getMeta().last_page || 1
    },
    get from(): number {
      return this.getMeta().from || 0
    },
    get to(): number {
      return this.getMeta().to || 0
    },
    get meta() {
      const total = this.total
      const lastPage = this.lastPage
      const currentPage = this.currentPage
      const from = this.from
      const to = this.to
      return { total, lastPage, currentPage, from, to }
    },
  }
}

export interface IModelState<IItem extends IBaseItem> {
  readonly state: IBaseState<IItem>
  readonly isFetching: boolean
}

export function createReducer<
  IItem extends IBaseItem,
  IState extends IModelState<IItem>
>(
  INITIAL_STATE: IState,
  actions: {
    list: ReturnType<ReturnType<typeof createAsyncAction>>
    item: ReturnType<ReturnType<typeof createAsyncAction>>
  },
  reducer?: (state: IState, action: ActionType<any>) => IState
) {
  return (state: IState = INITIAL_STATE, action: ActionType<any>): IState => {
    if (actions.list) {
      switch (action.type) {
        case getType(actions.list.request):
          return { ...state, isFetching: true }
        case getType(actions.list.success):
          return {
            ...state,
            state: model(init<IItem>()).insert(
              action.payload.data,
              action.payload.meta
            ),
            isFetching: false,
          }
        case getType(actions.list.failure):
          return { ...state, isFetching: false }
      }
    }
    if (actions.item) {
      switch (action.type) {
        case getType(actions.item.request):
          return { ...state, isFetching: true }
        case getType(actions.item.success):
          return {
            ...state,
            state: model(state.state).insert([action.payload]),
            isFetching: false,
          }
        case getType(actions.item.failure):
          return { ...state, isFetching: false }
      }
    }
    if (reducer) {
      return reducer(state, action)
    }
    return state
  }
}
