import identity from 'lodash.identity'
import isFunction from 'lodash.isfunction'

export default function makeActionCreator(type, payloadCreator = identity, metaCreator) {
  if (!isFunction(payloadCreator)) {
    throw new TypeError(`Expected payloadCreator to be a function, got ${typeof payloadCreator}`)
  }

  const actionCreator = (...args) => {
    const hasError = args[0] instanceof Error
    const action = { type }
    const payload = hasError ? args[0] : payloadCreator(...args)

    if (payload !== undefined) {
      action.payload = payload
    }
    if (hasError) {
      action.error = true
    }
    if (isFunction(metaCreator)) {
      action.meta = metaCreator(...args)
    }

    return action
  }

  actionCreator.toString = () => type

  return actionCreator
}

