import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { dataService } from '../../api/services';
import { EmptyState } from '../common/EmptyState';
import { LoadingState } from '../common/LoadingState';
import { Panel } from '../common/Panel';

export const UserAdminPanel = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['users-admin'], queryFn: () => dataService.users.list() });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['users-admin'] });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'ADMIN' | 'USER' }) => dataService.users.setRole(id, role),
    onSuccess: refresh,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => dataService.users.setStatus(id, isActive),
    onSuccess: refresh,
  });

  const users = data?.data.items ?? [];

  return (
    <Panel title="Users">
      {isLoading ? <LoadingState /> : null}
      {!isLoading && users.length === 0 ? <EmptyState /> : null}
      {users.length ? (
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="px-2 py-1">Name</th>
              <th className="px-2 py-1">Email</th>
              <th className="px-2 py-1">Role</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-900">
                <td className="px-2 py-1">{user.fullName}</td>
                <td className="px-2 py-1">{user.email}</td>
                <td className="px-2 py-1">{user.role}</td>
                <td className="px-2 py-1">{user.isActive ? 'Active' : 'Disabled'}</td>
                <td className="space-x-2 px-2 py-1">
                  <button onClick={() => roleMutation.mutate({ id: user.id, role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' })} className="text-blue-300">
                    Toggle Role
                  </button>
                  <button onClick={() => statusMutation.mutate({ id: user.id, isActive: !user.isActive })} className="text-rose-300">
                    {user.isActive ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </Panel>
  );
};
