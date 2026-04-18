import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
