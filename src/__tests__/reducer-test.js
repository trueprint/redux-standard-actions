import identity from 'lodash.identity'

import { makeActionReducer, makeActionCreator } from '../'

describe('makeActionReducer()', () => {
  const type = 'TYPE'
  const prevState = { counter: 3 }

  describe('single handler form', () => {
    it('returns previous state if type does not match', () => {
      const reducer = makeActionReducer('NOTTYPE', identity)
      expect(reducer(prevState, { type })).to.equal(prevState)
    })

    it('uses the identity if given an undefined reducer', () => {
      const reducer = makeActionReducer(type)
      expect(reducer(prevState, { type })).to.equal(prevState)
    })

    it('throws an error in case the reducer has the wrong shape', () => {
      for (const badReducer of [ 1, { throw: 1 }, [], 'string' ]) {
        expect(() => makeActionReducer(type, badReducer))
          .to.throw(TypeError, 'wrong shape for reducer argument')
      }
    })

    it('returns default state if type does not match', () => {
      const reducer = makeActionReducer('NOTTYPE', identity, { counter: 7 })
      expect(reducer(undefined, { type }))
        .to.deep.equal({
          counter: 7,
        })
    })

    it('accepts single function as handler', () => {
      const reducer = makeActionReducer(type, (state, action) => ({
        counter: state.counter + action.payload,
      }))
      expect(reducer(prevState, { type, payload: 7 }))
        .to.deep.equal({
          counter: 10,
        })
    })

    it('accepts action function as action type', () => {
      const incrementAction = makeActionCreator(type)
      const reducer = makeActionReducer(incrementAction, (state, action) => ({
        counter: state.counter + action.payload,
      }))

      expect(reducer(prevState, incrementAction(7)))
        .to.deep.equal({
          counter: 10,
        })
    })

    it('accepts single function as handler and a default state', () => {
      const reducer = makeActionReducer(type, (state, action) => ({
        counter: state.counter + action.payload,
      }), { counter: 3 })
      expect(reducer(undefined, { type, payload: 7 }))
        .to.deep.equal({
          counter: 10,
        })
    })
  })

  describe('map of handlers form', () => {
    it('should throw an error if next or throw are not functions or undefined', () => {
      expect(() => makeActionReducer('NOTTYPE', { next: 1 }))
        .to.throw(TypeError, 'wrong shape for reducer argument')
      expect(() => makeActionReducer('NOTTYPE', { throw: [] }))
        .to.throw(TypeError, 'wrong shape for reducer argument')
    })

    it('returns previous state if type does not match', () => {
      const reducer = makeActionReducer('NOTTYPE', {
        next: (state, action) => ({
          counter: state.counter + action.payload,
        }),
      })
      expect(reducer(prevState, { type })).to.equal(prevState)
    })

    it('should default to identity if next() is undefined', () => {
      const reducer = makeActionReducer(type, {
        throw: (state, action) => ({
          counter: state.counter + action.payload,
        }),
      })
      expect(reducer(prevState, { type, payload: 7 })).to.deep.equal(prevState)
    })

    it('should default to identity if throw() is undefined', () => {
      const reducer = makeActionReducer(type, {
        next: (state, action) => ({
          counter: state.counter + action.payload,
        }),
      })
      expect(reducer(prevState, { type, payload: 7, error: true })).to.deep.equal(prevState)
    })

    it('uses `next()` if action does not represent an error', () => {
      const reducer = makeActionReducer(type, {
        next: (state, action) => ({
          counter: state.counter + action.payload,
        }),
      })
      expect(reducer(prevState, { type, payload: 7 }))
        .to.deep.equal({
          counter: 10,
        })
    })

    it('uses `throw()` if action represents an error', () => {
      const reducer = makeActionReducer(type, {
        throw: (state, action) => ({
          counter: state.counter + action.payload,
        }),
      })
      expect(reducer(prevState, { type, payload: 7, error: true }))
        .to.deep.equal({
          counter: 10,
        })
    })
  })
})