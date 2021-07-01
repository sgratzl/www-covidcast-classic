import { timeFormat } from 'd3-time-format';
import { format } from 'd3-format';
import embed, { EmbedOptions, Result, VisualizationSpec } from 'vega-embed';
import { Error, expressionFunction } from 'vega';

expressionFunction(
  'cachedTime',
  (() => {
    const cacheTime = new Map<string, (d: Date) => string>();
    return (datum: Date, params: string): string => {
      const key = `d:${params}`;
      if (cacheTime.has(key)) {
        return cacheTime.get(key)!(datum);
      }
      const formatter = timeFormat(params);
      cacheTime.set(key, formatter);
      return formatter(datum);
    };
  })(),
);

expressionFunction(
  'cachedNumber',
  (() => {
    const cacheNumber = new Map<string, (d: number) => string>();
    return (datum: number, params: string): string => {
      const key = `n:${params}`;
      if (cacheNumber.has(key)) {
        return cacheNumber.get(key)!(datum);
      }
      const formatter = format(params);
      cacheNumber.set(key, formatter);
      return formatter(datum);
    };
  })(),
);

export default function createVega(
  root: string | HTMLElement,
  spec: VisualizationSpec | string,
  options: EmbedOptions,
): Promise<Result> {
  return embed(root, spec, {
    actions: false,
    logLevel: Error,
    ...options,
  });
}
