import Factory, { FactoryBot } from '../../factories';
import { slice } from 'lodash';
import { SnapShot, Wrapper } from '../../components/helpers/component-testing';
import EnzymeContext from '../../components/helpers/enzyme-context';
import Dashboard from '../../../src/screens/question-library/dashboard';
import ExerciseHelpers from '../../../src/helpers/exercise';

jest.mock('../../../../shared/src/components/html', () => ({ html }) =>
  html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null
);
jest.mock('../../../src/helpers/exercise');

describe('Questions Dashboard Component', function() {
  let props, course, exercises, book, page_ids;

  beforeEach(function() {
    course = Factory.course();
    book = course.referenceBook;
    course.referenceBook.onApiRequestComplete({ data: [FactoryBot.create('Book')] });
    exercises = Factory.exercisesMap({ ecosystem_id: course.ecosystem_id, pageIds: [], count: 0 });

    exercises.fetch = jest.fn(() => Promise.resolve());
    page_ids = slice(course.referenceBook.pages.byId.keys(), 2, 5);
    const items = page_ids.map(page_id =>
      FactoryBot.create('TutorExercise', {
        pool_types: ['reading_dynamic'],
        page_uuid: book.pages.byId.get(page_id).uuid }),
    );
    exercises.onLoaded({ data: { items } }, [{ book, page_ids }]);
    props = {
      course,
      exercises,
    };
  });

  const displayExercises = () => {
    const dash = mount(<Dashboard {...props} />, EnzymeContext.build());
    dash.find('.chapter-heading .tutor-icon').at(1).simulate('click');
    dash.find('.section-controls .btn-primary').simulate('click');
    return dash;
  };

  it('matches snapshot', () => {
    const dash = SnapShot.create(<Wrapper _wrapped_component={Dashboard} {...props} />);
    expect(dash.toJSON()).toMatchSnapshot();
    dash.unmount();
  });

  it('fetches and displays', () => {
    const dash = mount(<Dashboard {...props} />, EnzymeContext.build());
    expect(dash).not.toHaveRendered('.no-exercises');
    dash.find(`[data-page-id="${page_ids[0]}"]`).simulate('click');
    dash.find('.section-controls .btn-primary').simulate('click');
    expect(dash).not.toHaveRendered('.no-exercises');
    dash.unmount();
  });

  it('renders exercise details', () => {
    const dash = displayExercises();
    expect(dash).not.toHaveRendered('.no-exercises');
    dash.find('.action.details').at(0).simulate('click');
    expect(dash).toHaveRendered('.exercise-details');
    dash.unmount();
  });

  it('can exclude exercises', () => {
    const dash = displayExercises();
    expect(dash).not.toHaveRendered('.no-exercises');
    dash.find('.action.details').at(0).simulate('click');
    expect(dash).toHaveRendered('.exercise-details');
    course.saveExerciseExclusion = jest.fn();
    const uid = dash.find('[data-exercise-id]').last().prop('data-exercise-id');
    const exercise = exercises.array.find(e => uid == e.content.uid);
    dash.find(`[data-exercise-id="${uid}"] .action.exclude`).simulate('click');
    expect(course.saveExerciseExclusion).toHaveBeenCalledWith({ exercise, is_excluded: true });
    dash.unmount();
  });

  it('can report errors', () => {
    const dash = displayExercises();
    expect(dash).not.toHaveRendered('.no-exercises');
    dash.find('.action.details').at(0).simulate('click');
    dash.find('.action.report-error').simulate('click');
    const uid = dash.find('[data-exercise-id]').last().prop('data-exercise-id');
    const exercise = exercises.array.find(e => uid == e.content.uid);
    expect(ExerciseHelpers.openReportErrorPage).toHaveBeenCalledWith(exercise, course);
    dash.unmount();
  });

});
