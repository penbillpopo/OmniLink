import { TimeTracker } from './time-tracker';

describe('time-tracker', () => {
  it('normal', () => {
    const tracker = new TimeTracker('TEST');
    const A = tracker.deep('A');
    A.step('A-1');
    A.step('A-2');
    A.step('A-3');
    A.complete();
    tracker.step('B');
    tracker.step('C');
    const D = tracker.deep('D');
    D.step('D-1');
    D.step('D-2');
    D.step('D-3');
    D.complete();
    tracker.complete();
    expect(tracker.toString()).toEqual(
      [
        'TEST : 0.00s',
        '  ├ A : 0.00s',
        '  │ ├ A-1 : 0.00s',
        '  │ ├ A-2 : 0.00s',
        '  │ └ A-3 : 0.00s',
        '  ├ B : 0.00s',
        '  ├ C : 0.00s',
        '  └ D : 0.00s',
        '    ├ D-1 : 0.00s',
        '    ├ D-2 : 0.00s',
        '    └ D-3 : 0.00s',
      ].join('\n'),
    );
  });
});
