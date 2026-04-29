import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminJwt, COOKIE_NAME } from '@/lib/auth';
import CreateUserForm from './CreateUserForm';

export default async function CreateUserPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminJwt(token) : null;

  if (!payload || payload.role !== 'admin') {
    redirect('/admin');
  }

  return <CreateUserForm />;
}
