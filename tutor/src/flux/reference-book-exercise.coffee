{CrudConfig, makeSimpleStore, extendConfig} = require './helpers'
_ = require 'underscore'

LOADING = 'loading'
QUERY_START_STRING = '?q='

combineQueries = (multipleUrls) ->
  params = {}
  tags = _.map(multipleUrls, (url) ->
    queryString = decodeURIComponent(url.split(QUERY_START_STRING)[1])
    [param, value] = queryString.split(':')
    # trim individual tag of double quotes
    value = value.replace(/^"(.+(?="$))"$/, '$1')
    params[param] ?= []
    params[param].push(value)

    return value if param is 'tag'
  )
  urlsAndTags = _.object(multipleUrls, tags)
  queryStrings = _.map(params, (values, paramKey) ->
    # join values and wrap all values with a single pair of double quotes
    "#{paramKey}:\"#{values.join(',')}\""
  )
  queryString = queryStrings.join(' ')

  {queryString, urlsAndTags}

getMultipleUrl = (multipleUrls, baseUrl) ->
  {queryString} = combineQueries(multipleUrls)

  "#{baseUrl}?q=#{queryString}"

ReferenceBookExerciseConfig = {
  _toSeparate: {}

  loadMultiple: (multipleUrls) ->
    baseUrl = _.first(multipleUrls).split(QUERY_START_STRING)[0]
    {queryString, urlsAndTags} = combineQueries(multipleUrls, baseUrl)
    url = "#{baseUrl}?q=#{queryString}"

    @_toSeparate[url] = urlsAndTags

  _loaded: (obj, id) ->
    if @_toSeparate[id]?
      _.each(@_toSeparate[id], (tag, url) =>
        exercise = _.find(obj.items, (item) ->
          item.tags.indexOf(tag) > -1
        )
        exerciseObj =
          items: [exercise]
        @loaded(exerciseObj, url)
      )

      delete @_toSeparate[id]
      @emit('loaded.multiple')
    else
      @emit("loaded.#{id}")

    obj


  exports:
    isQueued: (id) ->
      _.chain(@_toSeparate)
        .find((urlsAndTags) ->
          urlsAndTags[id]?
        )
        .isObject()
        .value()
}

extendConfig(ReferenceBookExerciseConfig, new CrudConfig())
{actions, store} = makeSimpleStore(ReferenceBookExerciseConfig)
module.exports = {ReferenceBookExerciseActions:actions, ReferenceBookExerciseStore:store}
