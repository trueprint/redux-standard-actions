import identity from 'lodash.identity'
import camelCase from 'lodash.camelcase'
import isPlainObject from 'lodash.isplainobject'
import reduce from 'lodash.reduce'
import isString from 'lodash.isstring'

import createAction from './createAction'
import { isPayloadCreator } from './apiUtils'

function fromPlainObject(reducersByActions) {
  return reduce(reducersByActions, (actionCreatorsByAction, payloadCreator = identity, action) => {
    if (!isPayloadCreator(payloadCreator)) {
      throw new TypeError(`Got invalid payload creator for ${action}`)
    }
    return {
      ...actionCreatorsByAction,
      [camelCase(action)]: createAction(action, payloadCreator),
    }
  }, {})
}

function fromActionTypes(...actionTypes) {
  return fromPlainObject(
    actionTypes.reduce((reducersByAction, action) => ({ ...reducersByAction, [action]: undefined }), {})
  )
}

export default function createActions(actionsMap, ...actionTypes) {
  if (actionTypes.every(isString)) {
    if (isString(actionsMap)) {
      return fromActionTypes(actionsMap, ...actionTypes)
    } else if (isPlainObject(actionsMap)) {
      return { ...fromPlainObject(actionsMap), ...fromActionTypes(...actionTypes) }
    }
  }
  throw new TypeError('Expected (optional) object followed by string action types')
}
