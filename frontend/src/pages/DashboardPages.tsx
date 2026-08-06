import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { dataService } from '../api/services';
import { CrudPage } from '../components/admin/CrudPage';
import { UserAdminPanel } from '../components/admin/UserAdminPanel';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { Panel } from '../components/common/Panel';
import { RateChart } from '../components/dashboard/RateChart';
import { LiveRatesTable } from '../components/dashboard/LiveRatesTable';
import {
  CalendarWidget,
  MarketSummaryWidget,
  NewsWidget,
  OfficesWidget,
  StrengthWidget,
} from '../components/dashboard/SummaryWidgets';

export const DashboardPage = () => {
  const [chartMode, setChartMode] = useState<'line' | 'candlestick'>('line');
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w' | '1m'>('1d');

  const ratesQuery = useQuery({ queryKey: ['rates', timeframe], queryFn: () => dataService.exchangeRates.list({ pageSize: 100 }) });
  const historyQuery = useQuery({
    queryKey: ['history', timeframe],
    queryFn: () => dataService.historicalRates.list({ pageSize: timeframe === '1h' ? 20 : timeframe === '4h' ? 40 : 90 }),
  });
  const newsQuery = useQuery({ queryKey: ['news'], queryFn: () => dataService.news.list({ pageSize: 8 }) });
  const eventsQuery = useQuery({ queryKey: ['events'], queryFn: () => dataService.economicEvents.list({ pageSize: 8 }) });
  const officesQuery = useQuery({ queryKey: ['offices'], queryFn: () => dataService.exchangeOffices.list({ pageSize: 8 }) });

  if (ratesQuery.isLoading || historyQuery.isLoading) {
    return <LoadingState label="Loading terminal data..." />;
  }

  const rates = ratesQuery.data?.data.items ?? [];
  const historical = historyQuery.data?.data.items ?? [];
  const buy = rates.filter((x) => x.type === 'BUY').map((x) => Number(x.rate));
  const sell = rates.filter((x) => x.type === 'SELL').map((x) => Number(x.rate));

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  const strengths = Array.from(
    rates.reduce<Map<string, number>>((acc, row) => {
      const current = acc.get(row.currencyCode) ?? 0;
      const next = current + (row.type === 'SELL' ? Number(row.rate) : -Number(row.rate));
      acc.set(row.currencyCode, next);
      return acc;
    }, new Map()),
  )
    .map(([currency, score]) => ({ currency, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="space-y-3">
      <Panel title="Live Exchange Rates">
        {rates.length ? <LiveRatesTable rows={rates} /> : <EmptyState />}
      </Panel>
      <Panel
        title="Historical Chart"
        right={
          <div className="flex gap-1 text-xs">
            {(['1h', '4h', '1d', '1w', '1m'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`rounded px-2 py-1 ${timeframe === tf ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-300'}`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
            <button onClick={() => setChartMode(chartMode === 'line' ? 'candlestick' : 'line')} className="rounded bg-slate-900 px-2 py-1">
              {chartMode === 'line' ? 'Line' : 'Candlestick'}
            </button>
          </div>
        }
      >
        {historical.length ? <RateChart rows={historical} mode={chartMode} /> : <EmptyState />}
      </Panel>
      <div className="grid gap-3 lg:grid-cols-5">
        <Panel title="News" ><NewsWidget items={newsQuery.data?.data.items ?? []} /></Panel>
        <Panel title="Economic Calendar"><CalendarWidget items={eventsQuery.data?.data.items ?? []} /></Panel>
        <Panel title="Market Summary"><MarketSummaryWidget buyAvg={avg(buy)} sellAvg={avg(sell)} /></Panel>
        <Panel title="Currency Strength"><StrengthWidget strengths={strengths} /></Panel>
        <Panel title="Exchange Offices"><OfficesWidget items={officesQuery.data?.data.items ?? []} /></Panel>
      </div>
    </div>
  );
};

export const MarketsPage = () => <DashboardPage />;

export const ExchangeRatesPage = () => (
  <CrudPage
    title="Exchange Rates"
    fields={[
      { key: 'currencyCode', label: 'Currency' },
      { key: 'rate', label: 'Rate' },
      { key: 'type', label: 'Type BUY/SELL' },
      { key: 'sourceId', label: 'Source ID' },
    ]}
    list={() => dataService.exchangeRates.list({ pageSize: 100 })}
    create={dataService.exchangeRates.create}
    update={dataService.exchangeRates.update}
    remove={dataService.exchangeRates.remove}
  />
);

export const ChartsPage = () => (
  <Panel title="Historical Charts">
    <DashboardPage />
  </Panel>
);

export const NewsPage = () => (
  <CrudPage
    title="News"
    fields={[
      { key: 'title', label: 'Title' },
      { key: 'content', label: 'Content' },
      { key: 'category', label: 'Category' },
      { key: 'countryCode', label: 'Country' },
      { key: 'currencyCode', label: 'Currency' },
      { key: 'importance', label: 'Importance' },
      { key: 'sourceId', label: 'Source ID' },
    ]}
    list={() => dataService.news.list({ pageSize: 100 })}
    create={dataService.news.create}
    update={dataService.news.update}
    remove={dataService.news.remove}
  />
);

export const EconomicCalendarPage = () => (
  <CrudPage
    title="Economic Events"
    fields={[
      { key: 'title', label: 'Title' },
      { key: 'country', label: 'Country' },
      { key: 'currencyCode', label: 'Currency' },
      { key: 'forecast', label: 'Forecast' },
      { key: 'previous', label: 'Previous' },
      { key: 'actual', label: 'Actual' },
      { key: 'importance', label: 'Importance' },
      { key: 'eventDate', label: 'Date ISO' },
    ]}
    list={() => dataService.economicEvents.list({ pageSize: 100 })}
    create={dataService.economicEvents.create}
    update={dataService.economicEvents.update}
    remove={dataService.economicEvents.remove}
  />
);

export const ExchangeOfficesPage = () => (
  <CrudPage
    title="Exchange Offices"
    fields={[
      { key: 'name', label: 'Name' },
      { key: 'city', label: 'City' },
      { key: 'address', label: 'Address' },
      { key: 'phone', label: 'Phone' },
      { key: 'latitude', label: 'Latitude' },
      { key: 'longitude', label: 'Longitude' },
      { key: 'verified', label: 'Verified true/false' },
    ]}
    list={() => dataService.exchangeOffices.list({ pageSize: 100 })}
    create={dataService.exchangeOffices.create}
    update={dataService.exchangeOffices.update}
    remove={dataService.exchangeOffices.remove}
  />
);

export const AnalyticsPage = () => <DashboardPage />;

export const SettingsPage = () => (
  <Panel title="Settings">
    <p className="text-xs text-slate-400">Dark mode is enabled by default. Additional preferences can be extended here.</p>
  </Panel>
);

export const AdminCurrenciesPage = () => (
  <CrudPage
    title="Currencies"
    fields={[
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Name' },
      { key: 'symbol', label: 'Symbol' },
      { key: 'country', label: 'Country' },
      { key: 'flag', label: 'Flag' },
      { key: 'isActive', label: 'Active true/false' },
    ]}
    list={() => dataService.currencies.list({ pageSize: 100 })}
    create={dataService.currencies.create}
    update={dataService.currencies.update}
    remove={dataService.currencies.remove}
  />
);

export const AdminExchangeRatesPage = () => <ExchangeRatesPage />;
export const AdminNewsPage = () => <NewsPage />;
export const AdminEconomicEventsPage = () => <EconomicCalendarPage />;

export const AdminSourcesPage = () => (
  <CrudPage
    title="Sources"
    fields={[
      { key: 'name', label: 'Name' },
      { key: 'website', label: 'Website' },
      { key: 'type', label: 'Type' },
    ]}
    list={() => dataService.sources.list({ pageSize: 100 })}
    create={dataService.sources.create}
    update={dataService.sources.update}
    remove={dataService.sources.remove}
  />
);

export const AdminExchangeOfficesPage = () => <ExchangeOfficesPage />;

export const AdminUsersPage = () => <UserAdminPanel />;
