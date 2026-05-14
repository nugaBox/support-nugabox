import { redirect } from 'next/navigation';

export default function UserSitesRedirectPage() {
  redirect('/settings/users');
}
