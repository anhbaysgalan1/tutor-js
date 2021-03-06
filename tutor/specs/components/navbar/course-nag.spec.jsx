import CourseNag from '../../../src/components/navbar/course-nag';
import TourContext from '../../../src/models/tour/context';
import { observable } from 'mobx';
import Onboarding from '../../../src/models/course/onboarding/base';

jest.mock('../../../src/models/tour/context', () => (
  class MockContext {
    tour: {}
  }
));

function SomethingToDo() { return <span>Hi!</span>; }

describe('Second Session Warning', () => {

  let ux, tourContext, props, spyMode;

  beforeEach(() => {
    ux = observable.object({
      nagComponent: SomethingToDo,
      course: {
        isActive: true, primaryRole: { joined_at: new Date } },
    });
    spyMode = observable.object({ isEnabled: false });
    tourContext = new TourContext();
    props = {
      spyMode,
      tourContext,
    };
  });

  it('renders and matches snapshot', () => {
    const nag = mount(<CourseNag {...props}/>);
    expect(nag).toHaveRendered('CourseNagModal');
  });

  it('replays tours when spy mode is triggered', () => {
    const nag = mount(<CourseNag {...props} />);
    const onboarding = new Onboarding(ux.course, tourContext);
    expect(onboarding.courseIsNaggable).toBe(false);
    spyMode.isEnabled = true;
    nag.setProps({ spyMode });
    expect(onboarding.courseIsNaggable).toBe(true);
  });

});
