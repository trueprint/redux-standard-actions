import { isFSA } from 'flux-standard-action'

import { makeActionCreator } from '../'

describe('makeActionCreator', () => {
  const type = 'TYPE'

  it('should return an FSA', () => {
    const actionCreator = makeActionCreator(type)
    const payload = { key: 'value' }

    expect(isFSA(actionCreator(payload))).to.be.true
  })

  it('should use the payload creator', () => {
    const actionCreator = makeActionCreator(type, (key, value) => ({ [key]: value }))
    const action = actionCreator('key', 'value')

    expect(action).to.deep.equal({ type, payload: { key: 'value' } })
    expect(isFSA(action)).to.be.true
  })

  it('should use the identity function if payload creator is undefined', () => {
    const actionCreator = makeActionCreator(type, undefined)
    const payload = { key: 'value' }
    const action = actionCreator(payload)

    expect(action).to.deep.equal({ type, payload })
    expect(isFSA(action)).to.be.true
  })

  it('should raise an error if payload creator is not a function or undefined', () => {
    [ 1, {}, [], false, null ].forEach(badPayloadCreator => {
      expect(
        () => makeActionCreator(type, badPayloadCreator)
      ).to.throw(TypeError, /Expected payloadCreator to be a function/)
    })
  })

  it('should use the meta creator', () => {
    const actionCreator = makeActionCreator(type, undefined, ({ id }) => id)
    const payload = { key: 'value', id: 5 }
    const action = actionCreator(payload)

    expect(action).to.deep.equal({ type, payload, meta: 5 })
    expect(isFSA(action)).to.be.true
  })

  it('should set error to true and not run the payload creator if passed an error', () => {
    const actionCreator = makeActionCreator(type, payload => ({ payload }))
    const error = new TypeError()
    const action = actionCreator(error)

    expect(action).to.deep.equal({ type, payload: error, error: true })
    expect(isFSA(action)).to.be.true
  })

  it('should set error to true if passed an error and meta creator is provided', () => {
    const actionCreator = makeActionCreator(type, undefined, (payload, meta) => meta)
    const error = new TypeError()

    const action = actionCreator(error, { key: 'value' })
    expect(action).to.deep.equal({ type, payload: error, error: true, meta: { key: 'value' } })
  })

  it('should set payload only when defined', () => {
    const actionCreator = makeActionCreator(type, undefined, (payload, meta) => meta.id)
    const undefinedPayloadFSA = actionCreator(undefined, { id: 5 })
    const nullPayloadFSA = actionCreator(null, { id: 5 })

    expect(undefinedPayloadFSA).to.deep.equal({ type, meta: 5 })
    expect(nullPayloadFSA).to.deep.equal({ type, payload: null, meta: 5 })
    expect(isFSA(undefinedPayloadFSA)).to.be.true
    expect(isFSA(nullPayloadFSA)).to.be.true
  })

  it('should bypass payload creator if payload is an error', () => {
    const actionCreator = makeActionCreator(type, () => 'this will not be the payload', (payload, meta) => meta)
    const error = new TypeError()
    const action = actionCreator(error, { key: 'value' })

    expect(action).to.deep.equal({ type, payload: error, error: true, meta: { key: 'value' } })
  })
})
