import { expect } from '@open-wc/testing';
import {
  addDays,
  createUtcDate,
  dateFromParts,
  formatMonthYear,
  getDateInputLayout,
  getLocaleFirstDay,
  normalizeInputDigits,
  parseIsoDate,
  toIsoDate,
} from './date.js';

describe('date utilities', () => {
  it('parses strict ISO civil dates and rejects normalized overflow', () => {
    expect(toIsoDate(parseIsoDate('2024-02-29')!)).to.equal('2024-02-29');
    expect(parseIsoDate('2025-02-29')).to.be.undefined;
    expect(parseIsoDate('0000-01-01')).to.be.undefined;
  });

  it('does Gregorian date arithmetic across leap days', () => {
    expect(toIsoDate(addDays(createUtcDate(2024, 1, 28), 1))).to.equal('2024-02-29');
    expect(dateFromParts('31', '02', '2024')).to.be.undefined;
  });

  it('uses the Gregorian calendar in locale headings and input segments', () => {
    const date = createUtcDate(2025, 0, 15);
    expect(formatMonthYear('th-TH', date)).to.contain('2025');
    expect(formatMonthYear('ar-SA', date)).to.not.contain('1446');
    expect(getDateInputLayout('zh-u-ca-chinese').order).to.include('year');
  });

  it('normalizes Arabic-Indic, Eastern Arabic-Indic and full-width digits', () => {
    expect(normalizeInputDigits('١٢ ۱۲ １２')).to.equal('121212');
  });

  it('uses the locale week start', () => {
    expect(getLocaleFirstDay('en-US')).to.equal(0);

    const prototype = Intl.Locale.prototype as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const oldMethod = Object.getOwnPropertyDescriptor(prototype, 'getWeekInfo');
    const oldProperty = Object.getOwnPropertyDescriptor(prototype, 'weekInfo');
    try {
      Object.defineProperty(prototype, 'getWeekInfo', { configurable: true, value: undefined });
      Object.defineProperty(prototype, 'weekInfo', { configurable: true, value: { firstDay: 1 } });
      expect(getLocaleFirstDay('en-GB-x-week-info-fallback')).to.equal(1);
    } finally {
      if (oldMethod) Object.defineProperty(prototype, 'getWeekInfo', oldMethod);
      else Reflect.deleteProperty(prototype, 'getWeekInfo');
      if (oldProperty) Object.defineProperty(prototype, 'weekInfo', oldProperty);
      else Reflect.deleteProperty(prototype, 'weekInfo');
    }
  });
});
