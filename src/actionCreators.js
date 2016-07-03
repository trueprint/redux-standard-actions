import identity from 'lodash.identity'
import camelCase from 'lodash.camelcase'
import isPlainObject from 'lodash.isplainobject'
import reduce from 'lodash.reduce'
import isString from 'lodash.isstring'
import isFunction from 'lodash.isfunction'

import makeActionCreator from './actionCreator'

function fromActionsMap(actionsMap) {
  return reduce(actionsMap, (actionCreatorsMap, payloadCreator = identity, type) => {
    if (!isFunction(payloadCreator)) {
      throw new TypeError(`Expected function or undefined payload creator for ${type}`)
    }
    return { ...actionCreatorsMap, [camelCase(type)]: makeActionCreator(type, payloadCreator) }
  }, {})
}

function fromTypes(...types) {
  return fromActionsMap(
    types.reduce((actionsMap, action) => ({ ...actionsMap, [action]: undefined }), {})
  )
}

/**
 * Convenience function for creating multiple action creators. All arguments are optional.
 *
 * @param {object} actionsMap a map of action types to payload creators. undefined payload creators use the identity
 * @param {...string} types a variable number of string action types, which will use the default payload creator
 * @returns {object} a map of FSA creators keyed by camel-cased action type
 */
export default function makeActionCreators(actionsMap, ...types) {
  if (types.every(isString)) {
    if (isString(actionsMap)) {
      return fromTypes(actionsMap, ...types)
    } else if (isPlainObject(actionsMap)) {
      return { ...fromActionsMap(actionsMap), ...fromTypes(...types) }
    }
  }
  throw new TypeError('Expected (optional) object followed by string action types')
}
