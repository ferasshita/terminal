import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';
import { useEffect, useMemo, useRef } from 'react';

import type { HistoricalRate } from '../../types/models';

interface Props {
  rows: HistoricalRate[];
  mode: 'line' | 'candlestick';
}

export const RateChart = ({ rows, mode }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const data = useMemo(
    () =>
      [...rows]
        .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
        .map((row) => ({
          time: Math.floor(new Date(row.recordedAt).getTime() / 1000) as never,
          buy: Number(row.buyRate),
          sell: Number(row.sellRate),
        })),
    [rows],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#0b1220' }, textColor: '#94a3b8' },
      grid: { vertLines: { color: '#1e293b' }, horzLines: { color: '#1e293b' } },
      width: containerRef.current.clientWidth,
      height: 280,
      crosshair: { mode: 0 },
    });

    if (mode === 'line') {
      const series = chart.addSeries(LineSeries, { color: '#3b82f6' });
      series.setData(data.map((point) => ({ time: point.time, value: point.sell })));
    } else {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        borderUpColor: '#10b981',
        wickUpColor: '#10b981',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        wickDownColor: '#ef4444',
      });
      series.setData(
        data.map((point) => ({
          time: point.time,
          open: point.buy,
          high: Math.max(point.buy, point.sell),
          low: Math.min(point.buy, point.sell),
          close: point.sell,
        })),
      );
    }

    chart.timeScale().fitContent();

    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [data, mode]);

  return <div ref={containerRef} className="w-full" />;
};
