import { describe, it, expect } from 'vitest';
import { scoreSkinType, SKIN_QUESTIONS, SKIN_RESULTS } from './skinTypeConfig';

describe('scoreSkinType (mini-quiz answer → skin type mapping)', () => {
  it('returns the type picked by the majority of answers', () => {
    expect(scoreSkinType({ sq1: 'oily', sq2: 'oily', sq3: 'oily', sq4: 'dry' })).toBe('oily');
    expect(scoreSkinType({ sq1: 'dry', sq2: 'dry', sq3: 'dry', sq4: 'dry' })).toBe('dry');
    expect(scoreSkinType({ sq1: 'normal', sq2: 'normal', sq3: 'sensitive', sq4: 'normal' })).toBe('normal');
    expect(scoreSkinType({ sq1: 'combination', sq2: 'combination', sq3: 'oily', sq4: 'normal' })).toBe('combination');
  });

  it('breaks ties deterministically by priority (combination > oily > dry > sensitive > normal)', () => {
    expect(scoreSkinType({ sq1: 'oily', sq2: 'combination', sq3: 'oily', sq4: 'combination' })).toBe('combination');
    expect(scoreSkinType({ sq1: 'dry', sq2: 'oily', sq3: 'dry', sq4: 'oily' })).toBe('oily');
    expect(scoreSkinType({ sq1: 'sensitive', sq2: 'normal', sq3: 'sensitive', sq4: 'normal' })).toBe('sensitive');
  });

  it('maps every answer option to one of the 5 supported result types', () => {
    const types = Object.keys(SKIN_RESULTS);
    expect(types).toHaveLength(5);
    SKIN_QUESTIONS.forEach((q) => {
      q.options.forEach((o) => {
        expect(types).toContain(o.value);
      });
    });
  });

  it('always returns a supported type', () => {
    expect(Object.keys(SKIN_RESULTS)).toContain(scoreSkinType({ sq1: 'sensitive' }));
  });
});
