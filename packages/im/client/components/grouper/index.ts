export interface Resolver<T> {
  readonly name: string
  readonly filter?: (self: Resolver<T>, data: T) => boolean
  readonly options?: {
    unique?: boolean
    byName?: boolean
  }
}

export interface Group<T> {
  name: string
  data: T[]
}

export function filterByGroupAttr<T extends { group: string }>(self: Resolver<T>, data: T) {
  return data.group === self.name
}

class Grouper<T> {
  constructor(private _data: T[], private _groupers: Resolver<T>[]) {}

  createGroup(...groups: Resolver<T>[]) {
    this._groupers.push(...groups)
  }

  resolve(): Group<T>[] {
    const result = [] as Group<T>[]
    let data = [...this._data]

    for (let i = 0; i < this._groupers.length; i++) {
      const grouper = this._groupers[i]
      let grouped: Group<T> = {
        name: this._groupers[i].name,
        data: [],
      }

      for (let j = 0; j < this._data.length; j++) {
        if (grouper.filter && grouper.filter(grouper, data[j])) {
          grouped.data.push(data[j])
          grouper.options?.unique && data.slice(j, 1)
        }
      }

      if (grouped.data.length > 0 && grouped.name) {
        result.push(grouped)
      }
    }
    return result
  }
}

export default Grouper
