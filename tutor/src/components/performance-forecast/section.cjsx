React = require 'react'
BS = require 'react-bootstrap'
Router = require 'react-router'
{ChapterSectionMixin} = require 'shared'
ChapterSectionType  = require './chapter-section-type'
ProgressBar = require './progress-bar'
Statistics  = require './statistics'


module.exports = React.createClass

  displayName: 'PerformanceForecastSection'

  propTypes:
    courseId: React.PropTypes.string.isRequired
    roleId:   React.PropTypes.string
    section:  ChapterSectionType.isRequired
    canPractice: React.PropTypes.bool

  mixins: [ChapterSectionMixin]

  render: ->
    {courseId, section} = @props

    <div className='section'>
      <div className='heading'>
        <span className='number'>
          {@sectionFormat(section.chapter_section)}
        </span>
        <span className='title' title={section.title}>{section.title}</span>
      </div>

      <ProgressBar {...@props} />
      <Statistics
      courseId={@props.courseId}
      roleId={@props.roleId}
      section={section}
      displaying="section" />

    </div>
