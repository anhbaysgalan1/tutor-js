React = require('react')
{Exercise} = require('./components')
config = require('./test')
HTMLBars = require('./htmlbars')


randRange = (min, max) ->
  Math.floor(Math.random() * (max - min + 1)) + min

# Generate the variables
state = {}
for key, val of config.logic.inputs
  state[key] = randRange(val.start, val.end)

for key, val of config.logic.outputs
  val = val(state)
  try
    val = parseInt(val)
    # Inject commas
    val = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  catch
    ''
  state[key] = val

# -------------------------------
# Generate the HTML using HTMLBars

DIV = document.createElement('div')

transformToString = (val, state) ->
  DIV.innerHTML = ''
  fragment = HTMLBars(val)(state)
  DIV.appendChild(fragment)
  DIV.innerHTML

barsify = (obj) ->
  if typeof obj is 'object'
    if obj.formats
      # Build each variant
      obj.variants = {}
      for format in obj.formats
        variant = switch format
          when 'multiple-choice' then {stem:obj.stem, answers:obj.answers}
          when 'multiple-select' then {stem:obj.stem, answers:obj.answers}
          when 'matching' then {stem:obj.stem, answers:obj.answers, items:obj.items}
          when 'true-false'
            a = obj.answers[0]
            o =
              stem: obj.stem.replace(/____/, a.content or a.value)
              answers: obj.answers
            o
          else # 'short-answer' or 'fill-in-the-blank'
            o =
              stem: obj.stem.replace(/____/, '<input type="text"/>')
              answers: obj.answers
            o

        obj.variants[format] = variant

    for key, val of obj
      if typeof val is 'string'
        obj[key] = transformToString(val, state)
      else
        obj[key] = barsify(val)
  obj

barsify(config)

root = document.getElementById('exercise')
root.innerHTML = ''
React.renderComponent(Exercise({config}), root)
