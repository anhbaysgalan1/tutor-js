{
  BASE_CONFIG,
  mergeWebpackConfigs,
  makeBaseForEnvironment,
  getEnvironmentName,
  ENVIRONMENT_ALIASES
} = require './base'

conditionalRequire = (path) ->
  try
    require path
  catch e
    {}

makeConfig = (projectName, environmentName) ->
  environmentName = getEnvironmentName(environmentName)
  environmentFilename = if ENVIRONMENT_ALIASES[environmentName]
    ENVIRONMENT_ALIASES[environmentName]
  else
    environmentName

  projectBaseConfig = require "../../#{projectName}/configs/base"
  projectWebpackBaseConfig =
    conditionalRequire("../../#{projectName}/configs/webpack.base")
  projectWebpackEnvironmentConfig =
    conditionalRequire(
      "../../#{projectName}/configs/webpack.#{environmentFilename}"
    )

  mergeWebpackConfigs(
    BASE_CONFIG,
    makeBaseForEnvironment(environmentName)(projectBaseConfig),
    projectWebpackBaseConfig,
    projectWebpackEnvironmentConfig
  )

module.exports = makeConfig
