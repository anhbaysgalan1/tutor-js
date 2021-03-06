import React from 'react';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import { autobind } from 'core-decorators';
import ExerciseCard from './exercise-card';
import Loading from '../../components/loading-screen';
import UX from './ux';

@observer
export default class Exercises extends React.Component {

  static propTypes = {
    ux: React.PropTypes.instanceOf(UX).isRequired,
  };

  @autobind renderExercise(exercise) {
    return (
      <ExerciseCard key={exercise.id} exercise={exercise} ux={this.props.ux} />
    );
  }

  render() {
    const { ux } = this.props;
    if (ux.isFetchingExercises) {
      return <Loading message="Fetching Exercises…" />;
    }

    if (isEmpty(ux.exercises)) { return <h1>No exercises found</h1>; }

    return (
      <div className="exercises">
        {ux.exercises.map(this.renderExercise)}
      </div>
    );
  }

}
