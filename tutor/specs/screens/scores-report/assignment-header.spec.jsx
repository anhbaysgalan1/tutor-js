import { React, SnapShot, Wrapper } from '../../components/helpers/component-testing';
import bootstrapScores from '../../helpers/scores-data.js';
import UX from '../../../src/screens/scores-report/ux';
import Header from '../../../src/screens/scores-report/assignment-header';

describe('Scores Report: assignment column header', function() {
  let props;
  let heading;

  beforeEach(function() {
    const { course, period } = bootstrapScores();
    heading = period.data_headings[0];
    const ux = new UX(course);
    props = {
      courseId: course.id,
      ux,
      columnIndex: 0,
      onSort: jest.fn(),
      sort: {},
      period: ux.period,
    };
  });

  it('renders and matches snapshot', () => {
    const wrapper = shallow(<Header {...props} />);
    expect(wrapper.find('.header-cell.title').render().text()).toEqual(heading.title);
    expect(wrapper).toHaveRendered('Time');
    expect(SnapShot.create(
      <Wrapper _wrapped_component={Header} noReference={true} {...props} />).toJSON()
    ).toMatchSnapshot();
  });

  it('renders properly when average is undefined for an external assignment', () => {
    props.columnIndex = 2;
    props.ux.periodTasksByType.external.average_progress = undefined

    const wrapper = shallow(<Header {...props} />);
    expect(wrapper.render().find('.click-rate').text()).toEqual('0% clicked on time');
  });

  describe('for a CC course', function() {
    let wrapper;
    beforeEach(function() {
      props.isConceptCoach = true;
      wrapper = shallow(<Header {...props} />);
    });

    it('sets className', function() {
      expect(wrapper).toHaveRendered('.header-cell.cc');
    });

    it('hides due date', function() {
      expect(wrapper).not.toHaveRendered('Time');
    });

    it('matches snapshot', function() {
      expect(SnapShot.create(
        <Wrapper _wrapped_component={Header} noReference={true} {...props} />).toJSON()
      ).toMatchSnapshot();
    });
  });
});
