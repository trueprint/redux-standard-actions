import { makeActionReducer, makeActionCreator, combineActions } from '../'

describe('makeActionReducer', () => {
  const type = 'TYPE'
  const prevState = { counter: 3 }

  describe('unified reducer form', () => {
    it('should return previous state if type does not match', () => {
      const reducer = makeActionReducer('NOT_TYPE')
      expect(reducer(prevState, { type })).to.equal(prevState)
    })

    it('should use the identity if given an undefined reducer', () => {
      const reducer = makeActionReducer(type)
      expect(reducer(prevState, { type })).to.equal(prevState)
    })

    it('should throw an error when type is undefined', () => {
      expect(
        () => makeActionReducer(undefined, state => state)
      ).to.throw(TypeError, 'Expected type to not be undefined')
    })

    it('should throw an error when the reducer has the wrong shape', () => {
      for (const badReducer of [ 1, { throw: 1 }, [], 'string' ]) {
        expect(
          () => makeActionReducer(type, badReducer)
        ).to.throw(TypeError, 'Use a function, undefined, or object with next/throw reducers for reducer argument')
      }
    })

    it('should return the default state if the type does not match and previous state is undefined', () => {
      const defaultState = { counter: 7 }
      const reducer = makeActionReducer('NOT_TYPE', undefined, defaultState)

      expect(reducer(undefined, { type })).to.deep.equal(defaultState)
    })

    it('should use the default state if the type matches and previous state is undefined', () => {
      const reducer = makeActionReducer(
        type,
        (state, action) => ({ counter: state.counter + action.payload }),
        { counter: 3 }
      )

      expect(reducer(undefined, { type, payload: 7 })).to.deep.equal({ counter: 10 })
    })

    it('should handle errors and non-errors', () => {
      const reducer = makeActionReducer(
        type,
        (state, { payload }) => {
          if (payload instanceof Error) {
            return state
          }
          return { counter: state.counter + payload }
        },
      )

      expect(reducer(prevState, { type, payload: 7 })).to.deep.equal({ counter: 10 })
      expect(reducer(prevState, { type, payload: new Error, error: true })).to.deep.equal(prevState)
    })

    it('should accept an action creator as the first parameter', () => {
      const increment = makeActionCreator(type)
      const reducer = makeActionReducer(
        increment,
        (state, action) => ({ counter: state.counter + action.payload })
      )

      expect(reducer(prevState, increment(7))).to.deep.equal({ counter: 10 })
    })
  })

  describe('map of next/throw reducers', () => {
    it('should throw an error if next or throw are not functions or undefined', () => {
      expect(
        () => makeActionReducer(type, { next: 1 })
      ).to.throw(TypeError, 'Use a function, undefined, or object with next/throw reducers for reducer argument')
      expect(
        () => makeActionReducer(type, { throw: [] })
      ).to.throw(TypeError, 'Use a function, undefined, or object with next/throw reducers for reducer argument')
    })

    it('returns previous state if type does not match', () => {
      const reducer = makeActionReducer('NOT_TYPE', {
        next: (state, action) => ({
          counter: state.counter + action.payload,
        }),
      })

      expect(reducer(prevState, { type, payload: 7 })).to.equal(prevState)
    })

    it('should handle non-errors using the identity if next() is undefined', () => {
      const reducer = makeActionReducer(type, {
        throw: (state, action) => ({
          counter: state.counter + action.payload,
        }),
      })

      expect(reducer(prevState, { type, payload: 7 })).to.deep.equal(prevState)
    })

    it('should handle errors with the identity if throw() is undefined', () => {
      const reducer = makeActionReducer(type, {
        next: (state, action) => ({
          counter: state.counter + action.payload,
        }),
      })

      expect(reducer(prevState, { type, payload: 7, error: true })).to.deep.equal(prevState)
    })

    it('should use next() if action does not represent an error', () => {
      const reducer = makeActionReducer(type, {
        next: (state, action) => ({
          counter: state.counter + action.payload,
        }),
      })

      expect(reducer(prevState, { type, payload: 7 })).to.deep.equal({ counter: 10 })
    })

    it('should use throw() if action represents an error', () => {
      const reducer = makeActionReducer(type, {
        throw: (state, action) => ({
          counter: state.counter + action.payload,
        }),
      })

      expect(reducer(prevState, { type, payload: 7, error: true })).to.deep.equal({ counter: 10 })
    })
  })

  describe('with combined actions', () => {
    it('should handle combined FSAs in unified form', () => {
      const action1 = makeActionCreator('ACTION_1')
      const reducer = makeActionReducer(
        combineActions(action1, 'ACTION_2', 'ACTION_3'),
        (state, action) => ({ ...state, number: action.payload })
      )

      expect(reducer({ number: 0 }, action1(1))).to.deep.equal({ number: 1 })
      expect(reducer({ number: 0 }, { type: 'ACTION_2', payload: 2 })).to.deep.equal({ number: 2 })
      expect(reducer({ number: 0 }, { type: 'ACTION_3', payload: 3 })).to.deep.equal({ number: 3 })
    })

    it('should handle combined FSAs in next/throw form', () => {
      const action1 = makeActionCreator('ACTION_1')
      const reducer = makeActionReducer(
        combineActions(action1, 'ACTION_2', 'ACTION_3'),
        {
          next(state, action) {
            return { ...state, number: action.payload }
          },
        },
      )

      expect(reducer({ number: 0 }, action1(1))).to.deep.equal({ number: 1 })
      expect(reducer({ number: 0 }, { type: 'ACTION_2', payload: 2 })).to.deep.equal({ number: 2 })
      expect(reducer({ number: 0 }, { type: 'ACTION_3', payload: 3 })).to.deep.equal({ number: 3 })
    })

    it('should handle combined error FSAs', () => {
      const action1 = makeActionCreator('ACTION_1')
      const reducer = makeActionReducer(
        combineActions(action1, 'ACTION_2', 'ACTION_3'),
        {
          next(state, action) {
            return { ...state, payload: action.payload }
          },

          throw(state) {
            return { ...state, threw: true }
          },
        },
      )
      const error = new Error

      expect(
        reducer({ number: 0 }, action1(error))
      ).to.deep.equal({ number: 0, threw: true })
      expect(
        reducer({ number: 0 }, { type: 'ACTION_2', payload: error, error: true })
      ).to.deep.equal({ number: 0, threw: true })
      expect(
        reducer({ number: 0 }, { type: 'ACTION_3', payload: error, error: true })
      ).to.deep.equal({ number: 0, threw: true })
    })

    it('should return the previous state if the action type is not any of the combined actions', () => {
      const reducer = makeActionReducer(
        combineActions('ACTION_1', 'ACTION_2'),
        (state, { payload }) => ({ ...state, state: payload }),
      )

      expect(
        reducer({ number: 0 }, { type: 'ACTION_3', payload: 1 })
      ).to.deep.equal({ number: 0 })
      expect(
        reducer({ number: 0 }, { type: 'ACTION_3', payload: 1 })
      ).to.deep.equal({ number: 0 })
    })

    it('should use the default state if the initial state is undefined', () => {
      const reducer = makeActionReducer(
        combineActions('INCREMENT', 'DECREMENT'),
        (state, { payload }) => ({ ...state, counter: state.counter + payload }),
        { counter: 10 }
      )

      expect(reducer(undefined, { type: 'INCREMENT', payload: +1 })).to.deep.equal({ counter: 11 })
      expect(reducer(undefined, { type: 'DECREMENT', payload: -1 })).to.deep.equal({ counter: 9 })
    })
  })
})
