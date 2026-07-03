import { PRODUCTS_DATA } from '../../../../data';
import ProductCategoryClientPage from './ProductCategoryClientPage';

const DEFAULT_CATEGORY_IDS = [
  "pin-may-cong-cu",
  "ups-cua-cuon",
  "pin-xe-dien",
  "ac-quy-lithium",
  "ac-quy-chi-axit",
  "pin-luu-tru-nang-luong",
  "phu-kien-linh-kien",
];

export function generateStaticParams() {
  const categoryIds = new Set(DEFAULT_CATEGORY_IDS);
  PRODUCTS_DATA.forEach((product) => {
    if (product.category) categoryIds.add(product.category);
  });

  return Array.from(categoryIds).map((category) => ({ category }));
}

export default function ProductCategoryPage() {
  return <ProductCategoryClientPage />;
}
