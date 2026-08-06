import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EmptyState } from '../common/EmptyState';
import { LoadingState } from '../common/LoadingState';
import { Panel } from '../common/Panel';

type Field = {
  key: string;
  label: string;
  placeholder?: string;
};

interface Props<T extends { id: string }> {
  title: string;
  fields: Field[];
  list: () => Promise<{ data: { items: T[] } }>;
  create: (payload: Record<string, unknown>) => Promise<unknown>;
  update: (id: string, payload: Record<string, unknown>) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
}

export const CrudPage = <T extends { id: string }>({ title, fields, list, create, update, remove }: Props<T>) => {
  const [form, setForm] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: [title], queryFn: list });

  const refresh = () => queryClient.invalidateQueries({ queryKey: [title] });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => create(payload),
    onSuccess: () => {
      setForm({});
      refresh();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => update(id, payload),
    onSuccess: () => {
      setEditingId(null);
      setForm({});
      refresh();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove(id),
    onSuccess: () => refresh(),
  });

  const rows = useMemo(() => data?.data.items ?? [], [data]);

  const submit = () => {
    const payload = fields.reduce<Record<string, unknown>>((acc, field) => {
      if (form[field.key] !== undefined && form[field.key] !== '') {
        acc[field.key] = form[field.key];
      }
      return acc;
    }, {});

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-3">
      <Panel title={title}>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {fields.map((field) => (
            <input
              key={field.key}
              value={form[field.key] ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
              placeholder={field.placeholder ?? field.label}
              className="rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs"
            />
          ))}
          <button onClick={submit} className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white">
            {editingId ? 'Update' : 'Create'}
          </button>
          {editingId ? (
            <button
              onClick={() => {
                setEditingId(null);
                setForm({});
              }}
              className="rounded border border-slate-700 px-2 py-1 text-xs"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </Panel>
      <Panel>
        {isLoading ? <LoadingState /> : null}
        {!isLoading && rows.length === 0 ? <EmptyState /> : null}
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  {fields.map((field) => (
                    <th key={field.key} className="px-2 py-1">{field.label}</th>
                  ))}
                  <th className="px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-900/60">
                    {fields.map((field) => (
                      <td key={field.key} className="px-2 py-1 text-slate-200">
                        {String((row as Record<string, unknown>)[field.key] ?? '-')}
                      </td>
                    ))}
                    <td className="space-x-2 px-2 py-1">
                      <button
                        onClick={() => {
                          setEditingId(row.id);
                          setForm(
                            fields.reduce<Record<string, string>>((acc, field) => {
                              acc[field.key] = String((row as Record<string, unknown>)[field.key] ?? '');
                              return acc;
                            }, {}),
                          );
                        }}
                        className="text-blue-300"
                      >
                        Edit
                      </button>
                      <button onClick={() => deleteMutation.mutate(row.id)} className="text-rose-300">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Panel>
    </div>
  );
};
