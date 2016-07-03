import { makeActionCreators } from '../'

describe('makeActionCreators', () => {
  it('should throw an error when given arguments that contain a non-string', () => {
    const expectedError = 'Expected (optional) object followed by string action types'

    expect(() => makeActionCreators(1)).to.throw(TypeError, expectedError)
    expect(() => makeActionCreators({
      ACTION_ONE: undefined,
    }, [])).to.throw(TypeError, expectedError)
    expect(() => makeActionCreators('ACTION_ONE', true)).to.throw(TypeError, expectedError)
  })

  it('should throw an error when given bad payload creators', () => {
    expect(() => makeActionCreators({
      ACTION_ONE: [],
    })).to.throw(TypeError, 'Expected function or undefined payload creator for ACTION_ONE')

    expect(() => makeActionCreators({
      ACTION_ONE: undefined,
      ACTION_TWO: 'string',
    })).to.throw(TypeError, 'Expected function or undefined payload creator for ACTION_TWO')
  })

  it('should return a map of camel-cased action types to action creators', () => {
    const { actionOne, actionTwo } = makeActionCreators({
      ACTION_ONE(key, value) {
        return { [key]: value }
      },
      ACTION_TWO(first, second) {
        return [ first, second ]
      },
    })

    expect(actionOne('key', 1)).to.deep.equal({
      type: 'ACTION_ONE',
      payload: { key: 1 },
    })
    expect(actionTwo('first', 'second')).to.deep.equal({
      type: 'ACTION_TWO',
      payload: [ 'first', 'second' ],
    })
  })

  it('should use the identity payload creator if the map value is not a function', () => {
    const { actionOne, actionTwo } = makeActionCreators({
      ACTION_ONE: undefined,
      ACTION_TWO: undefined,
    })

    expect(actionOne('payload')).to.deep.equal({
      type: 'ACTION_ONE',
      payload: 'payload',
    })

    expect(actionTwo({ two: 2 })).to.deep.equal({
      type: 'ACTION_TWO',
      payload: { two: 2 },
    })
  })

  it('should use identity payload creators if given string action types', () => {
    const { actionOne, actionTwo } = makeActionCreators('ACTION_ONE', 'ACTION_TWO')

    expect(actionOne('payload')).to.deep.equal({
      type: 'ACTION_ONE',
      payload: 'payload',
    })

    expect(actionTwo(1)).to.deep.equal({
      type: 'ACTION_TWO',
      payload: 1,
    })
  })

  it('should create actions from an object and action types', () => {
    const { actionOne, actionTwo, actionThree, actionFour } = makeActionCreators({
      ACTION_ONE(key, value) {
        return { [key]: value }
      },
      ACTION_TWO(first, second) {
        return [ first, second ]
      },
    }, 'ACTION_THREE', 'ACTION_FOUR')

    expect(actionOne('key', 1)).to.deep.equal({
      type: 'ACTION_ONE',
      payload: { key: 1 },
    })
    expect(actionTwo('first', 'second')).to.deep.equal({
      type: 'ACTION_TWO',
      payload: [ 'first', 'second' ],
    })
    expect(actionThree('payload')).to.deep.equal({
      type: 'ACTION_THREE',
      payload: 'payload',
    })
    expect(actionFour(1)).to.deep.equal({
      type: 'ACTION_FOUR',
      payload: 1,
    })
  })
})
