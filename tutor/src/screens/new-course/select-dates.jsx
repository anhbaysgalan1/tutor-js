import React from 'react';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import { partial } from 'lodash';
import { Listing, Choice } from '../../components/choices-listing';
import OfferingUnavailable from './offering-unavail';
import BuilderUX from './ux';

@observer
export default class SelectDates extends React.PureComponent {

  static title = 'When will you teach this course?';

  static propTypes = {
    ux: React.PropTypes.instanceOf(BuilderUX).isRequired,
  }

  @action.bound
  onSelect(term) {
    this.props.ux.newCourse.term = term;
  }

  render() {
    const { ux, ux: { offering } } = this.props;
    if (!offering) {
      return <OfferingUnavailable />;
    }

    return (
      <Listing>
        {offering.validTerms.map((term, index) =>
          <Choice
            key={index}
            active={ux.newCourse.term === term}
            onClick={partial(this.onSelect, term)}
            >
            <span className="term">
              {term.term}
            </span>
            <span className="year">
              {term.year}
            </span>
          </Choice>)}
      </Listing>
    );
  }
}
