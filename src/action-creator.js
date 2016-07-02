import identity from 'lodash.identity'
import isFunction from 'lodash.isfunction'

export default function actionCreator(type, payloadCreator = identity, metaCreator) {
  if (!isFunction(payloadCreator)) {
    throw new TypeError(`Expected payloadCreator to be a function, got ${typeof payloadCreator}`)
  }

  const actionHandler = (...args) => {
    const hasError = args[0] instanceof Error

    const action = { type }

    const payload = hasError ? args[0] : payloadCreator(...args)
    if (!(payload === null || payload === undefined)) {
      action.payload = payload
    }

    if (hasError) {
      // Handle FSA errors where the payload is an Error object. Set error.
      action.error = true
    }

    if (typeof metaCreator === 'function') {
      action.meta = metaCreator(...args)
    }

    return action
  }

  actionHandler.toString = () => type

  return actionHandler
}
