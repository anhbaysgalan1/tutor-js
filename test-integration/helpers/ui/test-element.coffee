selenium = require 'selenium-webdriver'
_ = require 'underscore'
camelCase = require 'camelcase'
S = require '../../../src/helpers/string'

class TestItemHelper
  constructor: (test, testElementLocator, options = {}) ->
    throw new Error('BUG: Missing the current test!') unless test
    throw new Error('BUG: Missing locator') unless testElementLocator

    @test = test
    @locator = testElementLocator

    # Instrument all the methods of helpers to print using verboseWrap
    # so we can see where Selenium stopped
    _.each _.omit(@, Object.keys(TestItemHelper::), Object.keys(TestHelper::)), (value, key) =>
      # Wrap all functions!
      if _.isFunction(value) and not /^_locator/.test(key) # Exclude the _locator() function because that is used in waitUntil loops
        @[key] = (args...) =>
          @test.utils.verboseWrap("HELPER: #{key}", => value.apply(@, args))

    @fn = wrapHelperToFunction(@, options, _.keys(TestItemHelper::))

    @

  getLocator: (args...) =>
    locator = if _.isFunction(@locator)
      @locator(args...)
    else if _.isString(@locator)
      @test.utils.toLocator(@locator)
    else
      @locator

  get: (args...) =>
    locator = @getLocator(args...)
    @test.utils.wait.for(locator)

  getAll: (args...) =>
    locator = @getLocator(args...)
    @test.utils.wait.forMultiple(locator)

  findElement: (args...) =>
    locator = @getLocator(args...)
    @test.driver.findElement(locator)

  findElements: (args...) =>
    locator = @getLocator(args...)
    @test.driver.findElements(locator)

  forEach: (args..., forEachFunction, forEachFunction2) =>
    locator = @getLocator(args...)
    @test.utils.forEach(locator, forEachFunction, forEachFunction2)

  isPresent: (args...) =>
    locator = @getLocator(args...)
    @test.driver.isElementPresent(locator)

  isDisplayed: (args...) =>
    @isPresent(args...).then (isPresent) =>
      if isPresent
        locator = @getLocator(args...)
        el = @findElement(args...)
        el.isDisplayed()
      else
        false

  # Helper for the common case of `get(...).click()`.
  # Plus, it allows a place to add logging since this is one of the most
  # common places for Selenium to time out (trying to click on an element)
  click: (args...) =>
    locator = @getLocator(args...)
    # Scroll to the element so it is visible before clicking (this assumes `position: fixed` is overridden for all element)
    # @isDisplayed(args...).then (isDisplayed) =>
    #   unless isDisplayed
    #     el = @findElement(args...)
    #     @test.utils.windowPosition.scrollTo(el)
    @test.utils.verboseWrap "Clicking #{JSON.stringify(locator)}", =>
      el = @get(args...)
      @test.utils.windowPosition.scrollTo(el)
      el.click()

  waitClick: (args...) =>
    locator = @getLocator(args...)
    @test.utils.verbose "Waiting for #{JSON.stringify(locator)}"
    @test.utils.wait.for(locator)
    @click(args...)

  getParent: (args...) =>
    locator = @getLocator(args...)
    @test.utils.dom.getParent(locator)


class TestHelper
  constructor: (test, testElementLocator, commonElements, options) ->
    commonElements ||= _.result(@, 'elementRefs', {})
    defaultOptions =
      loadingLocator:
        css: '.is-loading'
      defaultWaitTime: 40 * 1000 # TODO: Letting tests define their own wait time is dangerous. tutor-dev takes > 10sec to delete a task-plan
      # defaultWaitTime: 20 * 1000 # 20sec seems to be enough for deployed code but not local

    @test = test
    @_options = _.assign {}, defaultOptions, options
    @_el = {}

    commonElements.loadingState = @options.loadingLocator
    commonElements.self = testElementLocator

    _.each commonElements, @setCommonElement
    @

  waitUntilLoaded: () =>
    # Adjust the test timeout *and* tell selenium to wait up to the same amount of time. Maybe this is redundant?
    @test.utils.wait.giveTime @options.defaultWaitTime, =>
      @test.utils.verboseWrap 'Waiting until Loadable .is-loading is gone', => @test.driver.wait(=>
        @el.loadingState().isPresent().then (isPresent) -> not isPresent
      , @options.defaultWaitTime)

  setCommonHelper: (name, helper) =>
    @el[name] = helper.fn or helper

  setCommonElement: (locator, name) =>
    @setCommonHelper(name, new TestItemHelper(@test, locator,
      onBeforeMethodCall: (methodName, args...) ->
        console.log "Deprecated call to el.#{name}.#{methodName}(...). Use el.#{name}(...).#{methodName}() instead"
    ))


wrapHelperToFunction = (helper, options, methodNames) ->

  helperFunction = (args...) ->
    wrappedMethods = {}

    # For each method, pass on args from helper function to method
    _.each methodNames, (methodName) ->
      if _.isFunction helper[methodName]
        wrappedMethods[methodName] = _.partial helper[methodName], args...

    # The helper function returns a fresh copy of
    # the helper extended with the wrapped methods.
    _.extend({}, helper, wrappedMethods)

  # expose each method on the function as well
  _.each methodNames, (methodName) ->
    helperFunction[methodName] = (args...) ->
      options.onBeforeMethodCall?(methodName, args...)
      helper[methodName](args...)

  helperFunction

# Using defined properties for access eliminates the possibility
# of accidental assignment
Object.defineProperties TestHelper.prototype,
  options:
    get: -> @_options
  el:
    get: -> @_el

module.exports = {TestHelper, TestItemHelper}
