_ = require 'underscore'
{CrudConfig, makeSimpleStore, extendConfig} = require './helpers'
{TaskPlanStore} = require './task-plan'

TeacherTaskPlanConfig =

  # The load returns a JSON containing `{total_count: 0, items: [...]}`.
  # Unwrap the JSON and store the items.
  _loaded: (obj, id) ->
    {plans} = obj

    @_local[id] ?= []
    existingPlanIds = _.pluck(@_local[id], 'id')

    _.each plans, (plan) =>
      planIndex = _.indexOf(existingPlanIds, plan.id)

      if planIndex > -1
        @_local[id][planIndex] = plan
      else
        @_local[id].push(plan)

    @_local[id]

  exports:
    getPlanId: (courseId, planId) ->
      _.findWhere(@_local[courseId], id: planId)

    getActiveCoursePlans: (id) ->
      plans = @_local[id] or []
      # don't return plans that are in the process of being deleted
      _.filter plans, (plan) ->
        not TaskPlanStore.isDeleteRequested(plan.id)


extendConfig(TeacherTaskPlanConfig, new CrudConfig())
{actions, store} = makeSimpleStore(TeacherTaskPlanConfig)
module.exports = {TeacherTaskPlanActions:actions, TeacherTaskPlanStore:store}
