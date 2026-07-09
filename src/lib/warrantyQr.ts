import { WarrantyRecord } from "../types";

export type WarrantySerialStatus = "unused" | "pending" | "activated" | "rejected";

export const WARRANTY_QR_BASE_URL = "https://voltara.vn/kich-hoat-bao-hanh";

export function normalizeSerialPart(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function warrantyIdFromSerial(serial: string) {
  return `warranty-${normalizeSerialPart(serial).toLowerCase()}`;
}

export function buildWarrantySerial(productCode: string, batchCode: string, index: number) {
  return `${normalizeSerialPart(productCode)}-${normalizeSerialPart(batchCode)}-${String(index).padStart(6, "0")}`;
}

export function buildWarrantyQrUrl(serial: string) {
  return `${WARRANTY_QR_BASE_URL}?serial=${encodeURIComponent(serial)}`;
}

export function isMachineWarrantyStatus(status: string | undefined): status is WarrantySerialStatus {
  return status === "unused" || status === "pending" || status === "activated" || status === "rejected";
}

export function warrantyRecordStatusLabel(status: string | undefined) {
  if (status === "unused") return "Chưa kích hoạt";
  if (status === "pending") return "Chờ duyệt";
  if (status === "activated") return "Đã kích hoạt";
  if (status === "rejected") return "Từ chối";
  return status || "Chưa rõ";
}

export function toWarrantyCsv(items: WarrantyRecord[]) {
  const columns = ["serial", "productCode", "productName", "warrantyMonths", "qrUrl", "status", "createdAt"];
  const rows = items.map((item) => [
    item.serial,
    item.productCode || "",
    item.productName || "",
    String(item.warrantyMonths || item.termMonths || ""),
    item.qrUrl || buildWarrantyQrUrl(item.serial),
    item.status || "",
    item.createdAt || "",
  ]);

  const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  return [columns, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");
}
