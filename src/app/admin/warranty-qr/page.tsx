"use client";

import AdminAuthGate from "../../../components/AdminAuthGate";
import WarrantyQrAdmin from "../../../views/Admin/WarrantyQrAdmin";

export default function WarrantyQrAdminPage() {
  return (
    <AdminAuthGate>
      <WarrantyQrAdmin />
    </AdminAuthGate>
  );
}
