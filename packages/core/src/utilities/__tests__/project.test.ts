import { expect } from '@open-wc/testing';
import CharmProject from '../project.js';
import { tokens } from '../theme.js';

describe('CharmProject', () => {
  const defaultButton = tokens.var.component('button', 'bgColor');

  it('defaults to charm prefix with no config', () => {
    const p = new CharmProject();
    expect(tokens.var.component('button', 'bgColor')).to.equal(defaultButton);
  });

  it('sets tokenPrefix from tag prefix when tokenPrefix omitted', () => {
    const p = new CharmProject({ prefix: 'testproj' });
    expect(tokens.var.component('button', 'bgColor')).to.match(/var\(--testproj-/);
  });

  it('uses tokenPrefix when provided separately from tag prefix', () => {
    const p = new CharmProject({ prefix: 'tp', tokenPrefix: 'customprefix' });
    expect(tokens.var.component('button', 'bgColor')).to.match(/var\(--customprefix-/);
  });

  it('updateProject updates tokenPrefix', () => {
    const p = new CharmProject({ prefix: 'first' });
    p.updateProject({ prefix: 'second', tokenPrefix: 'second' });
    expect(tokens.var.component('button', 'bgColor')).to.match(/var\(--second-/);
  });

  it('updateProject without tokenPrefix falls back to tag prefix', () => {
    const p = new CharmProject();
    p.updateProject({ prefix: 'fallback' });
    expect(tokens.var.component('button', 'bgColor')).to.match(/var\(--fallback-/);
  });
});
