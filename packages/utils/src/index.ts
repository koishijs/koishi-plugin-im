import { Schema } from 'cordis'

export { v4 as genId } from 'uuid'

const _patterns = {
  name: Schema.string().pattern(/^[a-zA-Z0-9_]{1,16}$/),
  nick: Schema.string().pattern(/^[^<>?/*'"\\]{1,16}$/),
  password: Schema.string().pattern(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\W_]).{8,16}$/),
}

export function validate(type: keyof typeof _patterns, value: string): boolean {
  try {
    _patterns[type](value)
  } catch (e) {
    return false
  }
  return true
}

export function v1Wrapper<T extends Object, R>(
  callback: (...args: any[]) => Promise<R>
): (data: T) => Promise<R> {
  return async function (data: T) {
    return callback(...Object.values(data))
  }
}
