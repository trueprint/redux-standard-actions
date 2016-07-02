redux-standard-actions
======================

[![Build Status](https://travis-ci.org/yangmillstheory/redux-standard-actions.svg?branch=master)](https://travis-ci.org/yangmillstheory/redux-standard-actions)
[![npm version](https://img.shields.io/npm/v/redux-standard-actions.svg?style=shield)](https://www.npmjs.com/package/redux-standard-actions)

[Flux Standard Action](https://github.com/acdlite/flux-standard-action) utilities for Redux.

```js
npm install --save redux-actions
```
```js
import { createAction, handleAction, handleActions } from 'redux-actions';
```

### `createAction(type, payloadCreator = Identity, ?metaCreator)`

Wraps an action creator so that its return value is the payload of a Flux Standard Action. If no payload creator is passed, or if it's not a function, the identity function is used.

Example:

```js
let increment = createAction('INCREMENT', amount => amount);
// same as
increment = createAction('INCREMENT');

expect(increment(42)).to.deep.equal({
  type: 'INCREMENT',
  payload: 42
});
```

If the payload is an instance of an [Error
object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error),
redux-actions will automatically set ```action.error``` to true.

Example:

```js
const increment = createAction('INCREMENT');

const error = new TypeError('not a number');
expect(increment(error)).to.deep.equal({
  type: 'INCREMENT',
  payload: error,
  error: true
});
```

`createAction` also returns its `type` when used as type in `handleAction` or `handleActions`.

Example:

```js
const increment = createAction('INCREMENT');

// As parameter in handleAction:
handleAction(increment, {
  next(state, action) {...},
  throw(state, action) {...}
});

// As object key in handleActions:
const reducer = handleActions({
  [increment]: (state, action) => ({
    counter: state.counter + action.payload
  })
}, { counter: 0 });
```

**NOTE:** The more correct name for this function is probably `createActionCreator()`, but that seems a bit redundant.

Use the identity form to create one-off actions:

```js
createAction('ADD_TODO')('Use Redux');
```

`metaCreator` is an optional function that creates metadata for the payload. It receives the same arguments as the payload creator, but its result becomes the meta field of the resulting action. If `metaCreator` is undefined or not a function, the meta field is omitted.

### `createActions(?actionsObject, ?...actionTypes)`

`actionsObject` should be an object with action types as keys, and payload creators as values. `undefined` payload creators will be defaulted to the identity. Trailing arguments are string action types with default payload creator. 

`actionTypes` is an array of action types, and is treated as `actionsObject` with no specified payload creators.
 
There's currently no support for specifying any `metaCreator` with this syntax.

Example:

```js
const { actionOne, actionTwo, actionThree } = createActions({
  ACTION_ONE(key, value) {
    return { [key]: value };
  },
  ACTION_TWO(first, second) {
    return [ first, second ];
  },
}, 'ACTION_THREE');

expect(actionOne('key', 1)).to.deep.equal({
  type: 'ACTION_ONE',
  payload: { key: 1 }
});

expect(actionTwo('first', 'second')).to.deep.equal({
  type: 'ACTION_TWO',
  payload: ['first', 'second'],
});

expect(actionThree(3)).to.deep.equal({
  type: 'ACTION_THREE',
  payload: 3,
});
```


### `handleAction(type, reducer | reducerMap, ?defaultState)`

Wraps a reducer so that it only handles Flux Standard Actions of a certain type.

If a single reducer is passed, it is used to handle both normal actions and failed actions. (A failed action is analogous to a rejected promise.) You can use this form if you know a certain type of action will never fail, like the increment example above.

Otherwise, you can specify separate reducers for `next()` and `throw()`. These values can only be functions or null-equivalents. 

This API is inspired by the ES6 generator interface.

```js
handleAction('FETCH_DATA', {
  next(state, action) {...},
  throw(state, action) {...}
});
```

If `undefined` or `null` is passed in either the single reducer form, or as the values of `next` or `throw` in the map form, an error is thrown.  

The optional third parameter specifies a default or initial state, which is used when `undefined` is passed to the reducer.

### `handleActions(reducerMap, ?defaultState)`

Creates multiple reducers using `handleAction()` and combines them into a single reducer that handles multiple actions. Accepts a map where the keys are passed as the first parameter to `handleAction()` (the action type), and the values are passed as the second parameter (either a reducer or reducer map).

The optional second parameter specifies a default or initial state, which is used when `undefined` is passed to the reducer.

(Internally, `handleActions()` works by applying multiple reducers in sequence using [reduce-reducers](https://github.com/acdlite/reduce-reducers).)

Example:

```js
const reducer = handleActions({
  INCREMENT: (state, action) => ({
    counter: state.counter + action.payload
  }),

  DECREMENT: (state, action) => ({
    counter: state.counter - action.payload
  })
}, { counter: 0 });
```

## Usage with middleware

redux-actions is handy all by itself, however, its real power comes when you combine it with middleware.

The identity form of `createAction` is a great way to create a single action creator that handles multiple payload types. For example, using [redux-promise](https://github.com/acdlite/redux-promise) and [redux-rx](https://github.com/acdlite/redux-rx):

```js
const addTodo = createAction('ADD_TODO');

// A single reducer...
handleAction('ADD_TODO', (state = { todos: [] }, action) => ({
  ...state,
  todos: [...state.todos, action.payload]
}));

// ...that works with all of these forms:
// (Don't forget to use `bindActionCreators()` or equivalent.
// I've left that bit out)
addTodo('Use Redux')
addTodo(Promise.resolve('Weep with joy'));
addTodo(Observable.of(
  'Learn about middleware',
  'Learn about higher-order stores'
)).subscribe();
```

## See also

Use redux-actions in combination with FSA-compliant libraries.

- [redux-promise](https://github.com/acdlite/redux-promise) - Promise middleware
- [redux-rx](https://github.com/acdlite/redux-rx) - Includes observable middleware.
