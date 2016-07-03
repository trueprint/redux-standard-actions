import identity from 'lodash.identity'
import isFunction from 'lodash.isfunction'

/**
 * Return an action creator that creates Flux Standard Actions of a given type.
 *
 * @param {string} type the action type; usually an upper-case and snake-case string
 * @param {function} payloadCreator the function that will be used to build the payload of the FSA;
 *                                  can have any signature, since this is for your own use. if undefined
 *                                  the identity is used
 * @param {function} metaCreator the optional function to use to build meta value of the FSA; called with
 *                               arguments as the action creator
 * @returns {function} the FSA creator for the specified action type
 */
export default function makeActionCreator(type, payloadCreator = identity, metaCreator) {
  if (!isFunction(payloadCreator)) {
    throw new TypeError(`Expected payloadCreator to be a function or undefined, got ${typeof payloadCreator}`)
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

