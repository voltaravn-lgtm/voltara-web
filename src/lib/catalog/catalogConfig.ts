import "server-only";

import { readdir } from "node:fs/promises";
import path from "node:path";
import type { CatalogDefinition } from "@/src/types/catalog";

const CATALOG_ID = "voltara-2026";
const CATALOG_PUBLIC_PATH = `/catalog/${CATALOG_ID}`;
const CATALOG_DIRECTORY = path.join(process.cwd(), "public", "catalog", CATALOG_ID);
const CATALOG_PAGE_PATTERN = /^page-(\d{3})\.webp$/i;

export async function loadVoltara2026Catalog(): Promise<CatalogDefinition> {
  const entries = await readdir(CATALOG_DIRECTORY, { withFileTypes: true });
  const pageFiles = entries
    .filter((entry) => entry.isFile() && CATALOG_PAGE_PATTERN.test(entry.name))
    .map((entry) => {
      const match = entry.name.match(CATALOG_PAGE_PATTERN);
      return {
        fileName: entry.name,
        pageNumber: Number(match?.[1]),
      };
    })
    .sort((first, second) => {
      if (first.pageNumber !== second.pageNumber) {
        return first.pageNumber - second.pageNumber;
      }
      return first.fileName.localeCompare(second.fileName);
    });

  if (pageFiles.length === 0) {
    throw new Error(
      `Không tìm thấy trang catalog đúng mẫu page-001.webp trong ${CATALOG_DIRECTORY}`,
    );
  }

  return {
    id: CATALOG_ID,
    title: "Catalog Voltara 2026",
    description: "Giải pháp pin, máy và thiết bị công cụ Voltara",
    pages: pageFiles.map(({ fileName, pageNumber }, index) => ({
      id: `${CATALOG_ID}-page-${pageNumber}`,
      src: `${CATALOG_PUBLIC_PATH}/${fileName}`,
      alt: `Catalog Voltara 2026 - trang ${index + 1}`,
    })),
    pageSound: "/catalog/audio/lat-sach.mp3",
  };
}
