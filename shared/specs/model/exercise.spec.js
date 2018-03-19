import Factories from '../factories';

describe('Exercise Model', () => {
  let exercise;
  beforeEach(() => exercise = Factories.exercise({}));

  it('can be created from fixture and serialized', () => {
    expect(exercise.serialize()).toMatchObject({
      version: expect.any(Number),
    });
  });

});
