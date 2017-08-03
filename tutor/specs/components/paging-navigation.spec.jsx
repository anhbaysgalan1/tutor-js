import { SnapShot } from './helpers/component-testing';

import Nav from '../../src/components/paging-navigation';


function TestComponent() {
  return <h1>Imma child</h1>;
}

describe('Student Enrollment', () => {
  let props;

  beforeEach(() => {
    props = {
      documentImpl: {
        title: 'test',
      },
      className: 'my-nav-test',
      onForwardNavigation:  jest.fn(),
      onBackwardNavigation: jest.fn(),
      isForwardEnabled:     true,
      isBackwardEnabled:    true,
      titles: {
        next: 'The Page That Comes After This One',
        current: 'Set From Nav',
        previous: 'The Page Before This One',
      },
    };
  });

  it('renders and matches snapshot', () => {
    expect(SnapShot.create(<Nav {...props}><TestComponent /></Nav>).toJSON()).toMatchSnapshot();
  });

  it('sets titles', () => {
    const nav = shallow(<Nav {...props}><TestComponent /></Nav>);
    expect(props.documentImpl.title).toEqual('Set From Nav');
    expect(nav).toHaveRendered(`a.next[title="${props.titles.next}"]`);
    expect(nav).toHaveRendered(`a.prev[title="${props.titles.previous}"]`);
  });

  it('calls prop fns', () => {
    const nav = shallow(<Nav {...props}><TestComponent /></Nav>);
    const preventDefault = jest.fn();
    nav.find('a.next').simulate('click', { preventDefault });
    expect(props.onForwardNavigation).toHaveBeenCalled();
    nav.find('a.prev').simulate('click', { preventDefault } );
    expect(props.onBackwardNavigation).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledTimes(2);
  });
});
