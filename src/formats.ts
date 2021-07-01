import { timeFormat } from 'd3-time-format';
import { format } from 'd3-format';

const short = timeFormat('%B %d');

export function formatDateShort(date?: Date): string {
  return !date ? '?' : short(date);
}

export function formatPopulation(info: { population?: number }): string {
  if (!info || typeof info.population !== 'number') {
    return 'Unknown';
  }
  return info.population.toLocaleString();
}

const f = format(',.1f');
const basePercentFormatter = format('.2%');
const rawFormatter = format(',.2f');

function sign(
  value: number | null | undefined,
  formatter: (v: number) => string,
  enforceSign: boolean,
  factor = 1,
): string {
  if (value == null || Number.isNaN(value)) {
    return 'N/A';
  }
  const v = formatter(value * factor);
  if (!enforceSign || v.startsWith('-') || v.startsWith('−')) {
    return v;
  }
  if (v === formatter(0)) {
    return `±${v}`;
  }
  return `+${v}`;
}

export function formatValue(value?: number | null, enforceSign = false): string {
  return sign(value, f, enforceSign);
}
export function formatPercentage(value?: number | null, enforceSign = false): string {
  return sign(value, basePercentFormatter, enforceSign, 1 / 100);
}
export function formatFraction(value?: number | null, enforceSign = false): string {
  return sign(value, basePercentFormatter, enforceSign);
}
export function formatRawValue(value?: number | null, enforceSign = false): string {
  return sign(value, rawFormatter, enforceSign);
}
