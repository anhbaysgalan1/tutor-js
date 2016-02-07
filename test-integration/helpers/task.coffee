selenium = require 'selenium-webdriver'
_ = require 'underscore'

{TestHelper} = require './test-element'

COMMON_ELEMENTS =
  continueButton:
    css: '.continue'
  enabledContinueButton:
    css: '.continue:not([disabled])'
  stepCrumbs:
    css: '.task-breadcrumbs-step'

# all convenience functions for helping with task tests will be seen here.
class TaskHelper extends TestHelper
  constructor: (test, testElementLocator) ->

    testElementLocator ?= '.task-reading, .task-homework'
    super(test, testElementLocator, COMMON_ELEMENTS)

  continue: =>
    continueButton = @el.continueButton.get()
    @test.utils.verboseWrap 'Waiting for continue button to be enabled', => @test.driver.wait selenium.until.elementIsEnabled(continueButton)
    @test.utils.verboseWrap 'Clicking continue button', => continueButton.click()

module.exports = {TaskHelper}
