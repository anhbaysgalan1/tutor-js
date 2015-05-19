React = require 'react'
camelCase = require 'camelcase'
_ = require 'underscore'

defaultGroup = {
  show: false
}

rules =
  default: defaultGroup
  core: defaultGroup
  personalized:
    show: true
    label: 'Personalized'
  #  TODO deprecate spaced practice when BE is updated
  'spaced practice':
    show: true
    label: (related) ->
      "Review - #{related.chapter_section} #{related.title}"
  spaced_practice:
    show: true
    label: (related) ->
      "Review - #{related.chapter_section} #{related.title}"

ExerciseGroup = React.createClass
  displayName: 'ExerciseGroup'

  propTypes:
    group: React.PropTypes.oneOf(_.keys(rules)).isRequired
    related_content: React.PropTypes.array.isRequired

  getDefaultProps: ->
    group: 'default'
    related_content: []

  render: ->
    {group, related_content} = @props
    groupDOM = null

    if rules[group].show
      className = group.replace(' ', '_')
      labels = if _.isFunction(rules[group].label) then _.map(related_content, rules[group].label) else rules[group].label

      groupDOM = <p className='task-step-group'>
          <i className="icon-md icon-#{className}"></i>
          <span className='task-step-group-label'>{labels}</span>
        </p>

    groupDOM

module.exports = ExerciseGroup
