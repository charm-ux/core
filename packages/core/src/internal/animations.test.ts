import { expect } from '@open-wc/testing';
import { parseDuration, shimKeyframesHeightAuto } from './animations.js';

describe('animation utilities', () => {
  it('parses unit-bearing durations and treats bare numbers as milliseconds', () => {
    expect(parseDuration('2s')).to.equal(2000);
    expect(parseDuration('250ms')).to.equal(250);
    expect(parseDuration(2)).to.equal(2);
  });

  it('replaces auto heights in keyframes', () => {
    const keyframes = shimKeyframesHeightAuto([{ height: 'auto' }, { opacity: 0 }], 42);
    expect(keyframes[0]?.height).to.equal('42px');
    expect((keyframes[1] as Keyframe | undefined)?.opacity).to.equal(0);
  });
});
