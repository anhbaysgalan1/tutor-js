_              = require 'underscore'
{expect}       = require 'chai'
React          = require 'react'
{Promise}      = require 'es6-promise'
ReactAddons    = require 'react/addons'
ReactTestUtils = React.addons.TestUtils
{routerStub}   = require './helpers/utilities'
{sinon}        = require './helpers/component-testing'
{CourseListing} = require '../../src/components/course-listing'
{CourseListingActions, CourseListingStore} = require '../../src/flux/course-listing'
{StudentDashboardShell} = require '../../src/components/student-dashboard'
CourseCalendar = require '../../src/components/course-calendar'
WindowHelpers  = require '../../src/helpers/window'

{
  STUDENT_COURSE_ONE_MODEL
  TEACHER_COURSE_TWO_MODEL
  TEACHER_AND_STUDENT_COURSE_THREE_MODEL
  MASTER_COURSES_LIST
} = require '../courses-test-data'


renderListing = ->
  new Promise (resolve, reject) ->
    routerStub.goTo('/dashboard').then (result) ->
      resolve(_.extend({
        listing: ReactTestUtils.scryRenderedComponentsWithType(result.component, CourseListing)[0]
      }, result))

describe 'Course Listing Component', ->

  it 'renders the listing', ->
    CourseListingActions.loaded(MASTER_COURSES_LIST)
    renderListing().then (state) ->
      renderDataset = _.pluck(state.div.querySelectorAll('.tutor-booksplash-course-item'), 'dataset')
      for course, i in MASTER_COURSES_LIST
        expect(MASTER_COURSES_LIST[i].name).to.contain(renderDataset[i].title)
      # no refresh button when load succeeds
      expect(state.div.querySelector(".refresh-button")).to.be.null

  it 'displays refresh button when loading fails', ->
    CourseListingActions.FAILED()
    expect(CourseListingStore.isFailed()).to.be.true
    renderListing().then (state) ->
      expect(state.div.querySelector(".refresh-button")).not.to.be.null

  it 'redirects to student dashboard', ->
    CourseListingActions.loaded([STUDENT_COURSE_ONE_MODEL])
    renderListing().then (state) ->
      expect(state.listing).to.be.undefined # Won't have rendered the listing
      expect(ReactTestUtils.scryRenderedComponentsWithType(state.component, StudentDashboardShell))
        .to.have.length(1)

  it 'redirects to teacher calendar', ->
    CourseListingActions.loaded([TEACHER_COURSE_TWO_MODEL])
    renderListing().then (state) ->
      expect(state.listing).to.be.undefined # Won't have rendered the listing
      expect(ReactTestUtils.scryRenderedComponentsWithType(state.component, CourseCalendar))
        .to.have.length(1)

  describe 'redirecting to CC', ->
    beforeEach ->
      sinon.stub(WindowHelpers, 'replaceBrowserLocation')
      @course = _.clone(STUDENT_COURSE_ONE_MODEL)
      @course.is_concept_coach = true
      @course.webview_url = 'http://test.com/cc'

    afterEach ->
      WindowHelpers.replaceBrowserLocation.restore()

    it 'redirects when a member of a single CC course', ->
      CourseListingActions.loaded([@course])
      renderListing().then (state) =>
        expect(WindowHelpers.replaceBrowserLocation.calledWith(@course.webview_url)).to.be.true

    it 'does not redirect if a member of multiple course', ->
      CourseListingActions.loaded([@course, TEACHER_COURSE_TWO_MODEL])
      renderListing().then (state) ->
        expect(WindowHelpers.replaceBrowserLocation.callCount).equal(0)
