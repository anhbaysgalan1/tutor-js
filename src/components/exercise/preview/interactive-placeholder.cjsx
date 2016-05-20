# coffeelint: disable=max_line_length

React = require 'react'

# Basically just an icon,
# create as plain class without this binding and never updates
class InteractivePlaceholder extends React.Component

  shouldComponentUpdate: ->
    false

  render: ->
    <svg className="placeholder interactive"
      version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
      viewBox="0 0 400 348"
    >
      <path fill="#5E6062"
        d="M374.8,0H25.2C11.3,0,0,11.3,0,25.2v229.7c0,13.9,11.3,25.2,25.2,25.2c0,0,0,0,0,0h160.4
          c-0.1,20.9-1.8,42.6-16.5,57.3H109c-2.9-0.1-5.4,2.1-5.5,5.1s2.1,5.4,5.1,5.5c0.2,0,0.3,0,0.5,0h182.8c2.9,0.1,5.4-2.1,5.5-5.1
          s-2.1-5.4-5.1-5.5c-0.2,0-0.3,0-0.5,0h-61.9c-14.7-14.7-16.4-36.4-16.5-57.3h161.4c13.9,0,25.2-11.3,25.2-25.2c0,0,0,0,0,0V25.2
          C400,11.3,388.7,0,374.8,0z"
      />
      <path fill="#FFFFFF"
        d="M27,17.1h346c6.6,0,12,5.4,12,12v222c0,6.6-5.4,12-12,12H27c-6.6,0-12-5.4-12-12v-222
          C15,22.5,20.4,17.1,27,17.1z"
      />
      <path fill="#5E6062"
        d="M222.1,60.5L128,82.1v95.8l48.3,39.9l95.8-25V96.9L222.1,60.5z M224.8,150.4v-33l-6.4,1.7v30.4l-34.3,9v6.6
          l36.8-9.6l41.1,33.5l-81.8,21.3V125l85.4-22.2v80.8L224.8,150.4z M134.4,171.4v-80l39.5,32.9v83.3l-36.7-30.3l32.9-8.6v-6.6
          L134.4,171.4z M224.9,102.9V70.4l36.7,26.8l-84,21.9l-39.4-32.8l80.3-18.5v36.8L224.9,102.9z"
      />
    </svg>

module.exports = InteractivePlaceholder
