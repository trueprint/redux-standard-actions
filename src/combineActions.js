import isString from 'lodash.isstring'
import isFunction from 'lodash.isfunction'

export const ACTION_DELIMITER = '|fsa-type-delimiter|'

function isValidType(type) {
  return isString(type) || isFunction(type)
}

/**
 * Combine any number of FSA types or FSA creators for use by an FSA reducer.
 *
 * This method exists because while FSA type strings can be joined with an conventional
 * delimiter, there is no obvious way for a library user to combine FSA creators, as their type
 * is encapsulated.
 *
 * @param {...string|function} types positional arguments of string action types and/or action creators
 * @returns {string} the string representation of the combined types, which is only useful as parameters
 *                   in makeActionReducer and makeActionReducers
 */
export default function combineActions(...types) {
  if (types.length === 0 || !types.every(isValidType)) {
    throw new TypeError('Expected each argument to be a string action type or an action creator')
  }
  return types.map(type => type.toString()).join(ACTION_DELIMITER)
}
