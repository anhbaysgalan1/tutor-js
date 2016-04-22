React = require 'react'

{TocStore, TocActions} = require '../../flux/toc'
{CourseStore} = require '../../flux/course'
LoadableItem = require '../loadable-item'


Dashboard = require './dashboard'

QuestionsDashboardShell = React.createClass

  contextTypes:
    router: React.PropTypes.func

  render: ->
    {courseId} = @context.router.getCurrentParams()
    ecosystemId = CourseStore.get(courseId).ecosystem_id

    <LoadableItem
      id={ecosystemId}
      store={TocStore}
      actions={TocActions}
      renderItem={-> <Dashboard courseId={courseId} ecosystemId={ecosystemId} />}
    />

module.exports = QuestionsDashboardShell