import isString from 'lodash.isstring'
import isFunction from 'lodash.isfunction'

export const FSA_TYPE_DELIMITER = '|fsa-type-delimiter|'

/**
 * Combine any number of FSA types or FSA creators for use by an FSA reducer.
 *
 * This method exists because while FSA type strings can be joined with a conventional
 * delimiter, there is no obvious way for a library user to combine FSA creators, as their type
 * is encapsulated.
 *
 * @param {...string|function} types positional arguments of string action types and/or action creators
 * @returns {object} an object which carries a toString() representation of the combined actions;
 *                   only useful as parameters in makeActionReducer and makeActionReducers
 */
export default function combineActions(...types) {
  if (types.length === 0 || !types.every(isValidType)) {
    throw new TypeError('Expected each argument to be a string action type or an action creator')
  }
  return Object.create(null, combinedActionsDescriptor(types.map(type => type.toString()).join(FSA_TYPE_DELIMITER)))
}

function isValidType(type) {
  return isString(type) || isFunction(type)
}

function combinedActionsDescriptor(toStringValue) {
  return {
    toString: { enumerable: true, writable: false, configurable: false, value: () => toStringValue },
  }
}
