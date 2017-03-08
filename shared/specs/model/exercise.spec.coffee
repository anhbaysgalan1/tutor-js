{Testing, sinon, _} = require 'shared/specs/helpers'

Exercise = require 'model/exercise'

describe 'Exercise Helper', ->

  afterEach ->
    Exercise.setErrataFormURL('https://oscms.openstax.org/errata/form')

  it 'calculates trouble url', ->
    expect(Exercise.troubleUrl({
      bookUUID: '185cbf87-c72e-48f5-b51e-f14f21b5eabd'
      project: 'tutor',
      exerciseId: '22@22'
    })).toEqual("#{Exercise.ERRATA_FORM_URL}?source=tutor&location=Exercise%3A%2022%4022&book=Biology")

  it 'skips missing parts', ->
    expect(Exercise.troubleUrl({
      exerciseId: '42@1'
    })).toEqual("#{Exercise.ERRATA_FORM_URL}?location=Exercise%3A%2042%401")


  it 'can set the errata url', ->
    Exercise.setErrataFormURL('')
    expect(Exercise.ERRATA_FORM_URL).toEqual('https://oscms.openstax.org/errata/form')
    Exercise.setErrataFormURL('https://my-crazy-url/')
    expect(Exercise.troubleUrl({
      bookUUID: '185cbf87-c72e-48f5-b51e-f14f21b5eabd'
      project: 'tutor',
      exerciseId: '22@22'
    })).toEqual("https://my-crazy-url/?source=tutor&location=Exercise%3A%2022%4022&book=Biology")
