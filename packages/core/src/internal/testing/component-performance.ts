import type { LitElement } from 'lit';

export interface ComponentPerformanceCase {
  name: string;
  create: () => HTMLElement;
  update: (element: HTMLElement, iteration: number) => void;
}

export interface ComponentPerformanceOptions {
  iterations?: number;
  warmups?: number;
  bulkCounts?: number[];
}

interface TimingSummary {
  count: number;
  min: number;
  median: number;
  p95: number;
  max: number;
}

function formatTableRow(label: string, summary: TimingSummary): string {
  return [
    label.padEnd(10),
    String(summary.count).padStart(7),
    `${summary.median.toFixed(2)}ms`.padStart(10),
    `${summary.p95.toFixed(2)}ms`.padStart(10),
    `${summary.min.toFixed(2)}ms`.padStart(10),
    `${summary.max.toFixed(2)}ms`.padStart(10),
  ].join(' | ');
}

type RenderableElement = HTMLElement & Pick<LitElement, 'updateComplete'>;

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

function summarize(samples: number[]): TimingSummary {
  const sorted = [...samples].sort((a, b) => a - b);
  const percentile = (value: number) => sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * value) - 1)]!;

  return {
    count: samples.length,
    min: sorted[0]!,
    median: percentile(0.5),
    p95: percentile(0.95),
    max: sorted[sorted.length - 1]!,
  };
}

async function measureSamples(
  run: (iteration: number) => Promise<number>,
  iterations: number,
  warmups: number
): Promise<TimingSummary> {
  for (let iteration = 0; iteration < warmups; iteration++) {
    await run(iteration);
  }

  const samples: number[] = [];
  for (let iteration = 0; iteration < iterations; iteration++) {
    samples.push(await run(iteration));
  }

  return summarize(samples);
}

async function waitForUpdate(element: HTMLElement): Promise<void> {
  await (element as RenderableElement).updateComplete;
}

function collectRenderableElements(root: HTMLElement): HTMLElement[] {
  const elements = [root];
  const visit = (parent: ParentNode) => {
    for (const element of parent.querySelectorAll<HTMLElement>('*')) {
      elements.push(element);
      if (element.shadowRoot) visit(element.shadowRoot);
    }
  };

  visit(root);
  return elements;
}

async function settleTree(root: HTMLElement): Promise<void> {
  for (let frame = 0; frame < 5; frame++) {
    await Promise.all(collectRenderableElements(root).map(waitForUpdate));
    await nextFrame();
  }
}

async function measureMount(create: () => HTMLElement): Promise<number> {
  const host = document.createElement('div');
  document.body.append(host);

  const start = performance.now();
  const element = create();
  host.append(element);
  await waitForUpdate(element);
  const duration = performance.now() - start;

  await settleTree(host);
  host.remove();
  return duration;
}

async function measureRerender(component: ComponentPerformanceCase, iteration: number): Promise<number> {
  const host = document.createElement('div');
  const element = component.create();
  host.append(element);
  document.body.append(host);
  await waitForUpdate(element);

  const start = performance.now();
  component.update(element, iteration);
  await waitForUpdate(element);
  const duration = performance.now() - start;

  await settleTree(host);
  host.remove();
  return duration;
}

async function measureBulkMount(create: () => HTMLElement, count: number): Promise<number> {
  const host = document.createElement('div');
  const fragment = document.createDocumentFragment();
  document.body.append(host);

  const start = performance.now();
  for (let index = 0; index < count; index++) {
    fragment.append(create());
  }
  host.append(fragment);
  await Promise.all([...host.children].map(element => waitForUpdate(element as HTMLElement)));
  const duration = performance.now() - start;

  await settleTree(host);
  host.remove();
  return duration;
}

export async function benchmarkComponentPerformance(
  component: ComponentPerformanceCase,
  options: ComponentPerformanceOptions = {}
): Promise<void> {
  const iterations = options.iterations ?? 20;
  const warmups = options.warmups ?? 3;
  const bulkCounts = options.bulkCounts ?? [10, 50, 100];

  const mount = await measureSamples(() => measureMount(component.create), iterations, warmups);
  const rerender = await measureSamples(iteration => measureRerender(component, iteration), iterations, warmups);
  const bulk = Object.fromEntries(
    await Promise.all(
      bulkCounts.map(async count => [
        count,
        await measureSamples(
          () => measureBulkMount(component.create, count),
          Math.max(5, Math.floor(iterations / 2)),
          warmups
        ),
      ])
    )
  );

  const header = 'Scenario'.padEnd(10) + ' | Samples |    Median |        P95 |        Min |        Max';
  const separator = '-'.repeat(header.length);
  const rows = [
    formatTableRow('mount', mount),
    formatTableRow('rerender', rerender),
    ...Object.entries(bulk).map(([count, summary]) => formatTableRow(`bulk/${count}`, summary as TimingSummary)),
  ];

  console.warn(`[component-performance] ${component.name}\n${header}\n${separator}\n${rows.join('\n')}`);
}

export async function benchmarkTagPerformance(name: string, tagName: string): Promise<void> {
  await benchmarkComponentPerformance({
    name,
    create: () => document.createElement(tagName),
    update: element => (element as HTMLElement & { requestUpdate: () => void }).requestUpdate(),
  });
}

export { nextFrame };
