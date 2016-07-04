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
      const actionOne = makeActionCreator('ACTION_ONE')
      const reducer = makeActionReducer(
        combineActions(actionOne, 'ACTION_TWO', 'ACTION_THREE'),
        (state, action) => ({ ...state, payload: action.payload })
      )

      expect(reducer({ state: 1 }, actionOne('action one'))).to.deep.equal({ state: 1, payload: 'action one' })
      expect(
        reducer({ state: 1 }, { type: 'ACTION_TWO', payload: 'action two' })
      ).to.deep.equal({ state: 1, payload: 'action two' })
      expect(
        reducer({ state: 1 }, { type: 'ACTION_THREE', payload: 'action three' })
      ).to.deep.equal({ state: 1, payload: 'action three' })
    })

    it('should handle combined FSAs in next/throw form', () => {
      const actionOne = makeActionCreator('ACTION_ONE')
      const reducer = makeActionReducer(
        combineActions(actionOne, 'ACTION_TWO', 'ACTION_THREE'),
        {
          next(state, action) {
            return { ...state, payload: action.payload }
          },
        },
      )

      expect(reducer({ state: 1 }, actionOne('action one'))).to.deep.equal({ state: 1, payload: 'action one' })
      expect(
        reducer({ state: 1 }, { type: 'ACTION_TWO', payload: 'action two' })
      ).to.deep.equal({ state: 1, payload: 'action two' })
      expect(
        reducer({ state: 1 }, { type: 'ACTION_THREE', payload: 'action three' })
      ).to.deep.equal({ state: 1, payload: 'action three' })
    })

    it('should handle combined error FSAs', () => {
      const actionOne = makeActionCreator('ACTION_ONE')
      const reducer = makeActionReducer(
        combineActions(actionOne, 'ACTION_TWO', 'ACTION_THREE'),
        {
          next(state, action) {
            return { ...state, payload: action.payload }
          },

          throw(state, action) {
            return { ...state, thrown: true, error: action.payload }
          },
        },
      )
      const error = new Error

      expect(
        reducer({ state: 1 }, actionOne(error))
      ).to.deep.equal({ state: 1, thrown: true, error })
      expect(
        reducer({ state: 1 }, { type: 'ACTION_TWO', payload: error, error: true })
      ).to.deep.equal({ state: 1, thrown: true, error })
      expect(
        reducer({ state: 1 }, { type: 'ACTION_THREE', payload: error, error: true })
      ).to.deep.equal({ state: 1, thrown: true, error })
    })

    it('should return the previous state if the action type is not any of the combined actions', () => {
      const reducer = makeActionReducer(
        combineActions('ACTION_ONE', 'ACTION_TWO'),
        (state, { payload }) => ({ ...state, counter: state.counter + payload }),
        { counter: 10 }
      )

      expect(
        reducer({ state: 'state' }, { type: 'ACTION_THREE', payload: 'action three' })
      ).to.deep.equal({ state: 'state' })
      expect(
        reducer({ state: 'state' }, { type: 'ACTION_THREE', payload: 'action three' })
      ).to.deep.equal({ state: 'state' })
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
