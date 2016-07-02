import identity from 'lodash.identity'
import camelCase from 'lodash.camelcase'
import isPlainObject from 'lodash.isplainobject'
import reduce from 'lodash.reduce'
import isString from 'lodash.isstring'
import isFunction from 'lodash.isfunction'

import actionCreator from './action-creator'

function fromPlainObject(reducersByActions) {
  return reduce(reducersByActions, (actionCreatorsByAction, payloadCreator = identity, action) => {
    if (!isFunction(payloadCreator)) {
      throw new TypeError(`Got invalid payload creator for ${action}`)
    }
    return {
      ...actionCreatorsByAction,
      [camelCase(action)]: actionCreator(action, payloadCreator),
    }
  }, {})
}

function fromActionTypes(...actionTypes) {
  return fromPlainObject(
    actionTypes.reduce((actionsMap, action) => ({ ...actionsMap, [action]: undefined }), {})
  )
}

/**
 * Convenience function for creating multiple action creators. All arguments are optional.
 *
 * @param {object} actionsMap a plain object with action types as keys, and their payload creators as values.
 *                            undefined payload creators will be use the identity function as payload creator
 * @param {...string} actionTypes a variable number of string action types, which will use the default payload creator
 * @returns {object} a map of action creators keyed by action type
 */
export default function actionCreators(actionsMap, ...actionTypes) {
  if (actionTypes.every(isString)) {
    if (isString(actionsMap)) {
      return fromActionTypes(actionsMap, ...actionTypes)
    } else if (isPlainObject(actionsMap)) {
      return { ...fromPlainObject(actionsMap), ...fromActionTypes(...actionTypes) }
    }
  }
  throw new TypeError('Expected (optional) object followed by string action types')
}
