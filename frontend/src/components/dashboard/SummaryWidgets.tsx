import type { EconomicEvent, ExchangeOffice, News } from '../../types/models';
import { fmtDateTime } from '../../utils/format';

export const NewsWidget = ({ items }: { items: News[] }) => (
  <div className="space-y-2 text-xs">
    {items.slice(0, 5).map((news) => (
      <article key={news.id} className="rounded border border-slate-800 p-2">
        <p className="font-medium text-slate-200">{news.title}</p>
        <p className="mt-1 text-[11px] text-slate-400">{news.content.slice(0, 90)}...</p>
      </article>
    ))}
  </div>
);

export const CalendarWidget = ({ items }: { items: EconomicEvent[] }) => (
  <div className="space-y-2 text-xs">
    {items.slice(0, 5).map((event) => (
      <article key={event.id} className="rounded border border-slate-800 p-2">
        <p className="font-medium text-slate-200">{event.title}</p>
        <p className="text-[11px] text-slate-400">{event.country} · {fmtDateTime(event.eventDate)}</p>
      </article>
    ))}
  </div>
);

export const MarketSummaryWidget = ({ buyAvg, sellAvg }: { buyAvg: number; sellAvg: number }) => (
  <div className="grid grid-cols-2 gap-2 text-xs">
    <div className="rounded border border-slate-800 p-2">
      <p className="text-slate-400">Avg Buy</p>
      <p className="text-sm font-semibold text-emerald-300">{buyAvg.toFixed(4)}</p>
    </div>
    <div className="rounded border border-slate-800 p-2">
      <p className="text-slate-400">Avg Sell</p>
      <p className="text-sm font-semibold text-rose-300">{sellAvg.toFixed(4)}</p>
    </div>
  </div>
);

export const StrengthWidget = ({ strengths }: { strengths: Array<{ currency: string; score: number }> }) => (
  <div className="space-y-1 text-xs">
    {strengths.map((item) => (
      <div key={item.currency} className="flex items-center justify-between rounded border border-slate-800 px-2 py-1">
        <span>{item.currency}</span>
        <span className={item.score >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{item.score.toFixed(2)}%</span>
      </div>
    ))}
  </div>
);

export const OfficesWidget = ({ items }: { items: ExchangeOffice[] }) => (
  <div className="space-y-1 text-xs">
    {items.slice(0, 6).map((office) => (
      <div key={office.id} className="rounded border border-slate-800 px-2 py-1.5">
        <p className="text-slate-200">{office.name}</p>
        <p className="text-[11px] text-slate-400">{office.city} · {office.phone}</p>
      </div>
    ))}
  </div>
);
