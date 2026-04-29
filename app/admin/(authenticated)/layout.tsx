import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminJwt, COOKIE_NAME } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

/**
 * AdminLayout — JWT-authenticated shell
 *
 * Verifies the drishyam_admin_session cookie on every request.
 * Redirects to /admin/login if missing or invalid.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const payload = await verifyAdminJwt(token);
  if (!payload) {
    redirect('/admin/login');
  }

  const userRole = payload.role as string;

  return (
    <div className="flex h-screen bg-secondary/20 md:overflow-auto text-foreground">
      <AdminSidebar userRole={userRole} />
      <main className="flex-1 w-full relative z-0 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-4 md:p-8 lg:p-12 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
