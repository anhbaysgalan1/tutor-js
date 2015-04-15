_        = require 'underscore'
{expect} = require 'chai'
React    = require 'react'
ReactAddons        = require 'react/addons'
ReactTestUtils     = React.addons.TestUtils
{routerStub}       = require './helpers/utilities'
{StudentDashboard} = require '../../src/components/student-dashboard'
{StudentDashboardStore, StudentDashboardActions} = require '../../src/flux/student-dashboard'

DATA = require '../../api/courses/1/dashboard.json'
COURSE_ID = '1'

describe 'Student Dashboard Component', ->
  beforeEach (done) ->
    StudentDashboardActions.reset()
    StudentDashboardActions.loaded(DATA, COURSE_ID)
    routerStub.goTo("/courses/#{COURSE_ID}/dashboard")
      .then (result) =>
        @dashboard = ReactTestUtils.findRenderedComponentWithType(result.component,StudentDashboard)
        @state = result
        done()

  it 'displays the course title', ->
    expect(@state.div.querySelector('.page-header').innerText)
      .equal(DATA.title)
