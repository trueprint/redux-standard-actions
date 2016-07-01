import identity from 'lodash.identity'

import { handleAction, createAction } from '../'

describe('handleAction()', () => {
  const type = 'TYPE'
  const prevState = { counter: 3 }

  describe('single handler form', () => {
    it('returns previous state if type does not match', () => {
      const reducer = handleAction('NOTTYPE', identity)
      expect(reducer(prevState, { type })).to.equal(prevState)
    })

    it('uses the identity if given an undefined reducer', () => {
      const reducer = handleAction(type)
      expect(reducer(prevState, { type })).to.equal(prevState)
    })

    it('throws an error in case the reducer has the wrong shape', () => {
      for (const badReducer of [ 1, { next: identity }, [], 'string' ]) {
        expect(() => handleAction(type, badReducer))
          .to.throw(TypeError, 'wrong shape for reducers argument')
      }
    })

    it('returns default state if type does not match', () => {
      const reducer = handleAction('NOTTYPE', identity, { counter: 7 })
      expect(reducer(undefined, { type }))
        .to.deep.equal({
          counter: 7,
        })
    })

    it('accepts single function as handler', () => {
      const reducer = handleAction(type, (state, action) => ({
        counter: state.counter + action.payload,
      }))
      expect(reducer(prevState, { type, payload: 7 }))
        .to.deep.equal({
          counter: 10,
        })
    })

    it('accepts action function as action type', () => {
      const incrementAction = createAction(type)
      const reducer = handleAction(incrementAction, (state, action) => ({
        counter: state.counter + action.payload,
      }))

      expect(reducer(prevState, incrementAction(7)))
        .to.deep.equal({
          counter: 10,
        })
    })

    it('accepts single function as handler and a default state', () => {
      const reducer = handleAction(type, (state, action) => ({
        counter: state.counter + action.payload,
      }), { counter: 3 })
      expect(reducer(undefined, { type, payload: 7 }))
        .to.deep.equal({
          counter: 10,
        })
    })
  })

  describe('map of handlers form', () => {
    describe('resulting reducer', () => {
      it('should throw an error if next or throw are not functions', () => {
        expect(() => handleAction('NOTTYPE', { next: 1, throw: [] }))
          .to.throw(TypeError, 'wrong shape for reducers argument')
      })

      it('returns previous state if type does not match', () => {
        const reducer = handleAction('NOTTYPE', {
          next: (state, action) => ({
            counter: state.counter + action.payload,
          }),
          throw: identity,
        })
        expect(reducer(prevState, { type })).to.equal(prevState)
      })

      it('uses `next()` if action does not represent an error', () => {
        const reducer = handleAction(type, {
          next: (state, action) => ({
            counter: state.counter + action.payload,
          }),
          throw: (state, action) => ({
            counter: state.counter + action.payload,
          }),
        })
        expect(reducer(prevState, { type, payload: 7 }))
          .to.deep.equal({
            counter: 10,
          })
      })

      it('uses `throw()` if action represents an error', () => {
        const reducer = handleAction(type, {
          next: identity,
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
})
