# This file manages all async state transitions.
#
# These attach to actions to help state changes along.
#
# For example, `TaskActions.load` everntually yields either
# `TaskActions.loaded` or `TaskActions.FAILED`
{
  connectAction, connectHandler,
  connectCreate, connectRead, connectUpdate, connectDelete
} = require './adapter'

{CurrentUserActions} = require '../flux/current-user'
{CourseActions} = require '../flux/course'
{CoursePracticeActions} = require '../flux/practice'
{CourseGuideActions} = require '../flux/guide'
{JobActions} = require '../flux/job'
{EcosystemsActions} = require '../flux/ecosystems'
PerformanceForecast = require '../flux/performance-forecast'

{ScoresActions} = require '../flux/scores'
{ScoresExportActions} = require '../flux/scores-export'
{RosterActions, RosterStore} = require '../flux/roster'
{PeriodActions} = require '../flux/period'

{TaskActions} = require '../flux/task'
{TaskPanelActions} = require '../flux/task-panel'
{TaskStepActions} = require '../flux/task-step'
{StudentIdActions} = require '../flux/student-id'
{TaskPlanActions, TaskPlanStore} = require '../flux/task-plan'
{TaskTeacherReviewActions} = require '../flux/task-teacher-review'
{TaskPlanStatsActions} = require '../flux/task-plan-stats'

{TocActions} = require '../flux/toc'
{ExerciseActions, ExerciseStore} = require '../flux/exercise'
{TeacherTaskPlanActions} = require '../flux/teacher-task-plan'
{StudentDashboardActions} = require '../flux/student-dashboard'
{CourseListingActions} = require '../flux/course-listing'
{CCDashboardActions} = require '../flux/cc-dashboard'

{ReferenceBookActions} = require '../flux/reference-book'
{ReferenceBookPageActions} = require '../flux/reference-book-page'
{ReferenceBookExerciseActions} = require '../flux/reference-book-exercise'
{NewCourseActions, NewCourseStore} = require '../flux/new-course'
{NotificationActions} = require '../flux/notifications'

BOOTSTRAPED_STORES = {
  user:   CurrentUserActions.loaded
  courses: CourseListingActions.loaded
}

startAPI = ->
  connectRead(TaskActions, pattern: 'tasks/{id}')
  connectDelete(TaskActions, pattern: 'tasks/{id}')

  connectRead(TaskPlanActions, pattern: 'plans/{id}')
  connectDelete(TaskPlanActions, pattern: 'plans/{id}')

  connectUpdate(TaskPlanActions,
    pattern: (id, courseId) ->
      if TaskPlanStore.isNew(id) then 'courses/{courseId}/plans' else 'plans/{id}'
    data: TaskPlanStore.getChanged
    route: (id, courseId) -> {id, courseId}
  )

  connectRead(TaskPlanStatsActions, pattern: 'plans/{id}/stats')
  connectRead(TaskTeacherReviewActions, pattern: 'plans/{id}/review')

  connectRead(ExerciseActions,
    trigger: 'loadForEcosystem', onSuccess: 'loadedForEcosystem'
    url: (id, pageIds, requestType = 'homework_core') ->
      "ecosystems/#{id}/exercises/#{requestType}"
    params: (id, pageIds, requestType = 'homework_core') ->
      page_ids: pageIds
  )

  connectRead(ExerciseActions,
    trigger: 'loadForCourse', onSuccess: 'loadedForCourse'
    url: (id, pageIds, ecosystemId = null, requestType = 'homework_core') ->
      "courses/#{id}/exercises/#{requestType}"
    params: (id, pageIds, ecosystemId = null, requestType = 'homework_core') ->
      params =
        page_ids: pageIds
      params.ecosystem_id = ecosystemId if ecosystemId?
      params
  )

  connectHandler(ExerciseActions,
    trigger: 'saveExerciseExclusion', onSuccess: 'exclusionsSaved'
    method: 'PUT', pattern: 'courses/{id}/exercises'
    data: ->
      _.map ExerciseStore.getUnsavedExclusions(), (is_excluded, id) -> {id, is_excluded}
  )

  connectRead(TocActions, pattern: 'ecosystems/{id}/readings')
  connectRead(CourseGuideActions, pattern: 'courses/{id}/guide')
  connectRead(CourseActions, pattern: 'courses/{id}')
  connectUpdate(CourseActions, pattern: 'courses/{id}')

  connectRead(CCDashboardActions, pattern: 'courses/{id}/cc/dashboard')
  connectCreate(CoursePracticeActions, pattern: 'courses/{id}/practice')
  connectRead(CoursePracticeActions, pattern: 'courses/{id}/practice')

  connectRead(PerformanceForecast.Student.actions, pattern: 'courses/{id}/guide')
  connectRead(PerformanceForecast.Teacher.actions, pattern: 'courses/{id}/teacher_guide')
  connectRead(PerformanceForecast.TeacherStudent.actions,
    url: (id, {roleId}) ->
      "courses/#{id}/guide/role/#{roleId}"
    data: (id, {roleId}) ->
      {id, roleId}
  )

  connectRead(ScoresActions, pattern: 'courses/{id}/performance')
  connectRead(ScoresExportActions, pattern: 'courses/{id}/performance/exports')
  connectCreate(ScoresExportActions,
    pattern: 'courses/{id}/performance/export', trigger: 'export', onSuccess: 'exported'
  )

  connectHandler(ScoresActions,
    trigger: 'acceptLate', onSuccess: 'acceptedLate'
    method: 'PUT', pattern: 'tasks/{id}/accept_late_work'
  )

  connectHandler(ScoresActions,
    trigger: 'rejectLate', onSuccess: 'rejectedLate'
    method: 'PUT', pattern: 'tasks/{id}/reject_late_work'
  )

  connectRead(TeacherTaskPlanActions, pattern: 'courses/{id}/dashboard',
    params: (id, startAt, endAt) ->
      start_at: startAt
      end_at: endAt
  )

  connectRead(JobActions, pattern: 'job/{id}', handledErrors: ['*'])
  connectRead(EcosystemsActions, url: 'ecosystems')
  connectDelete(RosterActions,
    pattern: 'teachers/{id}', trigger: 'teacherDelete', onSuccess: 'teacherDeleted'
  )
  connectDelete(RosterActions, pattern: 'students/{id}')
  connectUpdate(RosterActions, pattern: 'students/{id}')

  connectHandler(RosterActions,
    trigger: 'undrop', onSuccess: 'undropped'
    method: 'PUT', pattern: 'students/{id}/undrop'
    errorHandlers:
      already_active: 'onUndropAlreadyActive'
      student_identifier_has_already_been_taken: 'recordDuplicateStudentIdError'
  )
  connectUpdate(RosterActions,
    pattern: 'students/{id}', trigger: 'saveStudentIdentifier', onSuccess: 'savedStudentIdentifier'
    errorHandlers:
      student_identifier_has_already_been_taken: 'recordDuplicateStudentIdError'
    data: ({courseId, studentId}) ->
      student_identifier: RosterStore.getStudentIdentifier(courseId, studentId)
  )
  connectCreate(RosterActions, pattern: 'courses/{id}/roster')
  connectRead(RosterActions, pattern: 'courses/{id}/roster')
  connectUpdate(StudentIdActions,
    pattern: 'user/courses/{id}/student'
    handledErrors: ['*'], handleError: StudentIdActions.errored
    data: (id, data) -> data
  )

  connectCreate(PeriodActions, pattern: 'courses/{courseId}/periods')
  connectUpdate(PeriodActions, pattern: 'periods/{id}')
  connectDelete(PeriodActions, pattern: 'periods/{id}')
  connectHandler(PeriodActions,
    method: 'PUT', pattern: 'periods/{id}/restore'
    trigger: 'restore', onSuccess: 'restored'
  )

  connectRead(TaskStepActions, pattern: 'steps/{id}')
  connectRead(TaskStepActions,
    pattern: 'steps/{id}', trigger: 'loadPersonalized'
    handledErrors: ['*'], handleError: TaskStepActions.loadedNoPersonalized
  )
  connectHandler(TaskStepActions,
    method: 'PUT', pattern: 'steps/{id}/completed'
    trigger: 'complete', onSuccess: 'completed'
  )
  connectHandler(TaskStepActions,
    method: 'PUT', pattern: 'steps/{id}/recovery'
    trigger: 'loadRecovery', onSuccess: 'loadedRecovery'
  )
  connectUpdate(TaskStepActions,
    pattern: 'steps/{id}', trigger: 'setFreeResponseAnswer'
    data: (id, freeResponse) ->
      {free_response: freeResponse}
  )
  connectUpdate(TaskStepActions,
    pattern: 'steps/{id}', trigger: 'setAnswerId'
    data: (id, answerId) ->
      {answer_id: answerId}
  )

  connectRead(CurrentUserActions, url: 'user')
  connectRead(CourseListingActions, url: 'user/courses')
  connectCreate(NewCourseActions,
    pattern: 'courses/{id}/clone', trigger: 'clone', data: NewCourseStore.requestPayload
  )
  connectCreate(NewCourseActions, url: 'courses', data: NewCourseStore.requestPayload)

  connectRead(ReferenceBookActions, pattern: 'ecosystems/{id}/readings')
  connectRead(ReferenceBookPageActions, pattern: 'pages/{id}')
  connectRead(ReferenceBookPageActions,
    pattern: 'pages/{id}', handledErrors: ['*'], trigger: 'loadSilent'
  )
  connectRead(ReferenceBookExerciseActions, url: (url) -> url)

  connectRead(StudentDashboardActions, pattern: 'courses/{id}/dashboard')
  connectRead(NotificationActions,
    trigger: 'loadUpdates', onSuccess: 'loadedUpdates', url: 'notifications', handledErrors: ['*']
  )

# SharedNetworking = require 'shared/src/model/networking'

start = (bootstrapData) ->
  for storeId, action of BOOTSTRAPED_STORES
    data = bootstrapData[storeId]
    action(data) if data

  # SharedNetworking.onError(onRequestError)

  startAPI()

module.exports = {startAPI, start}
