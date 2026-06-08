'use client';

import Admin from '../../views/Admin';
import AdminAuthGate from '../../components/AdminAuthGate';

export default function AdminPage() {
  return (
    <AdminAuthGate>
      <Admin />
    </AdminAuthGate>
  );
}
