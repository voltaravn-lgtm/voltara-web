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
