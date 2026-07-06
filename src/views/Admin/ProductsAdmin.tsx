import React, { useEffect, useRef, useState } from "react";
import { ProductCategory, useApp } from "../../context/AppContext";
import { Product, ProductVariant } from "../../types";
import { uploadImageToCloudinary, isCloudinaryConfigured } from "../../lib/cloudinary";
import { getProductDescriptionExcerpt } from "../../lib/productDescription";
import { getProductSlug, slugifyProductText } from "../../lib/productRoutes";
import { cleanVideoUrls, getProductVideoEmbed } from "../../lib/video";
import {
  Battery, Plus, Edit, Trash2, X, Save, Copy,
  Bold, Italic,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Link as LinkIcon, List, Eye, Upload,
  Loader2, Search, LayoutGrid, Rows3, EyeOff, Download, Undo2, Redo2, ChevronRight
} from "lucide-react";
const defaultSpecTemplate: Product["specs"] = {
  "Công suất tối đa": "",
  "Trọng lượng thân máy": "",
  "Động cơ": "",
  "Kích thước bộ": "",
  "Điện áp": "",
  "Mô-men xoắn tối đa": "",
};

const createBlankProductForm = (id = ""): Partial<Product> => ({
  id,
  slug: "",
  name: "",
  voltage: "",
  capacity: "",
  brand: "",
  cellType: "",
  warranty: "",
  image: "",
  images: [],
  videoUrls: [],
  description: "",
  category: "",
  subCategory: "",
  price: "",
  salePrice: "",
  variants: [],
  sku: "",
  barcode: "",
  stockQuantity: "",
  stockStatus: "",
  syncChannel: "",
  externalProductId: "",
  externalVariantId: "",
  haravanProductId: "",
  haravanVariantId: "",
  syncEnabled: false,
  lastSyncedAt: "",
  hidden: false,
  specs: { ...defaultSpecTemplate },
});

const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

function getDescriptionImages(description: string | undefined) {
  return Array.from((description || "").matchAll(markdownImageRegex)).map((match) => ({
    markdown: match[0],
    alt: match[1],
    url: match[2],
  }));
}

const allowedDescriptionHtmlTags = new Set([
  "A",
  "B",
  "BR",
  "DIV",
  "EM",
  "I",
  "LI",
  "OL",
  "P",
  "SPAN",
  "STRONG",
  "TABLE",
  "TBODY",
  "TD",
  "TH",
  "THEAD",
  "TR",
  "U",
  "UL",
]);

function sanitizeDescriptionHtml(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.body.querySelectorAll("script, style, meta, link, object, iframe").forEach((node) => node.remove());

  const cleanNode = (node: Node): Node => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent || "");
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return document.createTextNode("");
    }

    const element = node as HTMLElement;
    const tagName = element.tagName.toUpperCase();

    if (!allowedDescriptionHtmlTags.has(tagName)) {
      const fragment = document.createDocumentFragment();
      Array.from(element.childNodes).forEach((child) => fragment.appendChild(cleanNode(child)));
      return fragment;
    }

    const cleanElement = document.createElement(tagName.toLowerCase());

    if (tagName === "A") {
      const href = element.getAttribute("href") || "";
      if (/^https?:\/\//i.test(href)) {
        cleanElement.setAttribute("href", href);
        cleanElement.setAttribute("target", "_blank");
        cleanElement.setAttribute("rel", "noopener noreferrer");
      }
    }

    if (tagName === "TD" || tagName === "TH") {
      const colSpan = element.getAttribute("colspan");
      const rowSpan = element.getAttribute("rowspan");
      if (colSpan && /^\d+$/.test(colSpan)) cleanElement.setAttribute("colspan", colSpan);
      if (rowSpan && /^\d+$/.test(rowSpan)) cleanElement.setAttribute("rowspan", rowSpan);
    }

    Array.from(element.childNodes).forEach((child) => cleanElement.appendChild(cleanNode(child)));
    return cleanElement;
  };

  const wrapper = document.createElement("div");
  Array.from(doc.body.childNodes).forEach((child) => wrapper.appendChild(cleanNode(child)));

  return wrapper.innerHTML
    .replace(/&nbsp;/g, " ")
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/<div>\s*<\/div>/g, "")
    .trim();
}

function slugifyCategoryName(value: string) {
  return value
    .trim()
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || `danh-muc-${Date.now()}`;
}

function makeUniqueCategoryId(baseId: string, existingIds: string[]) {
  let nextId = baseId;
  let index = 2;
  while (existingIds.includes(nextId)) {
    nextId = `${baseId}-${index}`;
    index += 1;
  }
  return nextId;
}

// Helper to render markdown and layout codes inside product descriptions
export function formatDescriptionToHtml(desc: string | undefined): string {
  if (!desc) return "";
  
  let html = desc
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");

  if (/<(p|div|table|tbody|thead|tr|td|th|ul|ol|li|h[1-6]|strong|b|em|i|br|img|a)(\s|>|\/)/i.test(html)) {
    return html;
  }
  
  // Convert standard markdown bold **text** to <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
  // Convert *text* to <em>text</em>
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  
  // Convert ### Heading to styled title
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-xs font-display font-semibold tracking-wide text-[#F5C45A] mt-3 mb-1 uppercase">$1</h3>');
  
  // Convert markdown image ![alt](url) to img tags
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-3 h-auto w-full object-contain filter drop-shadow-md border border-white/5 p-1" referrerPolicy="no-referrer" />');
  
  // Convert markdown link [text](url) to anchor tags
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-gold-light underline hover:text-white" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Convert list bullet lines starting with "- "
  html = html.replace(/^-[ ]+(.*?)$/gm, '<li class="list-disc ml-4 my-0.5 text-gray-300">$1</li>');
  
  // Convert double newlines to paragraphs or simple paragraph breaks
  html = html.replace(/\n/g, "<br />");
  
  return html;
}

export default function ProductsAdmin() {
  const {
    products,
    productCategories,
    setProductCategories,
    addProduct,
    updateProduct,
    deleteProduct,
    showToast
  } = useApp();

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isToolbarPreviewMode, setIsToolbarPreviewMode] = useState(false);
  const [isQuickImagePanelOpen, setIsQuickImagePanelOpen] = useState(false);
  const [uploadingImageTarget, setUploadingImageTarget] = useState<string | null>(null);
  const [adminViewMode, setAdminViewMode] = useState<"grid" | "list">("grid");
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productVisibilityFilter, setProductVisibilityFilter] = useState<"all" | "visible" | "hidden">("all");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newChildCategoryNames, setNewChildCategoryNames] = useState<Record<string, string>>({});
  
  const [productForm, setProductForm] = useState<Partial<Product>>(createBlankProductForm());

  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const descriptionEditorRef = useRef<HTMLDivElement | null>(null);
  const descriptionSelectionRef = useRef<Range | null>(null);
  const hasDescriptionSelectionRef = useRef(false);
  const hasManualDescriptionSelectionRef = useRef(false);
  const descriptionInsertAnchorRef = useRef<Node | null>(null);
  const descriptionUndoStackRef = useRef<string[]>([]);
  const descriptionRedoStackRef = useRef<string[]>([]);
  const descriptionCustomUndoIsLatestRef = useRef(false);
  const descriptionDraftRef = useRef("");
  const productFormScrollRef = useRef<HTMLFormElement | null>(null);
  const activeProductCategory = productCategories.find((category) => category.id === productForm.category);
  const activeProductSubCategories = (activeProductCategory?.children || []).filter((child) => !child.hidden);
  const cleanImageUrls = (images: Partial<Product>["images"]) =>
    (images || [])
      .map((imageUrl) => String(imageUrl || "").trim())
      .filter(Boolean);
  const cleanProductSpecs = (specs: Partial<Product>["specs"]): Record<string, string> =>
    Object.fromEntries(
      Object.entries(specs || {})
        .map(([key, value]) => [key.trim(), String(value || "").trim()])
        .filter(([key, value]) => Boolean(key && value)),
    ) as Record<string, string>;
  const cleanProductVariants = (variants: Partial<Product>["variants"]): ProductVariant[] =>
    (variants || [])
      .map((variant, index) => ({
        id: String(variant.id || `variant-${index + 1}`).trim() || `variant-${index + 1}`,
        name: String(variant.name || "").trim(),
        price: String(variant.price || "").trim(),
        salePrice: String(variant.salePrice || "").trim(),
        image: String(variant.image || "").trim(),
        sku: String(variant.sku || "").trim(),
        stockQuantity: String(variant.stockQuantity || "").trim(),
        stockStatus: (variant.stockStatus || "") as ProductVariant["stockStatus"],
      }))
      .filter((variant) => Boolean(variant.name));

  const galleryImageUrls = cleanImageUrls(productForm.images);
  const quickInsertImages = Array.from(new Set([productForm.image, ...galleryImageUrls].filter((imageUrl): imageUrl is string => Boolean(imageUrl))));
  const productVideoUrls = cleanVideoUrls(productForm.videoUrls);
  const productVideoEmbeds = productVideoUrls
    .map((videoUrl, index) => getProductVideoEmbed(videoUrl, index))
    .filter(Boolean);
  const visibleSpecEntries = Object.entries(cleanProductSpecs(productForm.specs));
  const productVariants = cleanProductVariants(productForm.variants);

  useEffect(() => {
    if (!isProductModalOpen) return;

    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isProductModalOpen]);

  const handleProductModalWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (event.ctrlKey) return;

    const target = event.target as HTMLElement;
    if (target.closest("textarea, [contenteditable='true']")) return;

    const scroller = productFormScrollRef.current;
    if (!scroller) return;

    event.preventDefault();
    scroller.scrollTop += event.deltaY;
  };

  const getCategoryDisplayName = (categoryId?: string, subCategoryId?: string) => {
    const category = productCategories.find((item) => item.id === categoryId);
    const child = category?.children?.find((item) => item.id === subCategoryId);
    return [category?.name || categoryId, child?.name].filter(Boolean).join(" / ");
  };

  const handleAddProductCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;

    setProductCategories((prev) => {
      const id = makeUniqueCategoryId(slugifyCategoryName(name), prev.map((category) => category.id));
      return [...prev, { id, name: name.toUpperCase(), children: [] }];
    });
    setNewCategoryName("");
    showToast("Da them danh muc san pham.", "success");
  };

  const handleUpdateProductCategory = (categoryId: string, updates: Partial<ProductCategory>) => {
    setProductCategories((prev) =>
      prev.map((category) => category.id === categoryId ? { ...category, ...updates } : category)
    );
  };

  const handleDeleteProductCategory = (categoryId: string) => {
    const usedCount = products.filter((product) => product.category === categoryId).length;
    const message = usedCount
      ? `Danh muc nay dang co ${usedCount} san pham. Xoa danh muc khong xoa san pham, nhung san pham se can gan lai danh muc. Ban van muon xoa?`
      : "Ban co chac muon xoa danh muc nay?";
    if (!window.confirm(message)) return;
    setProductCategories((prev) => prev.filter((category) => category.id !== categoryId));
  };

  const handleAddChildCategory = (categoryId: string) => {
    const name = (newChildCategoryNames[categoryId] || "").trim();
    if (!name) return;

    setProductCategories((prev) =>
      prev.map((category) => {
        if (category.id !== categoryId) return category;
        const children = category.children || [];
        const id = makeUniqueCategoryId(slugifyCategoryName(name), children.map((child) => child.id));
        return {
          ...category,
          children: [...children, { id, name: name.toUpperCase() }],
        };
      })
    );
    setNewChildCategoryNames((prev) => ({ ...prev, [categoryId]: "" }));
    showToast("Da them danh muc con.", "success");
  };

  const handleUpdateChildCategory = (
    categoryId: string,
    childId: string,
    updates: { name?: string; hidden?: boolean },
  ) => {
    setProductCategories((prev) =>
      prev.map((category) => {
        if (category.id !== categoryId) return category;
        return {
          ...category,
          children: (category.children || []).map((child) => child.id === childId ? { ...child, ...updates } : child),
        };
      })
    );
  };

  const handleDeleteChildCategory = (categoryId: string, childId: string) => {
    const usedCount = products.filter((product) => product.category === categoryId && product.subCategory === childId).length;
    const message = usedCount
      ? `Danh muc con nay dang co ${usedCount} san pham. Ban van muon xoa?`
      : "Ban co chac muon xoa danh muc con nay?";
    if (!window.confirm(message)) return;
    setProductCategories((prev) =>
      prev.map((category) => {
        if (category.id !== categoryId) return category;
        return { ...category, children: (category.children || []).filter((child) => child.id !== childId) };
      })
    );
  };

  const handleOpenProductModal = (product?: Product) => {
    descriptionSelectionRef.current = null;
    hasDescriptionSelectionRef.current = false;
    hasManualDescriptionSelectionRef.current = false;
    descriptionInsertAnchorRef.current = null;
    descriptionUndoStackRef.current = [];
    descriptionRedoStackRef.current = [];
    descriptionCustomUndoIsLatestRef.current = false;

    if (product) {
      setEditingProduct(product);
      descriptionDraftRef.current = product.description || "";
      setProductForm({
        ...product,
        images: product.images || [],
        videoUrls: product.videoUrls || [],
        variants: product.variants || [],
        subCategory: product.subCategory || "",
        hidden: product.hidden ?? false,
        syncChannel: product.syncChannel || (product.haravanProductId || product.haravanVariantId ? "haravan" : ""),
        externalProductId: product.externalProductId || product.haravanProductId || "",
        externalVariantId: product.externalVariantId || product.haravanVariantId || "",
      });
    } else {
      setEditingProduct(null);
      const blankForm = createBlankProductForm("VOLTARA-" + Math.floor(Math.random() * 90000 + 10000));
      descriptionDraftRef.current = blankForm.description || "";
      setProductForm(blankForm);
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.id?.trim() || !productForm.name) {
      showToast("Vui lòng điền đầy đủ ID và Tên sản phẩm!", "warning");
      return;
    }

    const currentForm = {
  ...productForm,
  images: galleryImageUrls,
  videoUrls: productVideoUrls,
  variants: productVariants,
  description: getDescriptionEditorHtml() || productForm.description,
  subCategory: activeProductSubCategories.length > 0 ? productForm.subCategory || "" : "",
  hidden: productForm.hidden ?? false,
  specs: cleanProductSpecs(productForm.specs),
} as Product;
    currentForm.id = currentForm.id.trim();
    currentForm.slug = slugifyProductText(currentForm.slug || `${currentForm.name}-${currentForm.id}`);
    const slugOwner = products.find((product) =>
      product.id !== editingProduct?.id &&
      getProductSlug(product) === currentForm.slug
    );

    if (slugOwner) {
      showToast("Slug URL sản phẩm bị trùng! Hãy đổi slug khác.", "error");
      return;
    }

    if (editingProduct) {
      const originalId = editingProduct.id;
      const nextId = currentForm.id;
      const isChangingId = nextId !== originalId;

      if (isChangingId && products.some((product) => product.id === nextId)) {
        showToast("ID Sản phẩm bị trùng lặp! Hãy đổi ID khác.", "error");
        return;
      }

      currentForm.id = nextId;

      if (isChangingId) {
        addProduct(currentForm);
        deleteProduct(originalId);
      } else {
        updateProduct(currentForm);
      }
      showToast("Đã lưu chỉnh sửa sản phẩm thành công!", "success");
    } else {
      if (products.some(p => p.id === currentForm.id)) {
        showToast("ID Sản phẩm bị trùng lặp! Hãy đổi ID khác.", "error");
        return;
      }
      addProduct(currentForm);
      showToast("Đã thêm sản phẩm mới thành công!", "success");
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProductPrompt = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi kho?`)) {
      deleteProduct(id);
    }
  };

  const handleCopyProduct = (prod: Product) => {
    const newId = prod.id + "-copy-" + Math.floor(Math.random() * 900 + 100);
    setEditingProduct(null); // Save as new unique entry
    setProductForm({
      ...prod,
      id: newId,
      name: prod.name + " (Bản sao)",
    });
    setIsToolbarPreviewMode(false);
    setIsProductModalOpen(true);
  };

  const handleAddVariant = () => {
    setProductForm(prev => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        {
          id: `variant-${Date.now()}`,
          name: "",
          price: "",
          salePrice: "",
          image: "",
          sku: "",
          stockQuantity: "",
          stockStatus: "",
        },
      ],
    }));
  };

  const handleUpdateVariant = (index: number, updates: Partial<ProductVariant>) => {
    setProductForm(prev => ({
      ...prev,
      variants: (prev.variants || []).map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...updates } : variant
      ),
    }));
  };

  const handleRemoveVariant = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      variants: (prev.variants || []).filter((_, variantIndex) => variantIndex !== index),
    }));
  };

  const handleToggleProductVisibility = (prod: Product) => {
    updateProduct({ ...prod, hidden: !prod.hidden });
    showToast(prod.hidden ? "Đã bật hiển thị sản phẩm." : "Đã ẩn sản phẩm khỏi trang công khai.", "info");
  };

  const normalizedSearchQuery = productSearchQuery.trim().toLowerCase();
  const filteredAdminProducts = products
    .filter((prod) => {
      const matchesSearch =
        !normalizedSearchQuery ||
        prod.name.toLowerCase().includes(normalizedSearchQuery) ||
        prod.id.toLowerCase().includes(normalizedSearchQuery) ||
        (prod.sku || "").toLowerCase().includes(normalizedSearchQuery) ||
        prod.category.toLowerCase().includes(normalizedSearchQuery) ||
        (prod.subCategory || "").toLowerCase().includes(normalizedSearchQuery) ||
        prod.brand.toLowerCase().includes(normalizedSearchQuery);
      const matchesVisibility =
        productVisibilityFilter === "all" ||
        (productVisibilityFilter === "hidden" ? Boolean(prod.hidden) : !prod.hidden);

      return matchesSearch && matchesVisibility;
    })
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime || b.id.localeCompare(a.id);
    });

  const cleanDescriptionEditorHtml = (html: string) => {
    return html
      .replace(/<span[^>]*data-description-caret="true"[^>]*>[\s\S]*?<\/span>/gi, "")
      .replace(/<p>(?:&nbsp;|\s|<br\s*\/?>)*<\/p>/gi, "")
      .replace(/<div>(?:&nbsp;|\s|<br\s*\/?>)*<\/div>/gi, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  const getDescriptionEditorHtml = () => {
    const html = descriptionEditorRef.current?.innerHTML ?? descriptionDraftRef.current ?? "";
    return cleanDescriptionEditorHtml(html);
  };

  const getDescriptionEditorDocument = (): Document | null => null;

  const syncDescriptionFromEditor = (commitToState = false) => {
    const html = getDescriptionEditorHtml();
    descriptionDraftRef.current = html;
    if (commitToState) {
      setProductForm(prev => ({ ...prev, description: html }));
    }
    return html;
  };

  const pushDescriptionUndoSnapshot = () => {
    const snapshot = getDescriptionEditorHtml();
    const stack = descriptionUndoStackRef.current;
    if (stack[stack.length - 1] !== snapshot) {
      stack.push(snapshot);
      if (stack.length > 80) stack.shift();
    }
    descriptionRedoStackRef.current = [];
  };

  const setDescriptionEditorHtml = (html: string) => {
    const editor = descriptionEditorRef.current;
    if (!editor) return;

    editor.innerHTML = html;
    descriptionDraftRef.current = cleanDescriptionEditorHtml(html);
    setProductForm(prev => ({ ...prev, description: descriptionDraftRef.current }));
    moveDescriptionCaretToEnd();
  };

  const undoDescriptionEditorChange = () => {
    if (!descriptionCustomUndoIsLatestRef.current) return false;
    const previous = descriptionUndoStackRef.current.pop();
    if (previous === undefined) return false;

    descriptionRedoStackRef.current.push(getDescriptionEditorHtml());
    setDescriptionEditorHtml(previous);
    descriptionCustomUndoIsLatestRef.current = false;
    return true;
  };

  const redoDescriptionEditorChange = () => {
    const next = descriptionRedoStackRef.current.pop();
    if (next === undefined) return false;

    descriptionUndoStackRef.current.push(getDescriptionEditorHtml());
    setDescriptionEditorHtml(next);
    descriptionCustomUndoIsLatestRef.current = true;
    return true;
  };

  const rememberDescriptionSelection = () => {
    const editor = descriptionEditorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      descriptionSelectionRef.current = range.cloneRange();
      hasDescriptionSelectionRef.current = true;
      hasManualDescriptionSelectionRef.current = true;
      descriptionInsertAnchorRef.current = null;
    }
  };

  const isDescriptionRangeValid = (range: Range | null) => {
    const editor = descriptionEditorRef.current;
    return Boolean(editor && range && editor.contains(range.commonAncestorContainer));
  };

  const moveDescriptionCaretToEnd = () => {
    const editor = descriptionEditorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection) return false;

    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    descriptionSelectionRef.current = range.cloneRange();
    hasDescriptionSelectionRef.current = true;
    hasManualDescriptionSelectionRef.current = false;
    return true;
  };

  const restoreDescriptionSelection = () => {
    const editor = descriptionEditorRef.current;
    if (!editor) return false;

    editor.focus();
    const selection = window.getSelection();
    const savedRange = descriptionSelectionRef.current;
    if (!selection || !hasDescriptionSelectionRef.current || !savedRange || !isDescriptionRangeValid(savedRange)) {
      return moveDescriptionCaretToEnd();
    }

    selection.removeAllRanges();
    selection.addRange(savedRange);
    return true;
  };

  const insertHtmlIntoDescriptionEditor = (html: string) => {
    const editor = descriptionEditorRef.current;
    if (!editor) return;

    pushDescriptionUndoSnapshot();
    editor.focus();

    const range = document.createRange();
    const anchor = descriptionInsertAnchorRef.current;
    if (anchor && editor.contains(anchor)) {
      range.setStartAfter(anchor);
    } else if (hasManualDescriptionSelectionRef.current && descriptionSelectionRef.current && isDescriptionRangeValid(descriptionSelectionRef.current)) {
      range.setStart(descriptionSelectionRef.current.startContainer, descriptionSelectionRef.current.startOffset);
      range.setEnd(descriptionSelectionRef.current.endContainer, descriptionSelectionRef.current.endOffset);
    } else {
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    range.deleteContents();

    const fragment = range.createContextualFragment(`${html}<br>`);
    const lastInsertedNode = fragment.lastChild;
    range.insertNode(fragment);

    const selection = window.getSelection();
    if (lastInsertedNode && editor.contains(lastInsertedNode)) {
      const nextRange = document.createRange();
      nextRange.setStartAfter(lastInsertedNode);
      nextRange.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(nextRange);
      descriptionSelectionRef.current = nextRange.cloneRange();
      hasDescriptionSelectionRef.current = true;
      hasManualDescriptionSelectionRef.current = false;
      descriptionInsertAnchorRef.current = lastInsertedNode;
    }

    syncDescriptionFromEditor(false);
    descriptionCustomUndoIsLatestRef.current = true;
  };

  const normalizeDescriptionEditorAfterInput = () => {
    descriptionCustomUndoIsLatestRef.current = false;
    descriptionInsertAnchorRef.current = null;
    syncDescriptionFromEditor(false);
  };

  const handleDescriptionEditorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const key = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && key === "z" && !event.shiftKey) {
      if (undoDescriptionEditorChange()) event.preventDefault();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && (key === "y" || (key === "z" && event.shiftKey))) {
      if (redoDescriptionEditorChange()) event.preventDefault();
    }
  };

  const insertFormatting = (type: "bold" | "italic" | "align-left" | "align-center" | "align-right" | "align-justify" | "image" | "bullet" | "heading" | "link" | "undo" | "redo") => {
    if (descriptionEditorRef.current) {
      restoreDescriptionSelection();

      switch (type) {
        case "undo":
          if (!undoDescriptionEditorChange()) document.execCommand("undo");
          break;
        case "redo":
          if (!redoDescriptionEditorChange()) document.execCommand("redo");
          break;
        case "bold":
          document.execCommand("bold");
          break;
        case "italic":
          document.execCommand("italic");
          break;
        case "align-left":
          document.execCommand("justifyLeft");
          break;
        case "align-center":
          document.execCommand("justifyCenter");
          break;
        case "align-right":
          document.execCommand("justifyRight");
          break;
        case "align-justify":
  document.execCommand("justifyFull");
  break;
        case "bullet":
          document.execCommand("insertUnorderedList");
          break;
        case "heading":
          document.execCommand("formatBlock", false, "h3");
          break;
        case "image": {
          const url = window.prompt("DÃ¡n URL hÃ¬nh áº£nh cáº§n chÃ¨n:");
          if (url) {
            insertHtmlIntoDescriptionEditor(`<img src="${url}" alt="MÃ´ táº£ áº£nh" class="my-5 h-auto w-full object-contain border border-white/10 bg-black p-3" referrerPolicy="no-referrer" />`);
          }
          break;
        }
        case "link": {
          const url = window.prompt("DÃ¡n Ä‘Æ°á»ng dáº«n liÃªn káº¿t:", "https://voltara.vn");
          if (url) document.execCommand("createLink", false, url);
          break;
        }
      }

      syncDescriptionFromEditor(false);
      rememberDescriptionSelection();
      return;
    }

    const doc = getDescriptionEditorDocument();
    if (doc) {
      document.body.focus();

      switch (type) {
        case "undo":
          doc.execCommand("undo");
          break;
        case "redo":
          doc.execCommand("redo");
          break;
        case "bold":
          doc.execCommand("bold");
          break;
        case "italic":
          doc.execCommand("italic");
          break;
        case "align-left":
          doc.execCommand("justifyLeft");
          break;
        case "align-center":
          doc.execCommand("justifyCenter");
          break;
        case "align-right":
          doc.execCommand("justifyRight");
          break;
        case "align-justify":
  doc.execCommand("justifyFull");
  break;
        case "bullet":
          doc.execCommand("insertUnorderedList");
          break;
        case "heading":
          doc.execCommand("formatBlock", false, "h3");
          break;
        case "image": {
          const url = window.prompt("Dán URL hình ảnh cần chèn:");
          if (url) {
            insertHtmlIntoDescriptionEditor(`<img src="${url}" alt="Mô tả ảnh" class="my-5 h-auto w-full object-contain border border-white/10 bg-black p-3" referrerPolicy="no-referrer" />`);
          }
          break;
        }
        case "link": {
          const url = window.prompt("Dán đường dẫn liên kết:", "https://voltara.vn");
          if (url) doc.execCommand("createLink", false, url);
          break;
        }
      }

      normalizeDescriptionEditorAfterInput();
      return;
    }

    const textarea = document.getElementById("product-description-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = textarea.value || "";
    const selectedText = text.substring(startPos, endPos);

    let replacement = "";
    switch (type) {
      case "bold":
        replacement = `**${selectedText || "Chữ in đậm"}**`;
        break;
      case "italic":
        replacement = `*${selectedText || "Chữ in nghiêng"}*`;
        break;
      case "align-left":
        replacement = `<div class="text-left">\n${selectedText || "Nội dung căn trái"}\n</div>`;
        break;
      case "align-center":
        replacement = `<div class="text-center">\n${selectedText || "Nội dung căn giữa"}\n</div>`;
        break;
      case "align-right":
        replacement = `<div class="text-right">\n${selectedText || "Nội dung căn phải"}\n</div>`;
        break;
      case "align-justify":
  replacement = `<div style="text-align: justify;">\n${selectedText || "Nội dung căn đều hai bên"}\n</div>`;
  break;
      case "image":
        replacement = `\n![Mô tả ảnh](${selectedText || "url_hinh_anh_voltara_banner_v.png"})\n`;
        break;
      case "bullet":
        replacement = `\n- ${selectedText || "Mục dòng liệt kê"}`;
        break;
      case "heading":
        replacement = `\n### ${selectedText || "Tiêu đề phụ"}\n`;
        break;
      case "link":
        replacement = `[${selectedText || "Văn bản hiển thị"}](https://voltara.vn)`;
        break;
    }

    const newContent = text.substring(0, startPos) + replacement + text.substring(endPos);
    setProductForm(prev => ({ ...prev, description: newContent }));
    
    // reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + replacement.length, startPos + replacement.length);
    }, 50);
  };

  const setupDescriptionEditor = () => {
    const iframe = descriptionEditorRef.current;
    const doc = getDescriptionEditorDocument();
    if (!iframe || !doc) return;

    doc.open();
    doc.write(`<!doctype html>
      <html>
        <head>
          <style>
            html, body {
              min-height: 100%;
              margin: 0;
              background: #000;
              color: #ececec;
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.7;
            }
            body {
              padding: 12px 14px;
              outline: none;
              white-space: normal;
            }
            body:empty:before {
              content: "Nhập hoặc dán mô tả từ Word/Excel vào đây...";
              color: #6b7280;
            }
            p, div { margin: 0 0 8px; }
            h3 {
              margin: 12px 0 6px;
              color: #f5c45a;
              font-size: 13px;
              font-weight: 800;
              text-transform: uppercase;
            }
            a { color: #f5c45a; }
            ul, ol { padding-left: 22px; margin: 8px 0; }
            img {
              display: block;
              max-width: 100%;
              max-height: 420px;
              object-fit: contain;
              margin: 12px auto;
              border: 1px solid rgba(255,255,255,.12);
              background: #000;
              padding: 8px;
            }
            table {
              width: 100%;
              min-width: 560px;
              margin: 16px 0;
              border-collapse: collapse;
              border: 1px solid rgba(245,196,90,.38);
              background: rgba(0,0,0,.24);
              color: #e5e7eb;
            }
            th, td {
              border: 1px solid rgba(255,255,255,.22);
              padding: 7px 10px;
              vertical-align: top;
              text-align: left;
            }
            th, tr:first-child td {
              background: rgba(245,196,90,.12);
              color: #fff;
              font-weight: 700;
            }
          </style>
        </head>
        <body contenteditable="true">${descriptionDraftRef.current || productForm.description || ""}</body>
      </html>`);
    doc.close();
    doc.designMode = "on";

    const handleInput = () => normalizeDescriptionEditorAfterInput();
    const handlePaste = (event: ClipboardEvent) => handleDescriptionPaste(event);
    doc.body.addEventListener("input", handleInput);
    doc.body.addEventListener("paste", handlePaste);
  };

  const handleCloudinaryUpload = async (
    files: FileList | null,
    target: "main" | "gallery" | "description",
  ) => {
    if (!files || files.length === 0) return;

    if (!isCloudinaryConfigured()) {
      showToast("Chưa cấu hình Cloudinary. Thêm NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME và NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.", "warning");
      return;
    }

    const selectedFiles = Array.from(files);
    setUploadingImageTarget(target);

    try {
      const urls: string[] = [];
      for (const file of selectedFiles) {
        urls.push(await uploadImageToCloudinary(file));
      }

      if (target === "main") {
        setProductForm(prev => ({
          ...prev,
          image: urls[0],
          images: urls.length > 1 ? [...(prev.images || []), ...urls.slice(1)] : prev.images,
        }));
      }

      if (target === "gallery") {
        setProductForm(prev => ({
          ...prev,
          images: [...(prev.images || []), ...urls],
        }));
      }

      if (target === "description") {
        const imageHtml = urls.map((url, index) => (
          `<img src="${url}" alt="Ảnh sản phẩm ${index + 1}" class="my-5 h-auto w-full object-contain border border-white/10 bg-black p-3" referrerPolicy="no-referrer" />`
        )).join("");

        if (descriptionEditorRef.current && !isToolbarPreviewMode) {
          insertHtmlIntoDescriptionEditor(imageHtml);
        } else {
          setProductForm(prev => ({
            ...prev,
            description: prev.description ? `${prev.description}\n${imageHtml}` : imageHtml,
          }));
        }
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải ảnh lên Cloudinary.";
      showToast(message, "error");
    } finally {
      setUploadingImageTarget(null);
    }
  };

  const insertImageUrlToDescription = (url: string, alt = "Ảnh sản phẩm") => {
    if (!url.trim()) return;

    if (descriptionEditorRef.current && !isToolbarPreviewMode) {
      insertHtmlIntoDescriptionEditor(`<img src="${url.trim()}" alt="${alt.replace(/"/g, "&quot;")}" class="my-5 h-auto w-full object-contain border border-white/10 bg-black p-3" referrerPolicy="no-referrer" />`);
      return;
    }

    const markdownImage = `![${alt}](${url.trim()})`;
    setProductForm(prev => ({
      ...prev,
      description: prev.description ? `${prev.description}\n${markdownImage}` : markdownImage,
    }));
    setIsToolbarPreviewMode(false);
  };

  const handleDescriptionPaste = (event: React.ClipboardEvent<HTMLDivElement> | ClipboardEvent) => {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;
    const html = clipboardData.getData("text/html");
    const text = clipboardData.getData("text/plain");

    if (html) {
      const sanitizedHtml = sanitizeDescriptionHtml(html);
      if (sanitizedHtml) {
        event.preventDefault();
        insertHtmlIntoDescriptionEditor(sanitizedHtml);
      }
      return;
    }

    if (!text) return;

    event.preventDefault();
    const escapedText = text
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => {
        const div = document.createElement("div");
        div.textContent = paragraph;
        return `<p>${div.innerHTML.replace(/\n/g, "<br />")}</p>`;
      })
      .join("");
    insertHtmlIntoDescriptionEditor(escapedText);
  };

  const extractSpecsFromClipboard = (clipboardData: DataTransfer) => {
    const html = clipboardData.getData("text/html");
    const text = clipboardData.getData("text/plain");
    const rows: Array<[string, string]> = [];

    if (html && /<table[\s>]/i.test(html)) {
      const doc = new DOMParser().parseFromString(html, "text/html");
      doc.querySelectorAll("tr").forEach((row) => {
        const cells = Array.from(row.querySelectorAll("th,td"))
          .map((cell) => (cell.textContent || "").replace(/\s+/g, " ").trim())
          .filter(Boolean);
        if (cells.length >= 2) rows.push([cells[0], cells.slice(1).join(" ")]);
      });
    }

    if (!rows.length && text) {
      text.split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => {
          const cells = line.includes("\t")
            ? line.split("\t")
            : line.split(/\s{2,}/);
          const cleanCells = cells.map((cell) => cell.replace(/\s+/g, " ").trim()).filter(Boolean);
          if (cleanCells.length >= 2) rows.push([cleanCells[0], cleanCells.slice(1).join(" ")]);
        });
    }

    return rows.filter(([key, value]) => {
      const normalizedKey = key.toLowerCase();
      const normalizedValue = value.toLowerCase();
      return key && value && !(normalizedKey.includes("thông số") && normalizedValue.includes("chi tiết"));
    });
  };

  const handleSpecsPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const rows = extractSpecsFromClipboard(event.clipboardData);
    if (!rows.length) return;

    event.preventDefault();

    setProductForm(prev => {
      const nextSpecs = { ...(prev.specs || {}) };
      rows.forEach(([key, value]) => {
        nextSpecs[key] = value;
      });
      return { ...prev, specs: nextSpecs };
    });

    setNewSpecKey("");
    setNewSpecValue("");
    showToast(`Da nhap ${rows.length} thong so tu bang.`, "success");
  };

  const descriptionImages = getDescriptionImages(productForm.description);

  
  const handleUpdateDescriptionImage = (imageIndex: number, nextUrl: string) => {
    const images = getDescriptionImages(productForm.description);
    const target = images[imageIndex];
    if (!target) return;

    setProductForm(prev => ({
      ...prev,
      description: (prev.description || "").replace(target.markdown, `![${target.alt}](${nextUrl})`),
    }));
  };

  const handleRemoveDescriptionImage = (imageIndex: number) => {
    const images = getDescriptionImages(productForm.description);
    const target = images[imageIndex];
    if (!target) return;

    setProductForm(prev => ({
      ...prev,
      description: (prev.description || "").replace(target.markdown, "").replace(/\n{3,}/g, "\n\n").trim(),
    }));
  };

  const handleAddSpecItem = () => {
    const specKey = newSpecKey.trim();
    const specValue = newSpecValue.trim();
    if (!specKey || !specValue) return;
    setProductForm(prev => ({
      ...prev,
      specs: {
        ...(prev.specs || {}),
        [specKey]: specValue,
      }
    }));
    setNewSpecKey("");
    setNewSpecValue("");
  };

  const handleRemoveSpecItem = (key: string) => {
    setProductForm(prev => {
      const copy = { ...(prev.specs || {}) };
      delete copy[key];
      return { ...prev, specs: copy };
    });
  };

  const handleUpdateSpecValue = (key: string, value: string) => {
    setProductForm(prev => ({
      ...prev,
      specs: {
        ...(prev.specs || {}),
        [key]: value,
      },
    }));
  };

  const escapeExcelCell = (value: unknown) => {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  const formatSpecsForExport = (specs: Product["specs"] | undefined) => {
    return Object.entries(specs || {})
      .filter(([, value]) => String(value || "").trim())
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  };

  const handleExportProductsExcel = () => {
    const exportRows = filteredAdminProducts.length ? filteredAdminProducts : products;
    if (!exportRows.length) {
      showToast("Chua co san pham de xuat file.", "warning");
      return;
    }

    const columns: Array<[string, (product: Product) => unknown]> = [
      ["ID", (product) => product.id],
      ["Ten san pham", (product) => product.name],
      ["Danh muc", (product) => product.category],
      ["Danh muc con", (product) => product.subCategory],
      ["Thuong hieu", (product) => product.brand],
      ["Dien ap", (product) => product.voltage],
      ["Dung luong", (product) => product.capacity],
      ["Cell", (product) => product.cellType],
      ["Bao hanh", (product) => product.warranty],
      ["Gia ban", (product) => product.price],
      ["Gia giam", (product) => product.salePrice],
      ["SKU", (product) => product.sku],
      ["Barcode", (product) => product.barcode],
      ["So ton", (product) => product.stockQuantity],
      ["Trang thai kho", (product) => product.stockStatus],
      ["Cho dong bo", (product) => product.syncEnabled ? "Co" : "Khong"],
      ["Kenh dong bo", (product) => product.syncChannel],
      ["External Product ID", (product) => product.externalProductId || product.haravanProductId],
      ["External Variant ID", (product) => product.externalVariantId || product.haravanVariantId],
      ["Lan dong bo gan nhat", (product) => product.lastSyncedAt],
      ["Trang thai hien thi", (product) => product.hidden ? "Dang an" : "Dang hien"],
      ["Anh dai dien", (product) => product.image],
      ["Anh bo sung", (product) => (product.images || []).join("\n")],
      ["Video", (product) => (product.videoUrls || []).join("\n")],
      ["Mo ta", (product) => product.description],
      ["Thong so ky thuat", (product) => formatSpecsForExport(product.specs)],
      ["Ngay tao", (product) => product.createdAt],
      ["Ngay cap nhat", (product) => product.updatedAt],
    ];

    const headerCells = columns.map(([label]) => `<th>${escapeExcelCell(label)}</th>`).join("");
    const bodyRows = exportRows.map((product) => (
      `<tr>${columns.map(([, getter]) => `<td style="mso-number-format:'\\@'; white-space:pre-wrap;">${escapeExcelCell(getter(product))}</td>`).join("")}</tr>`
    )).join("");
    const workbook = `<!doctype html><html><head><meta charset="UTF-8" /></head><body><table border="1"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`;
    const blob = new Blob(["\ufeff", workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const today = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.download = `voltara-products-${today}.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast(`Da xuat ${exportRows.length} san pham ra Excel.`, "success");
  };

  return (
    <div id="products-admin-module" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-display font-semibold tracking-wide text-white uppercase flex items-center gap-2 text-gold-light">
            <Battery className="w-4 h-4 scale-110" />
            QUẢN LÝ KHO HÀNG SẢN PHẨM ({products.length})
          </h2>
          <p className="text-xs text-gray-400">Xem và hiệu chỉnh dòng xả sạc, dung lượng pin, bảo hành kỹ thuật của các dòng sản phẩm.</p>
        </div>
        
        <button
          onClick={() => handleOpenProductModal()}
          className="gold-gradient-bg hover:opacity-95 text-black font-display font-bold py-2.5 px-4 text-[11px] tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </div>

      <div className="border border-gold-dark/20 bg-black/50 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-[11px] font-display font-black uppercase tracking-widest text-[#F5C45A]">Danh muc san pham</h3>
            <p className="mt-1 text-[10px] text-gray-500">
              {productCategories.length} danh muc cha. Mo khi can them, sua, an/xoa danh muc.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCategoryPanelOpen((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 border border-gold-dark/35 px-4 py-2.5 text-[10px] font-display font-bold uppercase tracking-widest text-gold-light transition-colors hover:border-gold-light hover:text-white"
          >
            {isCategoryPanelOpen ? "Thu gon danh muc" : "Mo danh muc"}
            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isCategoryPanelOpen ? "rotate-90" : ""}`} />
          </button>
        </div>

        {isCategoryPanelOpen && (
          <>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-t border-white/5 pt-4">
              <p className="max-w-xl text-[10px] text-gray-500">
                Them, sua, an/xoa danh muc cha va danh muc con. Khi them san pham, neu danh muc cha co danh muc con thi se hien them o chon ben duoi.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 lg:min-w-[420px]">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddProductCategory();
                }
              }}
              placeholder="Ten danh muc moi"
              className="flex-1 bg-black border border-[#1A1A1A] text-xs px-3 py-2.5 text-[#ECECEC] focus:outline-none focus:border-gold-light"
            />
            <button
              type="button"
              onClick={handleAddProductCategory}
              className="gold-gradient-bg text-black font-display font-bold px-4 py-2.5 text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Them danh muc
            </button>
              </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {productCategories.map((category) => (
            <div key={category.id} className="border border-white/10 bg-[#070707] p-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-center">
                <div className="space-y-1">
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => handleUpdateProductCategory(category.id, { name: e.target.value })}
                    className="w-full bg-black border border-[#1A1A1A] text-xs px-3 py-2 text-white focus:outline-none focus:border-gold-light font-display font-bold uppercase"
                  />
                  <div className="text-[9px] text-gray-600 font-mono">ID: {category.id}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateProductCategory(category.id, { hidden: !category.hidden })}
                  className={`border px-3 py-2 text-[9px] font-display font-bold uppercase tracking-wider ${category.hidden ? "border-gray-700 text-gray-400" : "border-emerald-500/25 text-emerald-400"}`}
                >
                  {category.hidden ? "Dang an" : "Dang hien"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProductCategory(category.id)}
                  className="border border-red-500/20 bg-red-500/10 px-3 py-2 text-[9px] font-display font-bold uppercase tracking-wider text-red-400 hover:bg-red-500 hover:text-white"
                >
                  Xoa
                </button>
              </div>

              <div className="space-y-2 border-t border-white/5 pt-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newChildCategoryNames[category.id] || ""}
                    onChange={(e) => setNewChildCategoryNames((prev) => ({ ...prev, [category.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddChildCategory(category.id);
                      }
                    }}
                    placeholder="Ten danh muc con"
                    className="flex-1 bg-black border border-[#1A1A1A] text-xs px-3 py-2 text-[#ECECEC] focus:outline-none focus:border-gold-light"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddChildCategory(category.id)}
                    className="border border-gold-dark/40 px-3 py-2 text-[9px] font-display font-bold uppercase tracking-wider text-gold-light hover:border-gold-light"
                  >
                    Them con
                  </button>
                </div>

                {(category.children || []).length > 0 && (
                  <div className="space-y-1.5">
                    {(category.children || []).map((child) => (
                      <div key={child.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-center bg-black/70 border border-white/5 p-2">
                        <input
                          type="text"
                          value={child.name}
                          onChange={(e) => handleUpdateChildCategory(category.id, child.id, { name: e.target.value })}
                          className="w-full bg-[#050505] border border-[#1A1A1A] text-[11px] px-3 py-2 text-white focus:outline-none focus:border-gold-light font-display font-bold uppercase"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateChildCategory(category.id, child.id, { hidden: !child.hidden })}
                          className={`border px-2 py-2 text-[8.5px] font-display font-bold uppercase tracking-wider ${child.hidden ? "border-gray-700 text-gray-400" : "border-emerald-500/25 text-emerald-400"}`}
                        >
                          {child.hidden ? "An" : "Hien"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteChildCategory(category.id, child.id)}
                          className="text-red-400 hover:text-white text-[9px] font-display font-bold uppercase"
                        >
                          Xoa
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
          </>
        )}
      </div>

      <div className="border border-white/5 bg-black/40 p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-5 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="search"
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, ID, thương hiệu hoặc danh mục..."
              className="w-full bg-black border border-[#1A1A1A] text-[#ECECEC] pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-gold-light"
            />
          </div>

          <select
            value={productVisibilityFilter}
            onChange={(e) => setProductVisibilityFilter(e.target.value as "all" | "visible" | "hidden")}
            className="lg:col-span-3 bg-black border border-[#1A1A1A] text-[#ECECEC] px-3 py-2.5 text-xs focus:outline-none focus:border-gold-light font-display font-bold uppercase"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="visible">Đang hiển thị</option>
            <option value="hidden">Đang ẩn</option>
          </select>

          <div className="lg:col-span-4 flex items-stretch justify-between gap-2">
            <div className="flex border border-[#1A1A1A] bg-black">
              <button
                type="button"
                onClick={() => setAdminViewMode("grid")}
                className={`w-10 flex items-center justify-center transition-colors ${adminViewMode === "grid" ? "bg-gold-dark text-black" : "text-gray-400 hover:text-white"}`}
                title="Dạng thẻ"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setAdminViewMode("list")}
                className={`w-10 flex items-center justify-center transition-colors ${adminViewMode === "list" ? "bg-gold-dark text-black" : "text-gray-400 hover:text-white"}`}
                title="Dạng danh sách"
              >
                <Rows3 className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportProductsExcel}
              className="flex items-center justify-center gap-1.5 px-3 border border-gold-dark/40 bg-black text-[10px] text-gold-light font-display font-bold uppercase tracking-widest hover:border-gold-light transition-colors"
              title="Xuat file Excel san pham"
            >
              <Download className="w-3.5 h-3.5" />
              Excel
            </button>

            <div className="flex items-center px-3 border border-[#1A1A1A] bg-black text-[10px] text-gray-500 font-mono uppercase">
              {filteredAdminProducts.length}/{products.length} sản phẩm
            </div>
          </div>
        </div>
      </div>

      {/* Catalog lists */}
      {filteredAdminProducts.length === 0 ? (
        <div className="border border-white/5 bg-black/50 py-14 text-center">
          <Search className="w-9 h-9 text-gray-600 mx-auto mb-3" />
          <p className="text-xs text-gray-400 font-display font-bold uppercase tracking-widest">Không tìm thấy sản phẩm phù hợp</p>
        </div>
      ) : (
        <div className={adminViewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6" : "space-y-2 mt-6"}>
          {filteredAdminProducts.map((prod) => (
            <div
              key={prod.id}
              className={`bg-black/80 border transition-all duration-300 ${
                prod.hidden
                  ? "border-gray-800 opacity-70 hover:opacity-100"
                  : "border-[#1A1A1A] hover:border-gold-dark/40"
              } ${adminViewMode === "grid" ? "p-4 flex flex-col justify-between" : "p-3 flex flex-col md:flex-row md:items-center gap-3"}`}
            >
              <div className={`flex items-start gap-4 ${adminViewMode === "list" ? "flex-1 min-w-0" : ""}`}>
                <div className={`${adminViewMode === "grid" ? "w-16 h-16" : "w-12 h-12"} bg-[#111] border border-[#222] p-1 flex items-center justify-center shrink-0`}>
                  {prod.image ? (
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="px-1 text-center text-[9px] font-display font-bold uppercase leading-tight text-gray-600">
                      Chua co anh
                    </span>
                  )}
                </div>
                <div className={`space-y-1 min-w-0 ${adminViewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-mono text-gold-light tracking-wide bg-gold-dark/10 p-0.5">{[prod.voltage, prod.capacity].filter(Boolean).join(" / ")}</span>
                    <span className="text-[9px] text-gray-500 font-mono">ID: {prod.id}</span>
                    <span className={`text-[9px] font-display font-bold uppercase px-2 py-0.5 border ${prod.hidden ? "text-gray-400 border-gray-700 bg-gray-900/60" : "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"}`}>
                      {prod.hidden ? "Đang ẩn" : "Đang hiện"}
                    </span>
                  </div>
                  <h3 className="text-xs font-display font-bold text-white uppercase line-clamp-1 leading-snug">{prod.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="text-gray-500 font-bold">{prod.salePrice || prod.price || "Liên hệ"}</span>
                    <span className="text-gray-600">/</span>
                    <span className="text-gray-500 font-mono uppercase">{getCategoryDisplayName(prod.category, prod.subCategory)}</span>
                  </div>
                  {adminViewMode === "grid" && (
                    <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                      {getProductDescriptionExcerpt(prod.description, prod.name, 140)}
                    </p>
                  )}

                </div>
              </div>

              <div className={`${adminViewMode === "grid" ? "mt-4 pt-3 border-t border-[#1A1A1A] flex items-center justify-between" : "flex items-center justify-end gap-2 shrink-0"}`}>
                {adminViewMode === "grid" && (
                  <span className="text-[9px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 font-bold uppercase">{getCategoryDisplayName(prod.category, prod.subCategory)}</span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleProductVisibility(prod)}
                    className={`bg-[#111] hover:bg-[#222] border border-white/5 text-[10px] font-display uppercase tracking-wider px-2.5 py-1 flex items-center gap-1 transition-all cursor-pointer ${prod.hidden ? "text-emerald-400" : "text-gray-400"}`}
                    title={prod.hidden ? "Bật hiển thị sản phẩm" : "Ẩn sản phẩm khỏi trang công khai"}
                  >
                    {prod.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {prod.hidden ? "Hiện" : "Ẩn"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyProduct(prod)}
                    className="bg-[#111] hover:bg-[#222] border border-white/5 text-[10px] font-display uppercase tracking-wider text-[#A3E635] px-2.5 py-1 flex items-center gap-1 transition-all cursor-pointer"
                    title="Nhân bản sản phẩm"
                  >
                    <Copy className="w-3 h-3 text-[#A3E635]" />
                    Nhân bản
                  </button>
                  <button
                    onClick={() => handleOpenProductModal(prod)}
                    className="bg-[#111] hover:bg-[#222] border border-white/5 text-[10px] font-display uppercase tracking-wider text-white px-2.5 py-1 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Edit className="w-3 h-3 text-[#F5C45A]" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteProductPrompt(prod.id, prod.name)}
                    className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[10px] px-2 py-1 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POPUP MODAL */}
      {isProductModalOpen && (
        <div id="product-admin-modal" className="fixed inset-0 bg-black/95 z-50 flex min-h-0 overflow-hidden px-3 lg:px-6" onWheel={handleProductModalWheel}>
          <div className="bg-[#0A0A0A] border border-gold-dark/40 w-full max-w-6xl mx-auto h-full min-h-0 overflow-hidden shadow-[0_15px_50px_rgba(216,154,43,0.15)] flex flex-col">
            <div className="shrink-0 px-4 py-4 sm:px-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-sm font-display font-black tracking-widest text-[#F5C45A] uppercase flex items-center gap-2">
                <Battery className="w-4 h-4 text-gold-light" />
                {editingProduct ? "CHỈNH SỬA SẢN PHẨM" : "THÊM SẢN PHẨM MỚI"}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form ref={productFormScrollRef} id="product-admin-form" onSubmit={handleSaveProduct} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:p-6 sm:pb-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">ID Sản phẩm (Độc nhất)</label>
                  <input
                    type="text"
                    required
                    value={productForm.id}
                    onChange={(e) => setProductForm(prev => ({ ...prev, id: e.target.value }))}
                    className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Tên Sản phẩm</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Slug URL SEO</label>
                    <button
                      type="button"
                      onClick={() => setProductForm(prev => ({ ...prev, slug: slugifyProductText(`${prev.name || ""}-${prev.id || ""}`) }))}
                      className="text-[9px] font-display font-bold uppercase tracking-wider text-gold-light hover:text-white"
                    >
                      Tự tạo slug
                    </button>
                  </div>
                  <input
                    type="text"
                    value={productForm.slug || ""}
                    onChange={(e) => setProductForm(prev => ({ ...prev, slug: slugifyProductText(e.target.value) }))}
                    placeholder="tu-dong-tao-tu-ten-va-id-neu-de-trong"
                    className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-gray-500">
                    URL: /san-pham/{productForm.slug || slugifyProductText(`${productForm.name || ""}-${productForm.id || ""}`) || "slug-san-pham"}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Nhãn hiệu điện thế (Voltage)</label>
                  <input
                    type="text"
                    required
                    value={productForm.voltage}
                    onChange={(e) => setProductForm(prev => ({ ...prev, voltage: e.target.value }))}
                    className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Dung lượng (Capacity)</label>
                  <input
                    type="text"
                    value={productForm.capacity}
                    onChange={(e) => setProductForm(prev => ({ ...prev, capacity: e.target.value }))}
                    className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Giá bán</label>
                  <input
                    type="text"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="VD: 600000 hoặc 600.000đ"
                    className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Giá giảm (nếu có)</label>
                  <input
                    type="text"
                    value={productForm.salePrice}
                    onChange={(e) => setProductForm(prev => ({ ...prev, salePrice: e.target.value }))}
                    placeholder="VD: 550000 hoặc 550.000đ"
                    className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Danh mục sản phẩm (Category)</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value, subCategory: "" }))}
                    className="w-full bg-black border border-[#1A1A1A] text-xs px-3.5 py-2.5 text-[#ECECEC] focus:outline-none uppercase font-bold"
                  >
                    <option value="">CHỌN DANH MỤC</option>
                    {productCategories
                      .filter((category) => !category.hidden)
                      .map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-2 border border-gold-dark/20 bg-[#080808] p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-[11px] font-display font-black uppercase tracking-widest text-[#F5C45A]">Phan loai san pham</h3>
                      <p className="mt-1 text-[10px] text-gray-500">Neu gia rieng de trong, phan loai se dung gia cua san pham chinh. Anh rieng se hien khi khach chon phan loai.</p>
                    </div>
                    <button type="button" onClick={handleAddVariant} className="inline-flex items-center gap-1.5 border border-gold-dark/40 px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest text-gold-light hover:border-gold-light hover:text-white">
                      <Plus className="w-3.5 h-3.5" />
                      Them phan loai
                    </button>
                  </div>
                  {(productForm.variants || []).length > 0 ? (
                    <div className="space-y-3">
                      {(productForm.variants || []).map((variant, index) => (
                        <div key={variant.id || index} className="border border-white/10 bg-black/70 p-3 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-gray-400">Phan loai {index + 1}</span>
                            <button type="button" onClick={() => handleRemoveVariant(index)} className="p-1.5 text-gray-500 hover:text-red-400" aria-label="Xoa phan loai">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <input type="text" value={variant.name || ""} onChange={(e) => handleUpdateVariant(index, { name: e.target.value })} placeholder="Ten phan loai" className="md:col-span-2 w-full bg-[#050505] border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none" />
                            <input type="text" value={variant.price || ""} onChange={(e) => handleUpdateVariant(index, { price: e.target.value })} placeholder={productForm.price || "Gia rieng"} className="w-full bg-[#050505] border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none" />
                            <input type="text" value={variant.salePrice || ""} onChange={(e) => handleUpdateVariant(index, { salePrice: e.target.value })} placeholder={productForm.salePrice || "Gia giam rieng"} className="w-full bg-[#050505] border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none" />
                            <input type="text" value={variant.sku || ""} onChange={(e) => handleUpdateVariant(index, { sku: e.target.value })} placeholder={productForm.sku || "SKU rieng"} className="w-full bg-[#050505] border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none font-mono" />
                            <input type="number" min="0" value={variant.stockQuantity || ""} onChange={(e) => handleUpdateVariant(index, { stockQuantity: e.target.value })} placeholder="So ton" className="w-full bg-[#050505] border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none" />
                            <input type="text" value={variant.image || ""} onChange={(e) => handleUpdateVariant(index, { image: e.target.value })} placeholder={productForm.image || "URL anh phan loai"} className="md:col-span-2 w-full bg-[#050505] border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none font-mono" />
                          </div>
                          {variant.image && (
                            <div className="h-20 w-24 border border-white/10 bg-[#050505] p-1.5">
                              <img src={variant.image} alt={variant.name || ""} className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-white/10 bg-black/40 px-4 py-5 text-[10px] text-gray-500">Chua co phan loai. San pham se hien mot gia va mot anh dai dien nhu hien tai.</div>
                  )}
                </div>

                {activeProductSubCategories.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Danh mục con</label>
                    <select
                      value={productForm.subCategory || ""}
                      onChange={(e) => setProductForm(prev => ({ ...prev, subCategory: e.target.value }))}
                      className="w-full bg-black border border-[#1A1A1A] text-xs px-3.5 py-2.5 text-[#ECECEC] focus:outline-none uppercase font-bold"
                    >
                      <option value="">KHÔNG CHỌN</option>
                      {activeProductSubCategories.map((child) => (
                        <option key={child.id} value={child.id}>{child.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Cell</label>
                  <input
                    type="text"
                    value={productForm.cellType}
                    onChange={(e) => setProductForm(prev => ({ ...prev, cellType: e.target.value }))}
                    placeholder="VD: Pin Lithium Sắt Phosphate (LiFePO4)"
                    className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Bảo hành</label>
                  <input
                    type="text"
                    value={productForm.warranty}
                    onChange={(e) => setProductForm(prev => ({ ...prev, warranty: e.target.value }))}
                    placeholder="VD: 24 tháng"
                    className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 border border-gold-dark/20 bg-[#080808] p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-[11px] font-display font-black uppercase tracking-widest text-[#F5C45A]">Thong tin kho & SKU</h3>
                      <p className="mt-1 text-[10px] text-gray-500">Chuan bi du lieu de sau nay lien ket Nhanh.vn, Haravan, Shopee, Tiki, TikTok Shop.</p>
                    </div>
                    <label className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(productForm.syncEnabled)}
                        onChange={(e) => setProductForm(prev => ({ ...prev, syncEnabled: e.target.checked }))}
                        className="w-3.5 h-3.5 accent-gold-dark"
                      />
                      Cho dong bo
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">SKU</label>
                      <input
                        type="text"
                        value={productForm.sku}
                        onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                        placeholder="VD: QZJ004-21V"
                        className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Barcode</label>
                      <input
                        type="text"
                        value={productForm.barcode}
                        onChange={(e) => setProductForm(prev => ({ ...prev, barcode: e.target.value }))}
                        placeholder="EAN/UPC neu co"
                        className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">So ton</label>
                      <input
                        type="number"
                        min="0"
                        value={productForm.stockQuantity}
                        onChange={(e) => setProductForm(prev => ({ ...prev, stockQuantity: e.target.value }))}
                        placeholder="VD: 20"
                        className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Trang thai kho</label>
                      <select
                        value={productForm.stockStatus}
                        onChange={(e) => setProductForm(prev => ({ ...prev, stockStatus: e.target.value as Product["stockStatus"] }))}
                        className="w-full bg-black border border-[#1A1A1A] text-xs px-3.5 py-2.5 text-[#ECECEC] focus:outline-none uppercase font-bold"
                      >
                        <option value="">Chua dat</option>
                        <option value="in-stock">Con hang</option>
                        <option value="low-stock">Sap het</option>
                        <option value="out-of-stock">Het hang</option>
                        <option value="preorder">Cho dat truoc</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-white/5 pt-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Kenh dong bo</label>
                      <select
                        value={productForm.syncChannel}
                        onChange={(e) => setProductForm(prev => ({ ...prev, syncChannel: e.target.value as Product["syncChannel"] }))}
                        className="w-full bg-black border border-[#1A1A1A] text-xs px-3.5 py-2.5 text-[#ECECEC] focus:outline-none uppercase font-bold"
                      >
                        <option value="">Chua chon</option>
                        <option value="nhanh">Nhanh.vn</option>
                        <option value="haravan">Haravan</option>
                        <option value="kiotviet">KiotViet</option>
                        <option value="sapo">Sapo</option>
                        <option value="other">Khac</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">External Product ID</label>
                      <input
                        type="text"
                        value={productForm.externalProductId}
                        onChange={(e) => setProductForm(prev => ({ ...prev, externalProductId: e.target.value }))}
                        placeholder="De trong neu chua lien ket"
                        className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">External Variant ID</label>
                      <input
                        type="text"
                        value={productForm.externalVariantId}
                        onChange={(e) => setProductForm(prev => ({ ...prev, externalVariantId: e.target.value }))}
                        placeholder="Ma bien the kho"
                        className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Lan dong bo gan nhat</label>
                      <input
                        type="text"
                        value={productForm.lastSyncedAt || "Chua dong bo"}
                        readOnly
                        className="w-full bg-black/60 border border-[#1A1A1A] text-gray-500 px-3.5 py-2.5 text-xs focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <label className="col-span-1 sm:col-span-2 flex items-center justify-between gap-4 border border-[#1A1A1A] bg-black/70 px-4 py-3 cursor-pointer">
                  <div className="space-y-1">
                    <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#ECECEC]">
                      Ẩn sản phẩm khỏi website công khai
                    </span>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Sản phẩm vẫn còn trong quản trị để sửa lại, nhưng không hiện ở trang chủ và danh sách sản phẩm.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(productForm.hidden)}
                    onChange={(e) => setProductForm(prev => ({ ...prev, hidden: e.target.checked }))}
                    className="w-4 h-4 accent-gold-dark"
                  />
                </label>

                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-[#F5C45A]">Đường dẫn ảnh Đại diện chính</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className={`inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest border cursor-pointer transition-colors ${uploadingImageTarget === "main" ? "border-gold-light text-gold-light" : "border-gold-dark/40 text-gold-light hover:border-gold-light"}`}>
                      {uploadingImageTarget === "main" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>{uploadingImageTarget === "main" ? "Đang tải..." : "Tải ảnh từ máy"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        disabled={Boolean(uploadingImageTarget)}
                        onChange={(e) => {
                          handleCloudinaryUpload(e.target.files, "main");
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {!isCloudinaryConfigured() && (
                      <span className="text-[10px] text-amber-400">Chưa cấu hình Cloudinary</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={productForm.image}
                    onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full bg-black border border-[#1A1A1A] text-xs px-3.5 py-2.5 text-[#ECECEC] focus:outline-none font-mono"
                  />
                  {productForm.image && (
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="w-24 h-20 bg-black border border-white/10 flex items-center justify-center p-1.5">
                        <img src={productForm.image} alt="Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertImageUrlToDescription(productForm.image || "", productForm.name || "Ảnh sản phẩm")}
                        className="border border-white/15 px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest text-gray-300 hover:border-gold-light hover:text-gold-light transition-colors"
                      >
                        Chèn ảnh này vào mô tả
                      </button>
                    </div>
                  )}
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Đường dẫn ảnh bổ sung (mỗi đường dẫn ảnh đặt trên một dòng)</label>
                  <label className={`inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest border cursor-pointer transition-colors ${uploadingImageTarget === "gallery" ? "border-gold-light text-gold-light" : "border-white/15 text-gray-300 hover:border-gold-light hover:text-gold-light"}`}>
                    {uploadingImageTarget === "gallery" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{uploadingImageTarget === "gallery" ? "Đang tải..." : "Tải ảnh bổ sung"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      disabled={Boolean(uploadingImageTarget)}
                      onChange={(e) => {
                        handleCloudinaryUpload(e.target.files, "gallery");
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <textarea
  rows={4}
  placeholder={"https://example.com/image2.jpg\nhttps://example.com/image3.jpg"}
  value={(productForm.images || []).join("\n")}
  onChange={(e) => {
    const lines = e.target.value.split(/\r?\n/).map((line) => line.trim());
    setProductForm(prev => ({ ...prev, images: lines }));
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter") e.stopPropagation();
  }}
  className="w-full bg-black border border-[#1A1A1A] text-xs px-3.5 py-2.5 text-[#ECECEC] focus:outline-none font-mono placeholder:text-gray-700 leading-relaxed resize-y"
/>
                  {galleryImageUrls.length > 0 && (
  <div className="flex flex-wrap gap-3">
    {galleryImageUrls.map((imageUrl, index) => (
                        <div key={`${imageUrl}-${index}`} className="space-y-2">
                          <div className="w-20 h-16 bg-black border border-white/10 flex items-center justify-center p-1.5">
                            <img src={imageUrl} alt="" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                          <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => insertImageUrlToDescription(imageUrl, `${productForm.name || "Ảnh sản phẩm"} ${index + 1}`)}
                            className="block w-20 border border-white/10 px-1.5 py-1 text-[8.5px] font-display font-bold uppercase tracking-wider text-gray-400 hover:border-gold-light hover:text-gold-light"
                          >
                            Chèn
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dynamic specs builder */}
                <div className="col-span-1 sm:col-span-2 border border-[#1A1A1A] p-4 bg-black/50 space-y-3">
                  <p className="text-[10px] text-gray-500">
                    Copy bang 2 cot tu Word/Excel roi dan vao o ten thong so hoac gia tri de nhap hang loat. Dong nao khong co gia tri se tu an va khong luu.
                  </p>
                  <span className="text-[9px] font-display font-extrabold uppercase tracking-widest text-[#F5C45A] block leading-none">Thong so ky thuat di kem</span>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Ten thong so (Vd: Dong xa lien tuc)"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      onPaste={handleSpecsPaste}
                      className="flex-1 bg-black border border-[#1A1A1A] text-xs px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Gia tri (Vd: 35A)"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      onPaste={handleSpecsPaste}
                      className="flex-1 bg-black border border-[#1A1A1A] text-xs px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpecItem}
                      className="bg-gold-dark/20 hover:bg-gold-dark text-gold-light hover:text-black border border-gold-dark/30 text-xs font-display font-black tracking-widest uppercase transition-all px-4 py-2 cursor-pointer"
                    >
                      Them thong so
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    {visibleSpecEntries.length > 0 ? visibleSpecEntries.map(([key, value]) => (
                      <div key={key} className="grid grid-cols-1 sm:grid-cols-[220px_1fr_auto] items-center gap-2 bg-black/80 px-3 py-2 text-xs text-gray-300 border border-[#1D1D1D]">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{key}:</span>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleUpdateSpecValue(key, e.target.value)}
                          placeholder="Nhap gia tri"
                          className="w-full bg-[#050505] border border-[#1A1A1A] text-xs px-3 py-2 text-[#ECECEC] placeholder:text-gray-700 focus:outline-none focus:border-gold-light"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecItem(key)}
                          className="justify-self-end text-red-400 hover:text-red-500 text-[10px] uppercase font-bold"
                        >
                          Xoa
                        </button>
                      </div>
                    )) : (
                      <p className="border border-dashed border-white/10 bg-black/40 px-3 py-3 text-[10px] text-gray-500">
                        Chua co thong so nao co gia tri. Khi can them, nhap ten thong so va gia tri o phia tren.
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-2">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">
                    Video san pham (YouTube hoac link video, moi link mot dong)
                  </label>
                  <textarea
                    rows={3}
                    placeholder={"https://www.youtube.com/watch?v=...\nhttps://example.com/video.mp4"}
                    value={(productForm.videoUrls || []).join("\n")}
                    onChange={(e) => {
                      const lines = e.target.value.split(/\r?\n/).map((line) => line.trim());
                      setProductForm(prev => ({ ...prev, videoUrls: lines }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.stopPropagation();
                    }}
                    className="w-full bg-black border border-[#1A1A1A] text-xs px-3.5 py-2.5 text-[#ECECEC] focus:outline-none font-mono placeholder:text-gray-700 leading-relaxed resize-y"
                  />
                  <p className="text-[10px] text-gray-500">
                    Ho tro YouTube, youtu.be, YouTube Shorts, link .mp4, .webm, .ogg. Link khac se hien nut mo video.
                  </p>
                  {productVideoEmbeds.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {productVideoEmbeds.map((video, index) => video && (
                        <div key={`${video.originalUrl}-${index}`} className="border border-white/10 bg-black p-3">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-[9px] font-display font-bold uppercase tracking-widest text-gold-light">
                              {video.provider === "youtube" ? "YouTube" : video.provider === "direct" ? "Video file" : "Link ngoai"}
                            </span>
                            <a href={video.originalUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] uppercase tracking-wider text-gray-500 hover:text-gold-light">
                              Mo link
                            </a>
                          </div>
                          {video.embedUrl ? (
                            <iframe
                              src={video.embedUrl}
                              title={`Video san pham ${index + 1}`}
                              className="aspect-video w-full border border-white/10 bg-[#050505]"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          ) : video.directUrl ? (
                            <video controls src={video.directUrl} className="aspect-video w-full border border-white/10 bg-[#050505]" />
                          ) : (
                            <div className="flex aspect-video items-center justify-center border border-white/10 bg-[#050505] px-4 text-center text-[11px] text-gray-500">
                              Link nay khong ho tro nhung truc tiep. Nguoi dung se mo video bang nut lien ket.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-2">
                  <div className="sticky top-0 z-30 border-b border-[#1A1A1A] bg-[#0A0A0A]/95 pb-2 pt-1 backdrop-blur">
                  <div className="flex items-center justify-between pb-1">
                    <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">
                      Mô tả chi tiết và Trình soạn thảo
                    </label>
                    <div className="flex items-center gap-1.5 bg-black p-0.5 border border-[#111]">
                      <button
                        type="button"
                        onClick={() => setIsToolbarPreviewMode(false)}
                        className={`text-[9.5px] font-display font-bold uppercase py-1 px-2.5 tracking-wider transition-colors cursor-pointer ${!isToolbarPreviewMode ? "gold-gradient-bg text-black font-black" : "text-gray-400 hover:text-white"}`}
                      >
                        Soạn thảo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          syncDescriptionFromEditor(true);
                          setIsToolbarPreviewMode(true);
                        }}
                        className={`text-[9.5px] font-display font-bold uppercase py-1 px-2.5 tracking-wider transition-colors cursor-pointer ${isToolbarPreviewMode ? "gold-gradient-bg text-black font-black" : "text-gray-400 hover:text-white"}`}
                      >
                        Xem trước
                      </button>
                    </div>
                  </div>

                  {/* Toolbar Row (only visible in write mode) */}
                  {!isToolbarPreviewMode && (
                    <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[#0D0D0D] border border-[#1A1A1A] select-none rounded-md">
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertFormatting("undo")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="Hoàn tác"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertFormatting("redo")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="Làm lại"
                      >
                        <Redo2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-[1px] h-4 bg-white/10 mx-1" />

                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertFormatting("bold")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="In đậm (Bold)"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertFormatting("italic")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="In nghiêng (Italic)"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      
                      <div className="w-[1px] h-4 bg-white/10 mx-1" />

                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertFormatting("heading")}
                        className="px-1.5 py-0.5 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer text-[10px] font-display font-black leading-none uppercase border border-white/5"
                        title="Thêm tiêu đề phụ"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertFormatting("bullet")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="Gạch đầu dòng (List)"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-[1px] h-4 bg-white/10 mx-1" />

                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertFormatting("align-left")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="Căn lề trái"
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertFormatting("align-center")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="Căn lề giữa"
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertFormatting("align-right")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="Căn lề phải"
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>

                      <button
  type="button"
  onMouseDown={(event) => event.preventDefault()}
  onClick={() => insertFormatting("align-justify")}
  className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
  title="Căn đều 2 bên"
>
  <AlignJustify className="w-3.5 h-3.5" />
</button>

                      <div className="w-[1px] h-4 bg-white/10 mx-1" />

                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => setIsQuickImagePanelOpen((prev) => !prev)}
                        className={`inline-flex items-center gap-1 px-1.5 py-1 text-[9px] font-display font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          isQuickImagePanelOpen ? "bg-gold-dark text-black" : "text-gray-400 hover:bg-gold-dark/20 hover:text-gold-light"
                        }`}
                        title="Mo khay anh co san de chen vao mo ta"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Anh co san
                      </button>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertFormatting("image")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="Chèn ảnh sinh động dạng URL"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                      <label
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="Tải ảnh và chèn vào mô tả"
                      >
                        {uploadingImageTarget === "description" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          disabled={Boolean(uploadingImageTarget)}
                          onChange={(e) => {
                            handleCloudinaryUpload(e.target.files, "description");
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertFormatting("link")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="Chèn liên kết"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {!isToolbarPreviewMode && isQuickImagePanelOpen && (
                    <div className="mt-2 border border-gold-dark/25 bg-black/95 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                      {quickInsertImages.length > 0 ? (
                        <div className="flex gap-3 overflow-x-auto pb-1">
                          {quickInsertImages.map((imageUrl, index) => (
                            <div key={`${imageUrl}-${index}`} className="w-24 shrink-0 space-y-2">
                              <div className="h-20 w-24 border border-white/10 bg-[#080808] p-1.5">
                                <img src={imageUrl} alt="" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                              </div>
                              <button
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => insertImageUrlToDescription(imageUrl, `${productForm.name || "Anh san pham"} ${index + 1}`)}
                                className="w-full border border-white/10 px-2 py-1.5 text-[8.5px] font-display font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-gold-light hover:text-gold-light"
                              >
                                Chen
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-500">
                          Chua co anh dai dien hoac anh bo sung de chen nhanh.
                        </p>
                      )}
                    </div>
                  )}
                  </div>

                  {isToolbarPreviewMode ? (
                    <div 
                      className="product-description-content w-full bg-black border border-[#1A1A1A] p-4 text-xs leading-relaxed min-h-[260px] text-gray-300 rounded-md font-sans"
                      dangerouslySetInnerHTML={{ __html: formatDescriptionToHtml(productForm.description) }}
                    />
                  ) : (
                    <div
                      key={`${productForm.id || "new"}-${isProductModalOpen ? "open" : "closed"}`}
                      ref={descriptionEditorRef}
                      contentEditable
                      suppressContentEditableWarning
                      data-placeholder="Nhap hoac dan mo ta tu Word/Excel vao day..."
                      onInput={normalizeDescriptionEditorAfterInput}
                      onKeyDown={handleDescriptionEditorKeyDown}
                      onKeyUp={rememberDescriptionSelection}
                      onMouseUp={rememberDescriptionSelection}
                      onPaste={handleDescriptionPaste}
                      title="Trình soạn thảo mô tả sản phẩm"
                      onBlur={() => syncDescriptionFromEditor(true)}
                      className="product-description-content w-full bg-black border border-[#1A1A1A] text-xs px-3.5 py-2.5 text-[#ECECEC] focus:outline-none focus:border-gold-light leading-relaxed font-sans min-h-[260px]"
                      dangerouslySetInnerHTML={{ __html: descriptionDraftRef.current || productForm.description || "" }}
                    />
                  )}

                  {descriptionImages.length > 0 && (
                    <div className="border border-[#1A1A1A] bg-black/60 p-3 space-y-3">
                      <div className="text-[9px] font-display font-extrabold uppercase tracking-widest text-[#F5C45A]">
                        Ảnh trong mô tả
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {descriptionImages.map((image, index) => (
                          <div key={`${image.url}-${index}`} className="grid grid-cols-[88px_1fr_auto] gap-3 items-center border border-white/10 bg-black p-2">
                            <div className="w-20 h-16 border border-white/10 bg-[#080808] flex items-center justify-center p-1">
                              <img src={image.url} alt={image.alt} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                            </div>
                            <input
                              type="text"
                              value={image.url}
                              onChange={(e) => handleUpdateDescriptionImage(index, e.target.value)}
                              className="min-w-0 bg-[#050505] border border-[#1A1A1A] text-[11px] px-3 py-2 text-[#ECECEC] focus:outline-none focus:border-gold-light font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveDescriptionImage(index)}
                              className="px-3 py-2 text-[10px] font-display font-bold uppercase tracking-wider text-red-400 hover:text-white hover:bg-red-500/80 transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Form triggers */}
              <div className="hidden">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-3 border border-white/5 text-xs font-display text-gray-400 font-bold tracking-widest uppercase hover:text-white transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="gold-gradient-bg text-black font-display font-bold py-3 px-6 text-xs tracking-widest uppercase hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Lưu sản phẩm
                </button>
              </div>

            </form>

            <div className="shrink-0 border-t border-[#1A1A1A] bg-[#080808]/95 px-4 py-3 sm:px-6 sm:py-4 shadow-[0_-12px_30px_rgba(0,0,0,0.35)] backdrop-blur flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="px-5 py-3 border border-white/5 text-xs font-display text-gray-400 font-bold tracking-widest uppercase hover:text-white transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="product-admin-form"
                className="gold-gradient-bg text-black font-display font-bold py-3 px-6 text-xs tracking-widest uppercase hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Lưu sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
