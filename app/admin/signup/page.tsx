import { redirect } from 'next/navigation';

export default function RedirectToLogin() {
  redirect('/admin/login');
  return null;
}
