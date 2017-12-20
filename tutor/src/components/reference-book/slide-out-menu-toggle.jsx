/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// coffeelint: disable=max_line_length

import React from 'react';

function SlideOutMenuToggle(props) {
  // The css also sets the transistion,
  // but it must also be specified in the SVG because IE doesn't support animations
  const transform = props.isMenuVisible ?
    { triangle: 'translate(0 0)', line: 'scale(1 1) translate(0 0)' }
    :
    { triangle: 'translate(-30 0)', line: 'scale(2 1) translate(-50 0)' };

  return (

    (
      <svg
        className="slide-out-menu-toggle"
        width={props.width}
        height={props.height}
        viewBox="0 0 100 100"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g id="icon-list-open">
            <path
              id="line1"
              d="M99.961,15.874l0,-13.636c0,-0.615 -0.177,-1.148 -0.531,-1.598c-0.353,-0.45 -0.772,-0.674 -1.255,-0.674l-96.424,0c-0.483,0 -0.902,0.224 -1.255,0.674c-0.354,0.45 -0.53,0.983 -0.53,1.598l0,13.636c0,0.615 0.176,1.148 0.53,1.598c0.353,0.45 0.772,0.674 1.255,0.674l96.424,0c0.483,0 0.902,-0.224 1.255,-0.674c0.354,-0.45 0.531,-0.983 0.531,-1.598Z" />
            <path
              id="line2"
              transform={transform.line}
              d="M99.961,43.145l0,-13.635c0,-0.616 -0.177,-1.149 -0.531,-1.598c-0.353,-0.45 -0.772,-0.675 -1.255,-0.675l-60.711,0c-0.484,0 -0.902,0.225 -1.256,0.675c-0.353,0.449 -0.53,0.982 -0.53,1.598l0,13.635c0,0.616 0.177,1.148 0.53,1.598c0.354,0.45 0.772,0.675 1.256,0.675l60.711,0c0.483,0 0.902,-0.225 1.255,-0.675c0.354,-0.45 0.531,-0.982 0.531,-1.598Z" />
            <path
              id="line3"
              transform={transform.line}
              d="M99.961,70.417l0,-13.636c0,-0.616 -0.177,-1.148 -0.531,-1.598c-0.353,-0.45 -0.772,-0.675 -1.255,-0.675l-60.711,0c-0.484,0 -0.902,0.225 -1.256,0.675c-0.353,0.45 -0.53,0.982 -0.53,1.598l0,13.636c0,0.615 0.177,1.148 0.53,1.597c0.354,0.45 0.772,0.675 1.256,0.675l60.711,0c0.483,0 0.902,-0.225 1.255,-0.675c0.354,-0.449 0.531,-0.982 0.531,-1.597Z" />
            <path
              id="line4"
              d="M99.961,97.688l0,-13.636c0,-0.615 -0.177,-1.148 -0.531,-1.598c-0.353,-0.45 -0.772,-0.674 -1.255,-0.674l-96.424,0c-0.483,0 -0.902,0.224 -1.255,0.674c-0.354,0.45 -0.53,0.983 -0.53,1.598l0,13.636c0,0.615 0.176,1.148 0.53,1.598c0.353,0.45 0.772,0.675 1.255,0.675l96.424,0c0.483,0 0.902,-0.225 1.255,-0.675c0.354,-0.45 0.531,-0.983 0.531,-1.598Z" />
            <path
              id="triangle"
              transform={transform.triangle}
              d="M21.393,70.417l0,-40.907c0,-0.616 -0.177,-1.149 -0.53,-1.598c-0.353,-0.45 -0.772,-0.675 -1.256,-0.675c-0.52,0 -0.948,0.213 -1.283,0.639l-16.071,20.454c-0.334,0.426 -0.502,0.97 -0.502,1.633c0,0.663 0.168,1.207 0.502,1.633l16.071,20.454c0.335,0.426 0.763,0.639 1.283,0.639c0.484,0 0.903,-0.225 1.256,-0.675c0.353,-0.449 0.53,-0.982 0.53,-1.597Z" />
          </g>
        </g>
      </svg>
    )

  );
}

SlideOutMenuToggle.defaultProps = { height: 28, width: 28 };

SlideOutMenuToggle.propTypes = {
  isMenuVisible: React.PropTypes.bool.isRequired,
};

export default SlideOutMenuToggle;
