export interface CatalogPage {
  id: string;
  src: string;
  alt: string;
}

export interface CatalogDefinition {
  id: string;
  title: string;
  description: string;
  pages: CatalogPage[];
  pageSound?: string;
}

const VOLTARA_2026_PAGE_COUNT = 13;

export const catalogPages = Array.from(
  { length: VOLTARA_2026_PAGE_COUNT },
  (_, index): CatalogPage => {
    const pageNumber = index + 1;
    const fileNumber = String(pageNumber).padStart(3, "0");

    return {
      id: `voltara-2026-page-${fileNumber}`,
      src: `/catalog/voltara-2026/page-${fileNumber}.webp`,
      alt: `Catalog Voltara 2026 - trang ${pageNumber}`,
    };
  },
);

export const voltara2026Catalog: CatalogDefinition = {
  id: "voltara-2026",
  title: "Catalog Voltara 2026",
  description: "Giải pháp pin, máy và thiết bị công cụ Voltara",
  pages: catalogPages,
  pageSound: "/catalog/audio/lat-sach.mp3",
};
