_ = require 'underscore'
moment = require 'moment'

{TaskPlanActions, TaskPlanStore} = require '../../src/flux/task-plan'

{CourseActions, CourseStore} = require '../../src/flux/course'

COURSE  = require '../../api/courses/1.json'
COURSE_ID = '1'

DATA   = require '../../api/courses/1/dashboard'
PLAN = _.findWhere(DATA.plans, id: '7')

describe 'TaskPlan Store', ->

  beforeEach ->
    CourseActions.loaded(COURSE, COURSE_ID)
    TaskPlanActions.loaded(PLAN, PLAN.id)

  it 'can clone a task plan', ->
    newId = '111'
    TaskPlanActions.createClonedPlan( newId, {
      planId: PLAN.id, courseId: COURSE_ID, due_at: moment()
    })
    clone = TaskPlanStore.getChanged(newId)
    for attr in ['title', 'description', 'type', 'settings', 'is_feedback_immediate']
      expect(clone[attr]).to.deep.equal(PLAN[attr])

    expect(clone.cloned_from_id).to.equal(PLAN.id)
    for period in CourseStore.get(COURSE_ID).periods
      tasking_plan = _.find(clone.tasking_plans, target_id: period.id)
      expect(tasking_plan).to.exist

    undefined
