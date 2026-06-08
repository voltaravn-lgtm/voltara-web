/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc, writeBatch } from "firebase/firestore";
import { Product, Solution, Article, Branch, Dealer, HomeContent, AboutContent, Job, ContactSubmission, WarrantyRecord, ToastMessage, QuoteRequest } from "../types";
import { PRODUCTS_DATA, SOLUTIONS_DATA, ARTICLES_DATA, BRANCHES_DATA, DEALERS_DATA, JOBS_DATA } from "../data";
import { auth, db, isFirebaseConfigured } from "../lib/firebase";
import { isAdminEmail } from "../lib/adminAuth";

export interface MenuItem {
  name: string;
  path: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  bannerImage: string;
  logoTextImage?: string;
  useLogoImage?: boolean;
}

export interface HeroSettings {
  title: string;
  subtitle: string;
  description: string;
  bannerImage: string;
  logoTextImage?: string;
  useLogoImage?: boolean;
  slides?: HeroSlide[];
  autoplaySpeed?: number;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  source?: string;
  date: string;
}

interface AppContextType {
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  solutions: Solution[];
  setSolutions: React.Dispatch<React.SetStateAction<Solution[]>>;
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  branches: Branch[];
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;
  dealers: Dealer[];
  setDealers: React.Dispatch<React.SetStateAction<Dealer[]>>;
  heroSettings: HeroSettings;
  setHeroSettings: React.Dispatch<React.SetStateAction<HeroSettings>>;
  homeContent: HomeContent;
  setHomeContent: React.Dispatch<React.SetStateAction<HomeContent>>;
  aboutContent: AboutContent;
  setAboutContent: React.Dispatch<React.SetStateAction<AboutContent>>;
  
  // New States
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  contactSubmissions: ContactSubmission[];
  setContactSubmissions: React.Dispatch<React.SetStateAction<ContactSubmission[]>>;
  warranties: WarrantyRecord[];
  setWarranties: React.Dispatch<React.SetStateAction<WarrantyRecord[]>>;
  
  // Dynamic State Modifiers for Easy Administration
  resetToDefault: () => void;
  updateProduct: (product: Product) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateMenuItem: (index: number, updatedItem: MenuItem) => void;
  addMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (index: number) => void;

  // Articles Modifiers
  addArticle: (art: Article) => void;
  updateArticle: (art: Article) => void;
  deleteArticle: (id: string) => void;

  // Jobs Modifiers
  addJob: (jb: Job) => void;
  updateJob: (jb: Job) => void;
  deleteJob: (id: string) => void;

  // Submissions Modifiers
  addSubmission: (sub: ContactSubmission) => void;
  deleteSubmission: (id: string) => void;

  // Warranty Modifiers
  addWarranty: (w: WarrantyRecord) => void;
  updateWarranty: (w: WarrantyRecord) => void;
  deleteWarranty: (id: string) => void;

  // Solutions Modifiers
  addSolution: (sol: Solution) => void;
  updateSolution: (sol: Solution) => void;
  deleteSolution: (id: string) => void;

  // Branch Modifiers
  addBranch: (br: Branch) => void;
  updateBranch: (br: Branch) => void;
  deleteBranch: (id: string) => void;

  // Dealer Modifiers
  addDealer: (dl: Dealer) => void;
  updateDealer: (dl: Dealer) => void;
  deleteDealer: (id: string) => void;

  // Quote Requests System
  quoteRequests: QuoteRequest[];
  addQuoteRequest: (req: QuoteRequest) => void;
  updateQuoteRequest: (req: QuoteRequest) => void;
  deleteQuoteRequest: (id: string) => void;
  newsletterSubscribers: NewsletterSubscriber[];
  addNewsletterSubscriber: (email: string) => Promise<void>;
  deleteNewsletterSubscriber: (email: string) => Promise<void>;

  // Custom Toast Notification System
  toasts: ToastMessage[];
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultMenuItems: MenuItem[] = [
  { name: "TRANG CHỦ", path: "/" },
  { name: "GIỚI THIỆU", path: "/gioi-thieu" },
  { name: "SẢN PHẨM", path: "/san-pham" },
  { name: "GIẢI PHÁP", path: "/giai-phap" },
  { name: "ĐẠI LÝ", path: "/dai-ly" },
  { name: "BẢO HÀNH", path: "/bao-hanh" },
  { name: "KIẾN THỨC", path: "/kien-thuc" },
  { name: "TUYỂN DỤNG", path: "/tuyen-dung" },
  { name: "LIÊN HỆ", path: "/lien-he" },
];

const defaultHeroSettings: HeroSettings = {
  title: "VOLTARA",
  subtitle: "KÍCH HOẠT TƯƠNG LAI",
  description: "Năng lượng thông minh – Độ bộc phát dòng xả cực đại. Voltara cung cấp các giải pháp pin Lithium LiFePO4 và bộ UPS tích trữ nguồn điện hiệu năng cao từ gia đình đến nhà máy công nghiệp quốc tế.",
  bannerImage: "/images/voltara_banner.webp",
  logoTextImage: "/images/logo-text-voltera.webp",
  useLogoImage: true,
  autoplaySpeed: 5000,
  slides: [
    {
      id: "slide-1",
      title: "VOLTARA",
      subtitle: "KÍCH HOẠT TƯƠNG LAI",
      description: "Năng lượng thông minh – Độ bộc phát dòng xả cực đại. Voltara cung cấp các giải pháp pin Lithium LiFePO4 và bộ UPS tích trữ nguồn điện hiệu năng cao từ gia đình đến nhà máy công nghiệp quốc tế.",
      bannerImage: "/images/voltara_banner.webp",
      logoTextImage: "/images/logo-text-voltera.webp",
      useLogoImage: true
    },
    {
      id: "slide-2",
      title: "CÔNG NGHỆ PIN LITHIUM THẾ HỆ MỚI",
      subtitle: "HIỆU SUẤT VÀ TUỔI THỌ VƯỢT TRỘI",
      description: "Hệ thống lưu trữ Voltara được tích hợp bo mạch BMS tự cân bằng thông minh giúp kiểm soát dòng sạc, kéo dài dòng đời pin gấp nhiều lần, an tâm tuyệt đối.",
      bannerImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=1600",
      logoTextImage: "",
      useLogoImage: false
    }
  ]
};

const defaultHomeContent: HomeContent = {
  section2Title: "Sản Phẩm Công Nghệ Voltara",
  section2Desc: "Lõi cell nhập khẩu chất lượng cao, tích hợp bo mạch BMS tự cân bằng thông minh đỉnh cao.",
  feature1Title: "Công Nghệ Tiên Tiến",
  feature1Desc: "Ứng dụng cell pin Lithium dòng sạc siêu thọ.",
  feature2Title: "Chất Lượng Vượt Trội",
  feature2Desc: "Vỏ sợi polycarbonate chống vỡ nứt.",
  feature3Title: "Bảo Hành Chính Hãng",
  feature3Desc: "Kích hoạt điện tử tra cứu siêu nhanh.",
  feature4Title: "Hệ Thống Toàn Quốc",
  feature4Desc: "Hàng trăm đại lý phân phối rộng khắp cả nước.",
};

const defaultAboutContent: AboutContent = {
  section1Subtitle: "VỀ VOLTARA",
  section1Title: "KÍCH HOẠT TƯƠNG LAI",
  section1Desc: "Voltara là thương hiệu tiên phong trong lĩnh vực nghiên cứu, chế tạo, liên kết sản xuất và cung cấp các dòng sản phẩm bộ pin Lithium sạc và nguồn điện lưu trữ thông minh tại Việt Nam. Hướng tới trở thành giải pháp năng lượng xanh vững mạnh toàn diện hỗ trợ cho sinh hoạt, di chuyển tuần hoàn bền vững của thế giới tương lai.",
  section1BannerImage: "/images/voltara_banner.webp",
  strategicTitle: "TẦM NHÌN CHIẾN LƯỢC",
  strategic1Year: "2030",
  strategic1Title: "2030 – Thương Hiệu Nội Địa Dẫn Đầu",
  strategic1Desc: "Đưa sản phẩm pin máy công cụ, phụ tùng lithium Voltara phủ khắp 63 tỉnh thành Việt Nam. Thay thế hoàn toàn 80% ắc quy chì axit cũ rách.",
  strategic2Year: "2035",
  strategic2Title: "2035 – Xuất Khẩu Màng Lưới Đông Nam Á",
  strategic2Desc: "Xây dựng mạng lưới bán hàng ổn định xuất khẩu sang các thị trường Thái Lan, Indonesia, Malaysia, Campuchia đạt chứng nhận chất lượng FCC/CE.",
  strategic3Year: "2040",
  strategic3Title: "2040 – Năng Lượng Toàn Cầu Vững Bền",
  strategic3Desc: "Tham gia phát triển trạm trữ điện trung tâm ESS dòng sạc siêu thọ cùng các đối tác hạ tầng ô-tô sạc ô nhiễm thấp tại các quốc gia Tây Âu và Liên Kỳ.",
  missionTitle: "SỨ MỆNH PHỤC VỤ",
  missionDesc: "Cung cấp những giải pháp tích trữ năng lượng Lithium thế hệ mới, tối đa tính hữu dụng thực chiến trong dụng cụ cầm tay, đảm bảo an toàn tuyệt đối, dập tắt rủi ro sinh khí bốc cháy chập mạch, kiến tạo một cộng đồng sống lành mạnh.",
  coreValuesTitle: "GIÁ TRỊ CỐT LÕI",
  coreValue1Title: "Chất lượng",
  coreValue1Desc: "Đặt độ an toàn của người dùng lên hàng đầu.",
  coreValue2Title: "Đổi mới",
  coreValue2Desc: "Cập nhập BMS thế hệ mới bảo mật rò dỉ điện môi.",
  coreValue3Title: "Hợp tác",
  coreValue3Desc: "Đồng hành trọn vẹn thịnh vượng cùng đại lý ủy quyền.",
  coreValue4Title: "Trách nhiệm",
  coreValue4Desc: "An tâm bảo hiểm rủi ro tài sản cao cấp chính hãng.",
  stat1Num: "50+",
  stat1Label: "Đại lý toàn quốc",
  stat2Num: "100.000+",
  stat2Label: "Sản phẩm bàn giao",
  stat3Num: "5.000 m²",
  stat3Label: "Nhà máy hiện đại",
  stat4Num: "3 Năm",
  stat4Label: "Bảo hành chính hãng",
  factorySubtitle: "TIÊU CHUẨN ĐỒNG BỘ",
  factoryTitle: "Nhà Máy Hiện Đại Công Nghệ Tiên Tiến",
  factoryDesc: "Voltara đầu tư quy trình chế tác tự động hóa khép kín tại khu công nghiệp Vĩnh Long, nhằm mang lại cấu hình hoàn chỉnh cho từng module pin Lithium. Mỗi sản phẩm đều được kiểm định bằng robot đo kiểm quang học tự động, loại bỏ triệt để lỗi cơ học trong chế tác.",
  factoryImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
  quoteText: "Voltara không chỉ sản xuất pin sạc, chúng tôi kiến tạo các giải pháp lưu trữ và phân phối năng lượng bền bỉ cho tương lai xanh, định hình lại màng lưới an toàn điện Việt Nam.",
  quoteAuthor: "HỘI ĐỒNG SÁNG LẬP VOLTARA TECHNOLOGY",
};

const defaultWarranties: WarrantyRecord[] = [
  {
    id: "w-1",
    serial: "VOLTARA-20V-5AH",
    productName: "PIN VOLTARA 20V 5.0Ah (Cho máy Makita)",
    customerName: "Nguyễn Văn Hùng",
    customerPhone: "0987654321",
    activatedDate: "20/05/2026",
    termMonths: 12,
    expiryDate: "20/05/2027",
    status: "Đang bảo hành chính hãng",
    specNotes: "Lõi cell hoạt động an toàn SOH 98%, chưa phát hiện lịch sử xả kiệt quá áp."
  },
  {
    id: "w-2",
    serial: "VOLTARA-48V-20AH",
    productName: "Bộ Pin Xe Điện Lithium 48V 20Ah",
    customerName: "Trần Minh Quân",
    customerPhone: "0912345678",
    activatedDate: "15/02/2026",
    termMonths: 18,
    expiryDate: "15/08/2027",
    status: "Đang bảo hành chính hãng",
    specNotes: "Mạch BMS ổn định, độ lệch áp cực nhỏ < 0.02V, dung lượng SOH 99%."
  },
  {
    id: "w-3",
    serial: "VOLTARA-ESS-10KWH",
    productName: "Tủ Lưu Trữ Điện Mặt Trời ESS 10kWh",
    customerName: "Lê Thị Thu Hương",
    customerPhone: "0905999888",
    activatedDate: "10/01/2025",
    termMonths: 36,
    expiryDate: "10/01/2028",
    status: "Đang bảo hành chính hãng",
    specNotes: "Hệ thống kết nối biến tần Hybird trơn tru, nhiệt độ vận hành 28 độ C hoàn hảo."
  }
];

const defaultQuoteRequests: QuoteRequest[] = [
  {
    id: "quote-1",
    customerName: "Nguyễn Văn Hùng",
    phone: "0912345678",
    email: "hung.nguyen@gmail.com",
    province: "Thành phố Hồ Chí Minh",
    address: "124 Nguyễn Thị Minh Khai, Quận 3",
    productName: "Bình Pin Lithium Voltara E-Scooter 72V 30Ah",
    batteryType: "Xe Máy Điện / Xe Đạp",
    voltage: "72V",
    capacity: "30Ah",
    notes: "Xin tư vấn mạch sạc thông minh chống chai pin cho xe VinFast Feliz S.",
    date: "2026-06-05T08:30:00Z",
    status: "Chờ xử lý"
  },
  {
    id: "quote-2",
    customerName: "Phạm Minh Đức",
    phone: "0987654321",
    email: "duc.pm@solartech.vn",
    province: "Tỉnh Bình Dương",
    address: "Khu công nghiệp VSIP I, Thuận An",
    productName: "Bộ Pin Lưu Trữ ESS Lithium Voltara LFP 51.2V 100Ah",
    batteryType: "Bộ điện sạc dự phòng UPS / Solar",
    voltage: "51.2V",
    capacity: "100Ah",
    notes: "Cần báo giá sỉ cho dự án điện mặt trời áp mái 10kW cho hộ gia đình và đại lý cấp 2.",
    date: "2026-06-06T02:15:00Z",
    status: "Đã liên hệ"
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or Initialize Navigation Menus
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem("voltara_menu_items");
    return saved ? JSON.parse(saved) : defaultMenuItems;
  });

  // Load or Initialize Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("voltara_products");
    return saved ? JSON.parse(saved) : PRODUCTS_DATA;
  });

  // Load or Initialize Solutions
  const [solutions, setSolutions] = useState<Solution[]>(() => {
    const saved = localStorage.getItem("voltara_solutions");
    return saved ? JSON.parse(saved) : SOLUTIONS_DATA;
  });

  // Load or Initialize Articles
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem("voltara_articles");
    return saved ? JSON.parse(saved) : ARTICLES_DATA;
  });

  // Load or Initialize Branches
  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem("voltara_branches");
    return saved ? JSON.parse(saved) : BRANCHES_DATA;
  });

  // Load or Initialize Dealers
  const [dealers, setDealers] = useState<Dealer[]>(() => {
    const saved = localStorage.getItem("voltara_dealers");
    return saved ? JSON.parse(saved) : DEALERS_DATA;
  });

  // Load or Initialize Hero Settings
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(() => {
    const saved = localStorage.getItem("voltara_hero_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.bannerImage && (parsed.bannerImage.endsWith(".png") || parsed.bannerImage.includes("voltara_banner_1780714848034"))) {
        parsed.bannerImage = "/images/voltara_banner.webp";
      }
      if (parsed.slides && Array.isArray(parsed.slides)) {
        parsed.slides = parsed.slides.map((s: any) => {
          if (s.bannerImage && (s.bannerImage.includes("voltara_banner_1780714848034") || s.bannerImage.endsWith(".png"))) {
            return { ...s, bannerImage: "/images/voltara_banner.webp" };
          }
          return s;
        });
      }
      return parsed;
    }
    return defaultHeroSettings;
  });

  // Load or Initialize Home Content
  const [homeContent, setHomeContent] = useState<HomeContent>(() => {
    const saved = localStorage.getItem("voltara_home_content");
    return saved ? { ...defaultHomeContent, ...JSON.parse(saved) } : defaultHomeContent;
  });

  // Load or Initialize About Content
  const [aboutContent, setAboutContent] = useState<AboutContent>(() => {
    const saved = localStorage.getItem("voltara_about_content");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.section1BannerImage && (parsed.section1BannerImage.includes("unsplash.com") || parsed.section1BannerImage.includes("voltara_banner_1780714848034"))) {
        parsed.section1BannerImage = "/images/voltara_banner.webp";
      }
      return { ...defaultAboutContent, ...parsed };
    }
    return defaultAboutContent;
  });

  // Load or Initialize Jobs (Recruitment)
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem("voltara_jobs");
    return saved ? JSON.parse(saved) : JOBS_DATA;
  });

  // Load or Initialize Contact Submissions
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>(() => {
    const saved = localStorage.getItem("voltara_contact_submissions");
    return saved ? JSON.parse(saved) : [];
  });

  // Load or Initialize Warranties
  const [warranties, setWarranties] = useState<WarrantyRecord[]>(() => {
    const saved = localStorage.getItem("voltara_warranties");
    return saved ? JSON.parse(saved) : defaultWarranties;
  });

  // Load or Initialize Quote Requests
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>(() => {
    const saved = localStorage.getItem("voltara_quote_requests");
    return saved ? JSON.parse(saved) : defaultQuoteRequests;
  });

  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);

  // Toast status state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [canReadAdminData, setCanReadAdminData] = useState(false);
  const hasAttemptedProductMigration = useRef(false);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 3500);
  };

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;

    return onAuthStateChanged(auth, (currentUser) => {
      setCanReadAdminData(isAdminEmail(currentUser?.email));
    });
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;

    const unsubscribeProducts = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        if (snapshot.empty) return;

        const items = snapshot.docs
          .map((item) => item.data() as Product)
          .sort((a, b) => String(a.name).localeCompare(String(b.name), "vi"));
        setProducts(items);
      },
      (error) => {
        console.error("Could not load products from Firestore:", error);
      }
    );

    return () => {
      unsubscribeProducts();
    };
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !canReadAdminData || hasAttemptedProductMigration.current) return;

    hasAttemptedProductMigration.current = true;

    const migrateProductsIfEmpty = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        if (!snapshot.empty) return;

        const batch = writeBatch(db);
        products.forEach((product) => {
          batch.set(doc(db, "products", product.id), product);
        });
        await batch.commit();
      } catch (error) {
        console.error("Could not migrate products to Firestore:", error);
      }
    };

    migrateProductsIfEmpty();
  }, [canReadAdminData, products]);

  useEffect(() => {
    if (!isFirebaseConfigured || !canReadAdminData) return undefined;

    const unsubscribeContacts = onSnapshot(
      collection(db, "contactSubmissions"),
      (snapshot) => {
        const items = snapshot.docs
          .map((item) => item.data() as ContactSubmission)
          .sort((a, b) => String(b.id).localeCompare(String(a.id)));
        setContactSubmissions(items);
      },
      (error) => {
        console.error("Could not load contact submissions from Firestore:", error);
      }
    );

    const unsubscribeQuotes = onSnapshot(
      collection(db, "quoteRequests"),
      (snapshot) => {
        const items = snapshot.docs
          .map((item) => item.data() as QuoteRequest)
          .sort((a, b) => String(b.date).localeCompare(String(a.date)));
        setQuoteRequests(items);
      },
      (error) => {
        console.error("Could not load quote requests from Firestore:", error);
      }
    );

    const unsubscribeNewsletter = onSnapshot(
      collection(db, "newsletterSubscribers"),
      (snapshot) => {
        const items = snapshot.docs
          .map((item) => item.data() as NewsletterSubscriber)
          .sort((a, b) => String(b.date).localeCompare(String(a.date)));
        setNewsletterSubscribers(items);
      },
      (error) => {
        console.error("Could not load newsletter subscribers from Firestore:", error);
      }
    );

    return () => {
      unsubscribeContacts();
      unsubscribeQuotes();
      unsubscribeNewsletter();
    };
  }, [canReadAdminData]);

  // Save changes to localStorage whenever states change
  useEffect(() => {
    localStorage.setItem("voltara_menu_items", JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem("voltara_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("voltara_solutions", JSON.stringify(solutions));
  }, [solutions]);

  useEffect(() => {
    localStorage.setItem("voltara_articles", JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem("voltara_branches", JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem("voltara_dealers", JSON.stringify(dealers));
  }, [dealers]);

  useEffect(() => {
    localStorage.setItem("voltara_hero_settings", JSON.stringify(heroSettings));
  }, [heroSettings]);

  useEffect(() => {
    localStorage.setItem("voltara_home_content", JSON.stringify(homeContent));
  }, [homeContent]);

  useEffect(() => {
    localStorage.setItem("voltara_about_content", JSON.stringify(aboutContent));
  }, [aboutContent]);

  useEffect(() => {
    localStorage.setItem("voltara_jobs", JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem("voltara_contact_submissions", JSON.stringify(contactSubmissions));
  }, [contactSubmissions]);

  useEffect(() => {
    localStorage.setItem("voltara_warranties", JSON.stringify(warranties));
  }, [warranties]);

  useEffect(() => {
    localStorage.setItem("voltara_quote_requests", JSON.stringify(quoteRequests));
  }, [quoteRequests]);

  // Administration Helpers
  const resetToDefault = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục toàn bộ cài đặt về mặc định của Voltara?")) {
      setMenuItems(defaultMenuItems);
      setProducts(PRODUCTS_DATA);
      setSolutions(SOLUTIONS_DATA);
      setArticles(ARTICLES_DATA);
      setBranches(BRANCHES_DATA);
      setDealers(DEALERS_DATA);
      setJobs(JOBS_DATA);
      setContactSubmissions([]);
      setWarranties(defaultWarranties);
      setQuoteRequests(defaultQuoteRequests);
      setHeroSettings(defaultHeroSettings);
      setHomeContent(defaultHomeContent);
      setAboutContent(defaultAboutContent);
      localStorage.clear();
      showToast("Đã khôi phục thành công dữ liệu hệ thống!", "success");
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "products", updatedProduct.id), updatedProduct, { merge: true });
      } catch (error) {
        console.error("Could not update product in Firestore:", error);
        showToast("Không thể lưu sản phẩm lên Firebase.", "error");
      }
    }
  };

  const addProduct = async (newProduct: Product) => {
    setProducts(prev => {
      // Avoid raw duplicates
      if (prev.some(p => p.id === newProduct.id)) {
        showToast("ID Sản phẩm đã tồn tại!", "error");
        return prev;
      }
      return [newProduct, ...prev];
    });

    if (isFirebaseConfigured && !products.some(p => p.id === newProduct.id)) {
      try {
        await setDoc(doc(db, "products", newProduct.id), newProduct);
      } catch (error) {
        console.error("Could not add product to Firestore:", error);
        showToast("Không thể thêm sản phẩm lên Firebase.", "error");
      }
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));

    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (error) {
        console.error("Could not delete product from Firestore:", error);
        showToast("Không thể xóa sản phẩm trên Firebase.", "error");
      }
    }
  };

  const updateMenuItem = (index: number, updatedItem: MenuItem) => {
    setMenuItems(prev => {
      const copy = [...prev];
      copy[index] = updatedItem;
      return copy;
    });
  };

  const addMenuItem = (item: MenuItem) => {
    setMenuItems(prev => [...prev, item]);
  };

  const deleteMenuItem = (index: number) => {
    setMenuItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Article (Knowledge) Helper Operations
  const addArticle = (art: Article) => {
    setArticles(prev => {
      if (prev.some(a => a.id === art.id)) {
        showToast("Mã ID bài viết đã tồn tại!", "error");
        return prev;
      }
      return [art, ...prev];
    });
  };

  const updateArticle = (art: Article) => {
    setArticles(prev => prev.map(a => a.id === art.id ? art : a));
  };

  const deleteArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  // Job (Recruitment) Helper Operations
  const addJob = (jb: Job) => {
    setJobs(prev => {
      if (prev.some(j => j.id === jb.id)) {
        showToast("Mã vị trí tuyển dụng này đã tồn tại!", "error");
        return prev;
      }
      return [jb, ...prev];
    });
  };

  const updateJob = (jb: Job) => {
    setJobs(prev => prev.map(j => j.id === jb.id ? jb : j));
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  // Contacts Submissions Helper Operations
  const addSubmission = (sub: ContactSubmission) => {
    setContactSubmissions(prev => [sub, ...prev]);
    if (isFirebaseConfigured) {
      setDoc(doc(db, "contactSubmissions", sub.id), sub).catch((error) => {
        console.error("Could not save contact submission to Firestore:", error);
        showToast("ChÆ°a lÆ°u Ä‘Æ°á»£c liÃªn há»‡ lÃªn Firebase. Dá»¯ liá»‡u táº¡m thá»i váº«n á»Ÿ trÃ¬nh duyá»‡t.", "warning");
      });
    }
  };

  const deleteSubmission = (id: string) => {
    setContactSubmissions(prev => prev.filter(s => s.id !== id));
    if (isFirebaseConfigured) {
      deleteDoc(doc(db, "contactSubmissions", id)).catch((error) => {
        console.error("Could not delete contact submission from Firestore:", error);
        showToast("KhÃ´ng xÃ³a Ä‘Æ°á»£c liÃªn há»‡ trÃªn Firebase.", "error");
      });
    }
  };

  // Warranty CRUD Operations
  const addWarranty = (w: WarrantyRecord) => {
    setWarranties(prev => [w, ...prev]);
  };
  const updateWarranty = (w: WarrantyRecord) => {
    setWarranties(prev => prev.map(item => item.id === w.id ? w : item));
  };
  const deleteWarranty = (id: string) => {
    setWarranties(prev => prev.filter(item => item.id !== id));
  };

  // Solutions Helper Operations
  const addSolution = (sol: Solution) => {
    setSolutions(prev => [sol, ...prev]);
  };
  const updateSolution = (sol: Solution) => {
    setSolutions(prev => prev.map(s => s.id === sol.id ? sol : s));
  };
  const deleteSolution = (id: string) => {
    setSolutions(prev => prev.filter(s => s.id !== id));
  };

  // Branch Helper Operations
  const addBranch = (br: Branch) => {
    setBranches(prev => [br, ...prev]);
  };
  const updateBranch = (br: Branch) => {
    setBranches(prev => prev.map(b => b.id === br.id ? br : b));
  };
  const deleteBranch = (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
  };

  // Dealer Helper Operations
  const addDealer = (dl: Dealer) => {
    setDealers(prev => [dl, ...prev]);
  };
  const updateDealer = (dl: Dealer) => {
    setDealers(prev => prev.map(d => d.id === dl.id ? dl : d));
  };
  const deleteDealer = (id: string) => {
    setDealers(prev => prev.filter(d => d.id !== id));
  };

  // Quote Request Helper Operations
  const addQuoteRequest = (req: QuoteRequest) => {
    setQuoteRequests(prev => [req, ...prev]);
    if (isFirebaseConfigured) {
      setDoc(doc(db, "quoteRequests", req.id), req).catch((error) => {
        console.error("Could not save quote request to Firestore:", error);
        showToast("ChÆ°a lÆ°u Ä‘Æ°á»£c yÃªu cáº§u bÃ¡o giÃ¡ lÃªn Firebase. Dá»¯ liá»‡u táº¡m thá»i váº«n á»Ÿ trÃ¬nh duyá»‡t.", "warning");
      });
    }
  };
  const updateQuoteRequest = (req: QuoteRequest) => {
    setQuoteRequests(prev => prev.map(q => q.id === req.id ? req : q));
    if (isFirebaseConfigured) {
      setDoc(doc(db, "quoteRequests", req.id), req).catch((error) => {
        console.error("Could not update quote request in Firestore:", error);
        showToast("KhÃ´ng cáº­p nháº­t Ä‘Æ°á»£c yÃªu cáº§u bÃ¡o giÃ¡ trÃªn Firebase.", "error");
      });
    }
  };
  const deleteQuoteRequest = (id: string) => {
    setQuoteRequests(prev => prev.filter(q => q.id !== id));
    if (isFirebaseConfigured) {
      deleteDoc(doc(db, "quoteRequests", id)).catch((error) => {
        console.error("Could not delete quote request from Firestore:", error);
        showToast("KhÃ´ng xÃ³a Ä‘Æ°á»£c yÃªu cáº§u bÃ¡o giÃ¡ trÃªn Firebase.", "error");
      });
    }
  };

  const addNewsletterSubscriber = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    if (!isFirebaseConfigured) {
      throw new Error("Firebase chưa được cấu hình.");
    }

    await setDoc(doc(db, "newsletterSubscribers", normalizedEmail), {
      id: normalizedEmail,
      email: normalizedEmail,
      source: "footer",
      date: new Date().toISOString(),
    }, { merge: true });
  };

  const deleteNewsletterSubscriber = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    setNewsletterSubscribers(prev => prev.filter(item => item.email !== normalizedEmail));

    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, "newsletterSubscribers", normalizedEmail));
    }
  };

  return (
    <AppContext.Provider
      value={{
        menuItems,
        setMenuItems,
        products,
        setProducts,
        solutions,
        setSolutions,
        articles,
        setArticles,
        branches,
        setBranches,
        dealers,
        setDealers,
        heroSettings,
        setHeroSettings,
        homeContent,
        setHomeContent,
        aboutContent,
        setAboutContent,
        jobs,
        setJobs,
        contactSubmissions,
        setContactSubmissions,
        warranties,
        setWarranties,
        quoteRequests,
        addQuoteRequest,
        updateQuoteRequest,
        deleteQuoteRequest,
        newsletterSubscribers,
        addNewsletterSubscriber,
        deleteNewsletterSubscriber,
        resetToDefault,
        updateProduct,
        addProduct,
        deleteProduct,
        updateMenuItem,
        addMenuItem,
        deleteMenuItem,
        addArticle,
        updateArticle,
        deleteArticle,
        addJob,
        updateJob,
        deleteJob,
        addSubmission,
        deleteSubmission,
        addWarranty,
        updateWarranty,
        deleteWarranty,
        addSolution,
        updateSolution,
        deleteSolution,
        addBranch,
        updateBranch,
        deleteBranch,
        addDealer,
        updateDealer,
        deleteDealer,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};


export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
