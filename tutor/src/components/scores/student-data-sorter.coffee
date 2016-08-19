_ = require 'underscore'

FIRST_DATA_COLUMN = 2

percent = (num, total) ->
  Math.round((num / total) * 100) or 0


getSortValue = (student, key, dataType, displayAs) ->

  return (student.last_name or student.name).toLowerCase() unless _.isNumber(key)

  index = key - FIRST_DATA_COLUMN
  record = student.data[index]
  return -1 unless record

  result = switch record.type
    when 'reading'
      progress =
        if record.is_late_work_accepted
          record.completed_step_count
        else
          record.completed_on_time_step_count
      percent(progress, record.step_count)
    when 'homework'
      switch dataType
        when 'score'
          score =
            if record.is_late_work_accepted
              record.correct_exercise_count
            else
              record.correct_on_time_exercise_count
          if displayAs is 'number'
            score or 0
          else
            percent(score, record.exercise_count)
        when 'completed'
          progress =
            if record.is_late_work_accepted
              record.completed_exercise_count
            else
              record.completed_on_time_exercise_count
          percent(progress, record.exercise_count)
    when 'concept_coach'
      switch dataType
        when 'score'
          score = record.correct_exercise_count
          if displayAs is 'number'
            score or 0
          else
            percent(score, record.exercise_count) or 0
        when 'completed'
          progress = record.completed_exercise_count
          percent(progress, record.exercise_count)



StudentDataSorter = ({sort, dataType, displayAs}) ->

  return (a, b) ->
    a = getSortValue(a, sort.key, dataType, displayAs)
    b = getSortValue(b, sort.key, dataType, displayAs)
    cmp = if a < b then -1 else if a > b then 1 else 0
    return if sort.asc then cmp else (cmp * -1)

module.exports = StudentDataSorter
