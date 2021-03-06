import FactoryBot from 'object-factory-bot';
import { each, camelCase, range } from 'lodash';
import '../../../shared/specs/factories';
import faker from 'faker';
import Course from '../../src/models/course';
import TutorExercise from '../../src/models/exercises/exercise';
import Book from '../../src/models/reference-book';
import TaskPlanStat from '../../src/models/task-plan/stats';
import { Offering } from '../../src/models/course/offerings';
import { CoursesMap } from '../../src/models/courses-map';
import { EcosystemsMap, Ecosystem } from '../../src/models/ecosystems';
import { ExercisesMap } from '../../src/models/exercises';
import { ResearchSurvey } from '../../src/models/research-surveys/survey';
import StudentDashboardTask from '../../src/models/student/task';

import './research_survey';
import './dashboard';
import './course';
import './book';
import './task-plan-stats';
import './ecosystem';
import './exercise';
import './scores';
import './offering';

const Factories = {};

each({
  Course,
  TutorExercise,
  Book,
  Ecosystem,
  TaskPlanStat,
  ResearchSurvey,
  Offering,
  StudentDashboardTask,
}, (Model, name) => {
  Factories[camelCase(name)] = (attrs = {}) => {
    const o = FactoryBot.create(name, attrs);
    return new Model(o);
  };
});

Factories.setSeed = (seed) => faker.seed(seed);

Factories.data = (...args) => FactoryBot.create(...args);

Factories.coursesMap = ({ count = 2, ...attrs } = {}) => {
  const map = new CoursesMap();
  map.onLoaded({ data: range(count).map(() => FactoryBot.create('Course', attrs)) });
  return map;
};


Factories.ecosystemsMap = ({ count = 4 } = {}) => {
  const map = new EcosystemsMap();
  map.onLoaded({ data: range(count).map(() => FactoryBot.create('Ecosystem')) });
  return map;
};

Factories.pastTaskPlans = ({ course, count = 4 }) => {
  course.pastTaskPlans.onLoaded({ data: {
    items: range(count).map(() => FactoryBot.create('TeacherDashboardTask', { course })),
  } });
};

Factories.taskPlans = ({ course, count = 4 }) => {
  course.taskPlans.onLoaded({ data: {
    plans: range(count).map(() => FactoryBot.create('TeacherDashboardTask', { course })),
  } });
};

Factories.studentTasks = ({ course, count = 4, attributes = {} }) => {
  course.studentTasks.onLoaded({ data: {
    tasks: range(count).map(() => FactoryBot.create('StudentDashboardTask',
      Object.assign({ course }, attributes)
    )),
  } });
};

Factories.scores = ({ course }) => {
  course.scores.onFetchComplete({
    data: course.periods.map(period => FactoryBot.create('ScoresForPeriod', { period })),
  });
};

Factories.exercisesMap = ({ book, pageIds = [], count = 4 } = {}) => {
  const map = new ExercisesMap();
  if (!book) { return map; }
  pageIds.forEach(pgId => {
    map.onLoaded(
      { data: { items: range(count).map(() => FactoryBot.create('TutorExercise', {
        page_uuid: book.pages.byId.get(pgId).uuid,
      })) } },
      [{ book, page_ids: [ pgId ] }]
    );
  });
  return map;
};


export { FactoryBot, faker };
export default Factories;
