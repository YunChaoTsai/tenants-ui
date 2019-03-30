import { $PropertyType } from "utility-types"
export interface IBaseItem {
  id: number
}

export interface IBaseState<Item extends IBaseItem> {
  readonly items: number[]
  readonly byId: { [id: string]: Item }
}

export function init<Item extends IBaseItem>(items?: Item[]): IBaseState<Item> {
  const state: IBaseState<Item> = {
    items: [],
    byId: {},
  }
  return model<Item>(state).insert(items)
}

export function model<Item extends IBaseItem>(prevState?: IBaseState<Item>) {
  const state = prevState || init<Item>()
  return {
    insert(items?: Item[]): IBaseState<Item> {
      if (!items) return state
      return items.reduce((state: IBaseState<Item>, item) => {
        let { byId, items } = state
        if (!byId[item.id]) {
          items = items.concat(item.id)
        }
        byId[item.id] = item
        return { ...state, byId: { ...byId }, items: [...items] }
      }, state)
    },
    get(): Item[] {
      return state.items.map(id => state.byId[id])
    },
    getItem(id: string | number) {
      return state.byId[id]
    },
  }
}
