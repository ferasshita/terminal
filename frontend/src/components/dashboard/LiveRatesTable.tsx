import { AllCommunityModule, type ColDef, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import type { ExchangeRate } from '../../types/models';
import { fmtDateTime, fmtNumber } from '../../utils/format';

ModuleRegistry.registerModules([AllCommunityModule]);

interface Props {
  rows: ExchangeRate[];
}

export const LiveRatesTable = ({ rows }: Props) => {
  const grouped = Object.values(
    rows.reduce<Record<string, { currency: string; buy?: number; sell?: number; source: string; updated: string }>>((acc, row) => {
      const bucket = acc[row.currencyCode] ?? {
        currency: row.currencyCode,
        source: row.source?.name ?? 'Manual',
        updated: row.createdAt,
      };

      if (row.type === 'BUY') bucket.buy = Number(row.rate);
      if (row.type === 'SELL') bucket.sell = Number(row.rate);
      if (new Date(row.createdAt).getTime() > new Date(bucket.updated).getTime()) {
        bucket.updated = row.createdAt;
      }

      acc[row.currencyCode] = bucket;
      return acc;
    }, {}),
  ).map((item) => ({
    ...item,
    spread: (item.sell ?? 0) - (item.buy ?? 0),
  }));

  const columnDefs: ColDef[] = [
    { field: 'currency', headerName: 'Currency', flex: 1 },
    { field: 'buy', headerName: 'Buy', valueFormatter: (p) => fmtNumber(p.value) },
    { field: 'sell', headerName: 'Sell', valueFormatter: (p) => fmtNumber(p.value) },
    {
      field: 'spread',
      headerName: 'Spread',
      valueFormatter: (p) => fmtNumber(p.value),
      cellClass: (p) => (Number(p.value) >= 0 ? 'text-emerald-300' : 'text-rose-300'),
    },
    { field: 'source', headerName: 'Source' },
    { field: 'updated', headerName: 'Updated', valueFormatter: (p) => fmtDateTime(p.value) },
  ];

  return (
    <div className="ag-theme-quartz-dark h-70 w-full">
      <AgGridReact rowData={grouped} columnDefs={columnDefs} pagination paginationPageSize={8} />
    </div>
  );
};
