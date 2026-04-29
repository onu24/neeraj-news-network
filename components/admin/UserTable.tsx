'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Shield, User, Mail, Calendar, UserCheck, AlertCircle } from 'lucide-react';
import { deleteUser, updateUserRole } from '@/lib/actions/user-actions';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export function UserTable({ initialUsers }: { initialUsers: UserData[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
      setDeletingId(id);
      try {
        const res = await deleteUser(id);
        if (res.success) {
          setUsers(prev => prev.filter(u => u._id !== id));
          router.refresh();
        } else {
          alert(res.error || 'Failed to delete user');
        }
      } catch (err) {
        alert('An error occurred while deleting the user');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleRoleToggle = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setUpdatingId(id);
    try {
      const res = await updateUserRole(id, newRole);
      if (res.success) {
        setUsers(prev => prev.map(u => u._id === id ? { ...u, role: newRole } : u));
        router.refresh();
      } else {
        alert(res.error || 'Failed to update role');
      }
    } catch (err) {
      alert('An error occurred while updating the role');
    } finally {
      setUpdatingId(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="bg-background border border-border rounded-lg p-12 text-center shadow-sm">
        <div className="mx-auto w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
          <User className="text-muted-foreground" size={24} />
        </div>
        <p className="text-muted-foreground mb-4">No users found in the system.</p>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-border bg-secondary/30">
            <tr>
              <th className="py-4 px-6 font-semibold text-foreground uppercase tracking-wider text-xs">User Details</th>
              <th className="py-4 px-6 font-semibold text-foreground uppercase tracking-wider text-xs text-center">Role</th>
              <th className="py-4 px-6 font-semibold text-foreground uppercase tracking-wider text-xs">Joined Date</th>
              <th className="py-4 px-6 font-semibold text-foreground uppercase tracking-wider text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {users.map((user) => (
              <tr key={user._id} className={`hover:bg-secondary/10 transition-colors group ${deletingId === user._id ? 'opacity-50 animate-pulse' : ''}`}>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        {user.name}
                        {user.role === 'admin' && <Shield size={14} className="text-emerald-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail size={12} />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <button
                    onClick={() => handleRoleToggle(user._id, user.role)}
                    disabled={updatingId === user._id}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${user.role === 'admin'
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      } disabled:opacity-50`}
                    title={user.role === 'admin' ? 'Change to User' : 'Promote to Admin'}
                  >
                    {updatingId === user._id ? (
                      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      user.role === 'admin' ? <Shield size={12} /> : <UserCheck size={12} />
                    )}
                    {user.role.toUpperCase()}
                  </button>
                </td>
                <td className="py-4 px-6 text-muted-foreground whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </div>
                </td>
                <td className="py-4 px-6 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleDelete(user._id, user.name)}
                      disabled={deletingId === user._id}
                      className="p-2 text-red-600/70 hover:text-red-700 hover:bg-red-50 rounded-md transition-all disabled:cursor-not-allowed"
                      title="Delete User"
                    >
                      {deletingId === user._id ? (
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin block" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-secondary/10 border-t border-border flex items-start gap-3">
        <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <strong>Security Note:</strong> Deleting an admin user will immediately revoke their access.
          The first admin user should never be deleted to ensure system accessibility.
          Use the role toggle to change permissions between standard User and system Admin.
        </p>
      </div>
    </div>
  );
}
