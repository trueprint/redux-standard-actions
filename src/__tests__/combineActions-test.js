import { combineActions, makeActionCreators } from '../'

describe('combineActions', () => {
  it('should throw an error if any action is not a function or string', () => {
    expect(
      () => combineActions(1, 'ACTION_2')
    ).to.throw(TypeError, 'Expected each argument to be a string action type or an action creator')

    expect(
      () => combineActions('ACTION_1', () => {}, null)
    ).to.throw(TypeError, 'Expected each argument to be a string action type or an action creator')
  })

  it('should accept action creators and action type strings', () => {
    const { action1, action2 } = makeActionCreators('ACTION_1', 'ACTION_2')

    expect(
      () => combineActions('ACTION_1', 'ACTION_2')
    ).not.to.throw(Error)
    expect(
      () => combineActions(action1, action2)
    ).not.to.throw(Error)
    expect(
      () => combineActions(action1, action2, 'ACTION_3')
    ).not.to.throw(Error)
  })

  it('should return a stringifiable object', () => {
    const { action1, action2 } = makeActionCreators('ACTION_1', 'ACTION_2')

    expect(combineActions('ACTION_1', 'ACTION_2')).to.respondTo('toString')
    expect(combineActions(action1, action2)).to.respondTo('toString')
    expect(combineActions(action1, action2, 'ACTION_3')).to.respondTo('toString')
  })
})
