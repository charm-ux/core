import type { ReactiveControllerHost } from 'lit';
import type CharmElement from './charm-element/charm-element.js';

export type CharmReactiveControllerHost = ReactiveControllerHost & Element & Partial<CharmElement>;
