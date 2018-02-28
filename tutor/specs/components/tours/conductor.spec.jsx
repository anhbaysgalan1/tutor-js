import TourConductor from '../../../src/components/tours/conductor';
import { SpyModeContext } from 'shared/components/spy-mode';
import User from '../../../src/models/user';

jest.mock('../../../src/models/user', () => ({
  resetTours: jest.fn(),
}));

describe('Tour Conductor', () => {
  let props, spyMode;

  beforeEach(() => {
    spyMode = new SpyModeContext();
    props = {
      spyMode,
    };
  });

  it('replays tours when spy mode is triggered', () => {
    mount(<TourConductor {...props}><span>Hi</span></TourConductor>);
    spyMode.isEnabled = true;
    expect(User.resetTours).toHaveBeenCalled();
  });

});
