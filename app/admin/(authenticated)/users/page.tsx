import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminJwt, COOKIE_NAME } from '@/lib/auth';
import Link from 'next/link';
import { getUsers } from '@/lib/actions/user-actions';
import { UserTable } from '@/components/admin/UserTable';
import { UserPlus, Users } from 'lucide-react';

export const revalidate = 0;

export default async function UsersManagementPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminJwt(token) : null;

  if (!payload || payload.role !== 'admin') {
    redirect('/admin');
  }

  const result = await getUsers();
  const users = result.success ? result.users : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Users size={24} />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground">User Management</h1>
          </div>
          <p className="text-muted-foreground">
            Manage system administrators and staff accounts.
          </p>
        </div>
        
        <Link
          href="/admin/create-user"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-sm hover:bg-primary/90 transition-all shadow-md active:scale-95"
        >
          <UserPlus size={18} />
          Create New Admin
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-background border border-border p-6 rounded-lg shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Accounts</p>
          <h3 className="text-3xl font-bold text-primary">{users.length}</h3>
        </div>
        <div className="bg-background border border-border p-6 rounded-lg shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Admins</p>
          <h3 className="text-3xl font-bold text-emerald-600">
            {users.filter((u: any) => u.role === 'admin').length}
          </h3>
        </div>
        <div className="bg-background border border-border p-6 rounded-lg shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Editorial</p>
          <h3 className="text-3xl font-bold text-blue-600">
            {users.filter((u: any) => u.role === 'editorial').length}
          </h3>
        </div>
        <div className="bg-background border border-border p-6 rounded-lg shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Standard Users</p>
          <h3 className="text-3xl font-bold text-zinc-600">
            {users.filter((u: any) => u.role === 'user').length}
          </h3>
        </div>
      </div>

      <UserTable initialUsers={users} />
    </div>
  );
}
