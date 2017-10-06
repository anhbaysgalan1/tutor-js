# For handling steps logic outside of breadcrumb and task review rendering.
_ = require 'underscore'
camelCase = require 'lodash/camelCase'

{TaskTeacherReviewStore} = require '../../flux/task-teacher-review'

module.exports =
  _pages: ['current_pages', 'spaced_pages']

  _setChapterSectionOnQuestions: (page) ->
    chapter_section = page.chapter_section
    title = page.title

    _.each page.exercises, (exercise) ->
      exercise.chapter_section = chapter_section
      exercise.title = title

      _.each exercise.content.questions, (question) ->
        question.chapter_section = chapter_section

  _getStatsForPeriod: (review, period) ->
    # return overview stats for now
    return _.first(review.stats) unless period?.id?

    _.findWhere(review.stats, {period_id: period.id})

  _getExercisesFromStats: (stats) ->
    return [] unless stats
    pagedExercises = _.map @_pages, (page) =>
      # exercises = _.clone(_.pluck(stats[page], 'exercises'))
      exercises = _.chain(stats[page])
        .clone()
        .each(@_setChapterSectionOnQuestions)
        .pluck('exercises')
        .flatten(true)
        .compact()
        .value()

      exercises.for = page
      exercises

    _.flatten(pagedExercises, true)

  _makeCrumb: (data) ->
    crumb =
      data: data
      type: 'exercise'
      listeners: @_getStepListeners('exercise')

    if data.length
      crumb.sectionLabel = @_buildSectionLabel(data[0].chapter_section)

      _.each crumb.data, (data) ->
        data.sectionLabel = crumb.sectionLabel
        data.content = JSON.parse(data.content) if _.isString(data.content)

    else
      crumb.sectionLabel = @_buildSectionLabel(data.chapter_section)
      crumb.data.sectionLabel = crumb.sectionLabel
      crumb.data.content = JSON.parse(crumb.data.content) if _.isString(crumb.data.content)

    crumb

  _indexCrumb: (crumb, index) ->
    crumb.key = index

    if crumb.data.length
      _.each crumb.data, (data) ->
        data.key = crumb.key
    else
      crumb.data.key = index


  _getCrumbsForHomework: (stats) ->
    exercises = @_getExercisesFromStats(stats)
    crumbs = _.chain(exercises)
      .map((data) =>
        stepCrumbs = []
        mainCrumb = @_makeCrumb(data)
        {questions} = mainCrumb.data.content
        stepCrumbs.push(mainCrumb)
        _.chain(questions).rest(1).each((question) =>
          stepCrumbs.push(@_makeCrumb(_.pick(data, 'chapter_section', 'average_step_number', 'question_stats')))
        )
        stepCrumbs
      )
      .flatten()
      .value()

    _.each(crumbs, @_indexCrumb)

    crumbs

  _getCrumbsForReading: (stats) ->
    exercises = @_getExercisesFromStats(stats)
    crumbs = _.chain(exercises)
      .groupBy('chapter_section')
      .map(@_makeCrumb)
      .each(@_indexCrumb)
      .value()

    crumbs

  _getCrumbsForExternal: ->
    []

  _getContentsForHomework: (crumbs) ->
    contents = _.pluck(crumbs, 'data')

  _getContentsForReading: (crumbs) ->
    _.chain(crumbs)
      .pluck('data')
      .map((data) ->

        content = _.clone(data)
        # grab the title, key, and section label for headings
        {title, key, sectionLabel} = data[0]

        content.unshift({sectionLabel, title, key})

        content
      )
      .flatten(true)
      .value()


  _getContentsForExternal: ->
    []

  _getStepListeners: (stepType) ->
    #   One per step for the crumb status updates
    #   Two additional listeners for step loading and completion
    #     if there are placeholder steps.
    listeners =
      placeholder: 3

    listeners[stepType] or 1

  _buildSectionLabel: (chapter_section) ->
    sectionLabel = @sectionFormat?(chapter_section, @props.sectionSeparator) if chapter_section?

  _generateCrumbsFromStats: (stats, type) ->
    getCrumbs = camelCase("get-crumbs-for-#{type}")

    crumbs = @["_#{getCrumbs}"](stats)

  _generateCrumbs: (id, period) ->
    review = TaskTeacherReviewStore.get(id)
    stats = @_getStatsForPeriod(review, period)

    crumbs = @_generateCrumbsFromStats(stats, review.type)

  generateCrumbs: (period) ->
    {id} = @props
    period ?= @state.period

    periodCrumbs = @_generateCrumbs id, period
    _.sortBy(periodCrumbs, (crumb) ->
      crumb.data.average_step_number
    )

  getContents: (period) ->
    {id} = @props
    period ?= @state.period

    review = TaskTeacherReviewStore.get(id)

    allCrumbs = @generateCrumbs(period)
    getContents = camelCase("get-contents-for-#{review.type}")

    contents = @["_#{getContents}"](allCrumbs)

  getMaxListeners: ->
    crumbs = @generateCrumbs()
    listeners = _.reduce crumbs, (memo, crumb) ->
      memo + crumb.listeners
    , 0
