import identity from 'lodash.identity'
import camelCase from 'lodash.camelcase'
import isPlainObject from 'lodash.isplainobject'
import reduce from 'lodash.reduce'
import isString from 'lodash.isstring'
import isFunction from 'lodash.isfunction'

import makeActionCreator from './actionCreator'

function fromPlainObject(actionsMap) {
  return reduce(actionsMap, (actionCreatorsMap, payloadCreator = identity, action) => {
    if (!isFunction(payloadCreator)) {
      throw new TypeError(`Got invalid payload creator for ${action}`)
    }
    return {
      ...actionCreatorsMap,
      [camelCase(action)]: makeActionCreator(action, payloadCreator),
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
 * @param {object} actionsMap a map of action types to payload creators. undefined payload creators use the identity
 * @param {...string} actionTypes a variable number of string action types, which will use the default payload creator
 * @returns {object} a map of FSA creators keyed by action type
 */
export default function makeActionCreators(actionsMap, ...actionTypes) {
  if (actionTypes.every(isString)) {
    if (isString(actionsMap)) {
      return fromActionTypes(actionsMap, ...actionTypes)
    } else if (isPlainObject(actionsMap)) {
      return { ...fromPlainObject(actionsMap), ...fromActionTypes(...actionTypes) }
    }
  }
  throw new TypeError('Expected (optional) object followed by string action types')
}
