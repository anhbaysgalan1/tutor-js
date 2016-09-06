moment = require 'moment'
_ = require 'underscore'

{PlanPublishStore, PlanPublishActions} = require '../flux/plan-publish'
{TimeStore} = require '../flux/time'

PlanHelper =
  isPublishing: (plan) ->
    plan.is_publishing

  subscribeToPublishing: (plan, callback) ->
    {jobId, id} = PlanPublishStore._getIds(plan)
    isPublishing = PlanHelper.isPublishing(plan)

    publishStatus = PlanPublishStore.getAsyncStatus(id)
    isPublishingInStore = PlanPublishStore.isPublishing(id)

    if isPublishing and not isPublishingInStore and not PlanPublishStore.isPublished(id)
      PlanPublishActions.queued(plan, id) if jobId

    isPublishing = isPublishing or isPublishingInStore

    if isPublishing
      PlanPublishActions.startChecking(id, jobId)
      PlanPublishStore.on("progress.#{id}.*", callback) if callback? and _.isFunction(callback)

    {isPublishing, publishStatus}


  isPlanOpen: (plan) ->
    now = moment(TimeStore.getNow())
    for tasking in plan.tasking_plans
      if moment(tasking.opens_at).isBefore(now)
        return true # at least one tasking is opened
    false


module.exports = PlanHelper
