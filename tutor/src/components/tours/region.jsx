import React from 'react';
import { inject, observer } from 'mobx-react';
import invariant from 'invariant';
import TourRegionModel from '../../models/tour/region';
import TourContext from '../../models/tour/context';

import { delay } from 'lodash';

@inject((allStores, props) => ({
  tourContext: ( props.tourContext || allStores.tourContext ),
}))
@observer
export default class TourRegion extends React.PureComponent {

  static defaultProps = {
    courseId: undefined,
    tag: 'div',
    className: '',
    tourContext: undefined,
    delay: 500,
  }

  static propTypes = {
    id: React.PropTypes.string.isRequired,
    // will default to id if tours is not given
    otherTours: React.PropTypes.arrayOf(React.PropTypes.string),
    courseId: React.PropTypes.string,
    children: React.PropTypes.node.isRequired,
    tourContext: React.PropTypes.instanceOf(TourContext),
    tag: React.PropTypes.string,
    delay: React.PropTypes.number,
    className: React.PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.region = new TourRegionModel(props);
  }

  componentDidMount() {
    if (this.props.tourContext) {
      delay(() => this.props.tourContext.openRegion(this.region), this.delay);
    }
  }

  // not really sure this is needed, but we may update the courseId somwhere
  componentWillReceiveProps({ id, tours, courseId }) {
    invariant(id === this.props.id,
              `Cannot update region id, was ${this.props.id} attempted to set ${id}`);
    if (tours) { this.region.tour_ids = tours; }
    this.region.courseId = courseId;
  }

  componentWillUnmount() {
    if (this.props.tourContext) {
      this.props.tourContext.closeRegion(this.region);
    }
  }

  render() {
    const { tag, className } = this.props;
    return React.createElement(tag, {
      className,
      'data-tour-region-id': this.props.id,
      ref: ref => (this.wrapperEl = ref),
    }, this.props.children);
  }

}
