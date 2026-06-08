/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Solution, Project, Article, Course, Job, Branch, Dealer } from "./types";

export const PRODUCTS_DATA: Product[] = [
  {
    id: "pin-voltara-20v-5ah-makita",
    name: "PIN VOLTARA 20V 5.0Ah (Cho máy Makita)",
    voltage: "20V",
    capacity: "5.0Ah",
    brand: "MAKITA",
    cellType: "Lithium-ion cao cấp",
    warranty: "12 tháng",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600",
    tag: "Mới",
    description: "Bộ pin Lithium-ion 20V hiệu suất cao dành cho hệ máy công cụ Makita. Tích hợp chip BMS bảo vệ quá tải, quá nhiệt, tăng tuổi thọ chu kỳ nạp xả cực đại.",
    category: "pin-may-cong-cu",
    specs: {
      "Điện áp": "20V",
      "Dung lượng": "5.0Ah (100Wh)",
      "Loại Cell": "Panasonic Lithium-ion",
      "Công nghệ BMS": "Bảo vệ đa lớp nâng cao",
      "Thời hạn bảo hành": "12 tháng",
      "Chu kỳ nạp xả": "> 800 lần"
    }
  },
  {
    id: "pin-voltara-20v-8ah-makita",
    name: "PIN VOLTARA 20V 8.0Ah (Cho máy Makita)",
    voltage: "20V",
    capacity: "8.0Ah",
    brand: "MAKITA",
    cellType: "Lithium-ion cao cấp",
    warranty: "12 tháng",
    image: "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?auto=format&fit=crop&q=80&w=600",
    tag: "Mới",
    description: "Phiên bản dung lượng siêu lớn 8.0Ah bền bỉ, giúp nâng cấp thời gian vận hành liên tục cho công trường chuyên nghiệp. Pin đầm chắc, sạc nhanh tối ưu.",
    category: "pin-may-cong-cu",
    specs: {
      "Điện áp": "20V",
      "Dung lượng": "8.0Ah (160Wh)",
      "Loại Cell": "Samsung High-discharge Cell",
      "Công nghệ BMS": "Cân bằng cell tự động thông minh",
      "Thời hạn bảo hành": "12 tháng",
      "Chu kỳ nạp xả": "> 1000 lần"
    }
  },
  {
    id: "pin-voltara-20v-6ah-bosch",
    name: "PIN VOLTARA 20V 6.0Ah (Cho máy Bosch)",
    voltage: "20V",
    capacity: "6.0Ah",
    brand: "BOSCH",
    cellType: "Lithium-ion cao cấp",
    warranty: "12 tháng",
    image: "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?auto=format&fit=crop&q=80&w=600",
    tag: "Mới",
    description: "Thiết kế tương thích hoàn hảo với hệ sinh thái Bosch Blue Professional. Phù hợp cho các dòng khoan búa, máy cắt góc dòng tài cao.",
    category: "pin-may-cong-cu",
    specs: {
      "Điện áp": "20V",
      "Dung lượng": "6.0Ah (120Wh)",
      "Loại Cell": "Sony Murata Lithium-ion",
      "Công nghệ BMS": "Chống cháy nổ, ngắt đoản mạch",
      "Thời hạn bảo hành": "12 tháng",
      "Chu kỳ nạp xả": "> 900 lần"
    }
  },
  {
    id: "pin-voltara-20v-9ah-dewalt",
    name: "PIN VOLTARA 20V 9.0Ah (Cho máy Dewalt)",
    voltage: "20V",
    capacity: "9.0Ah",
    brand: "DEWALT",
    cellType: "Lithium-ion cao cấp",
    warranty: "12 tháng",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
    tag: "Mới",
    description: "Năng lượng vượt trội cho dòng máy Dewalt 20V Max XR. Khối pin chịu lực tốt, vỏ làm bằng sợi polycarbonate chống nứt vỡ trong môi trường khắc nghiệt.",
    category: "pin-may-cong-cu",
    specs: {
      "Điện áp": "20V",
      "Dung lượng": "9.0Ah (180Wh)",
      "Loại Cell": "Samsung SDI",
      "Công nghệ BMS": "Bảo vệ thông minh chống sụt áp",
      "Thời hạn bảo hành": "12 tháng",
      "Chu kỳ nạp xả": "> 1200 lần"
    }
  },
  {
    id: "pin-voltara-20v-4ah-milwaukee",
    name: "PIN VOLTARA 20V 4.0Ah (Cho máy Milwaukee)",
    voltage: "20V",
    capacity: "4.0Ah",
    brand: "MILWAUKEE",
    cellType: "Lithium-ion cao cấp",
    warranty: "12 tháng",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600",
    tag: "Mới",
    description: "Dòng pin nhỏ gọn công suất lớn đáp ứng hoàn hảo cho máy bắt bu-lông, máy bắn vít nhỏ cầm tay của Milwaukee, giữ trọng lượng thiết bị tối ưu cho người dùng.",
    category: "pin-may-cong-cu",
    specs: {
      "Điện áp": "20V",
      "Dung lượng": "4.0Ah (80Wh)",
      "Loại Cell": "Lithium-ion cell",
      "Công nghệ BMS": "Quản lý dòng xả cao",
      "Thời hạn bảo hành": "12 tháng"
    }
  },
  {
    id: "ups-cua-cuon-12v-voltara",
    name: "Bộ lưu điện UPS Cửa Cuốn 12V (VOLTARA)",
    voltage: "12V",
    capacity: "12V - 24V",
    brand: "VOLTARA",
    cellType: "Lithium LiFePO4",
    warranty: "24 tháng",
    image: "https://images.unsplash.com/photo-1617711422774-7fafdfc1ab31?auto=format&fit=crop&q=80&w=600",
    description: "Bộ lưu điện cửa cuốn thông minh với thời gian lưu điện dự phòng lên đến 48 giờ. Khác biệt với bình ắc quy cũ bằng việc tích hợp pin lưu trữ Lithium LiFePO4 thế hệ mới siêu nhẹ và siêu bền.",
    category: "ups-cua-cuon",
    specs: {
      "Điện thế định mức": "12V",
      "Công suất tải": "600W - 1000W",
      "Thời gian lưu điện": "18 - 24 giờ liên tục",
      "Loại Pin": "Lithium sắt photphat (LiFePO4)",
      "Thời hạn bảo hành": "24 tháng",
      "Chu kỳ bảo trì": "Tự động sạc xả cân bằng định kỳ"
    }
  },
  {
    id: "pin-xe-dien-48v-20ah",
    name: "Bộ Pin Xe Điện Lithium 48V 20Ah",
    voltage: "48V",
    capacity: "20Ah",
    brand: "VOLTARA",
    cellType: "Lithium LiFePO4 cao cấp",
    warranty: "18 tháng",
    image: "https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&q=80&w=600",
    description: "Giải pháp nâng cấp hoàn hảo thay thế bình ắc quy chì truyền thống cho xe máy điện. Trọng lượng siêu nhẹ chỉ bằng 1/3, quãng đường di chuyển xa hơn gấp 1.5 lần.",
    category: "pin-xe-dien",
    specs: {
      "Điện thế định mức": "48V",
      "Dung lượng": "20Ah (960Wh)",
      "Trọng lượng": "5.8 kg",
      "Quãng đường đi được": "70 - 85 km / 1 lần sạc",
      "Thời hạn bảo hành": "18 tháng",
      "Kháng nước": "Tiêu chuẩn IP67"
    }
  },
  {
    id: "ac-quy-lithium-12v-100ah",
    name: "Ắc quy Lithium thông minh 12V 100Ah",
    voltage: "12V",
    capacity: "100Ah",
    brand: "VOLTARA",
    cellType: "Lithium LFP",
    warranty: "36 tháng",
    image: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=600",
    description: "Dòng ắc quy Lithium cao cấp thay thế ắc quy truyền thống cho xe hơi, tàu thuyền, hoặc hệ thống năng lượng mặt trời mini. Có màn hình LCD hiển thị dung lượng trực quan.",
    category: "ac-quy-lithium",
    specs: {
      "Điện áp": "12V",
      "Dung lượng": "100Ah (1200Wh)",
      "Chu kỳ xả sâu DOD 80%": "> 4000 lần",
      "Trọng lượng": "9.5 kg",
      "Thời hạn bảo hành": "36 tháng"
    }
  },
  {
    id: "ac-quy-chi-axit-12v-7ah",
    name: "Ắc quy chì axit khô kín khí 12V 7Ah",
    voltage: "12V",
    capacity: "7Ah",
    brand: "VOLTARA",
    cellType: "Lead-Acid AGM",
    warranty: "12 tháng",
    image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&q=80&w=600",
    description: "Ắc quy viễn thông khô AGM kín khí chất lượng vượt trội, an toàn chống rò rỉ dung dịch, chuyên dùng cho tủ điều khiển cứu hỏa, bộ đàm, thang máy hoặc cân điện tử.",
    category: "ac-quy-chi-axit",
    specs: {
      "Điện áp": "12V",
      "Dung lượng": "7Ah",
      "Công nghệ": "AGM kín khí hoàn toàn",
      "Kích thước": "151 x 65 x 94 mm",
      "Thời hạn bảo hành": "12 tháng"
    }
  },
  {
    id: "pin-luu-tru-ess-512v-100ah",
    name: "Pin lưu trữ năng lượng mặt trời ESS 51.2V 100Ah",
    voltage: "51.2V",
    capacity: "100Ah",
    brand: "VOLTARA",
    cellType: "LiFePO4 Laminated",
    warranty: "36 tháng",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=600",
    description: "Tủ điện pin lithium biến tần lai, lưu trữ điện năng lượng tái tạo thông minh cho hộ gia đình tầm trung và doanh nghiệp lắp đặt mặt trời mái nhà.",
    category: "pin-luu-tru-nang-luong",
    specs: {
      "Điện thế định mức": "51.2V",
      "Dung lượng lưu trữ": "5.12 kWh",
      "Cổng giao tiếp": "CAN, RS485, RS232",
      "Khả năng mở rộng": "Ghép song song tối đa 15 bộ",
      "Thời hạn bảo hành": "36 tháng"
    }
  },
  {
    id: "pin-custom-oem-odm-project",
    name: "Hệ thống Pin Thiết Kế Theo Yêu Cầu (OEM/ODM)",
    voltage: "Tùy biến",
    capacity: "Tùy chọn",
    brand: "VOLTARA",
    cellType: "Li-ion / LiFePO4",
    warranty: "Đóng gói theo dự án",
    image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=600",
    description: "Dịch vụ tính toán phụ tải, thiết kế khung vỏ bằng nhôm định hình, đấu nối khối cell pin thông minh, tinh chỉnh bo mạch quản lý BMS chuyên biệt theo yêu cầu của khách hàng làm máy nông nghiệp, rô-bốt tự hành AGV, thiết bị viễn thông.",
    category: "phu-kien-linh-kien",
    specs: {
      "Quy cách thiết kế": "Đáp ứng tiêu chuẩn bản vẽ kỹ thuật CAD/3D",
      "Dải điện áp hỗ trợ": "3.7V đến 700V",
      "Vật liệu khung vỏ": "Nhựa ABS chống cháy hoặc Hợp kim nhôm siêu bền",
      "BMS tùy chỉnh": "Hỗ trợ Bluetooth, kết nối App di động định vị GPS"
    }
  }
];

export const SOLUTIONS_DATA: Solution[] = [
  {
    id: "giai-phap-gia-dinh",
    title: "GIẢI PHÁP CHO GIA ĐÌNH",
    description: "Hệ thống điện dự phòng UPS thông minh và tích trữ điện mặt trời mái nhà mini giúp các thiết bị thiết yếu như tủ lạnh, camera, quạt mát, đèn chiếu sáng hoạt động không ngắt quãng khi xảy ra sự cố cắt điện lưới đột ngột.",
    badge: "Tiết kiệm & An tâm",
    iconName: "Home",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",
    details: [
      "Bộ lưu điện UPS cửa cuốn hoạt động 48h liên tục",
      "Tích lũy điện giờ thấp điểm và xả sử dụng vào giờ cao điểm",
      "Lắp đặt sạch sẽ, an toàn, không sinh khí độc như máy phát Diesel",
      "Bảo hành toàn bộ phần cứng trong vòng 2 năm"
    ]
  },
  {
    id: "giai-phap-cua-hang",
    title: "GIẢI PHÁP CHO CỬA HÀNG",
    description: "Bảo vệ dòng điện cấp liên tục cho hệ thống máy tính tiền POS, màn hình kỹ thuật số, đèn LED quảng cáo và cửa cuốn. Rất cần thiết cho chuỗi cà phê, nhà thuốc và cửa hàng tiện lợi 24/7.",
    badge: "Kinh doanh không gián đoạn",
    iconName: "Store",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600",
    details: [
      "UPS tải trung bình 1000W - 2000W gọn nhẹ thẩm mỹ cao",
      "Tự động chuyển mạch an toàn trong 4 miligiây (ms)",
      "Kiểm tra và kiểm soát từ xa dòng điện cửa hàng thông qua ứng dụng di động",
      "Bảo dướng định kỳ giảm thiểu rủi ro chập cháy hệ thống tủ điện"
    ]
  },
  {
    id: "giai-phap-nha-xuong",
    title: "GIẢI PHÁP CHO NHÀ XƯỞNG",
    description: "Nhà xưởng công nghiệp yêu cầu dòng điện ổn định tuyệt đối để tránh làm hỏng phôi sản xuất và dừng robot dây chuyền. Trạm nguồn lưu trữ lithium công suất cao 3 pha của Voltara giải quyết bài toán chống sụt áp tức thời hiệu quả.",
    badge: "Công nghiệp nặng siêu bền",
    iconName: "Factory",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=600",
    details: [
      "Trực tiếp thay thế máy phát điện cũ nát bằng cụm tủ pin lưu trữ thông minh",
      "BMS kiểm tra liên tục hàng nghìn cell, ngăn chặn nguy cơ cháy kích khởi",
      "Cách ly lọc nhiễu sóng hài lưới điện, bảo vệ máy cơ khí chính xác",
      "Thi công lắp đặt nhanh chóng, hỗ trợ hạ tầng trạm biến áp sạc xả chuyên dụng"
    ]
  },
  {
    id: "giai-phap-doanh-nghiep",
    title: "GIẢI PHÁP DOANH NGHIỆP",
    description: "Cung cấp nguồn dự phòng lưu trữ năng lượng tập trung ESS cho phòng máy chủ dữ liệu Server, hệ thống mạng tổng đài chăm sóc khách hàng và hệ thống đèn thoát hiểm tòa nhà văn phòng cao tầng.",
    badge: "An toàn dữ liệu số",
    iconName: "Briefcase",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
    details: [
      "Tủ rack lưu điện lắp đặt gọn gàng tiêu chuẩn máy chủ viễn thông",
      "Chu kỳ sạc xả siêu thọ đạt trên 10 năm sử dụng bền bỉ",
      "Đội ngũ kỹ thuật Voltara trực hotline xử lý sự cố khẩn cấp 24/7",
      "Kèm gói bảo hiểm rủi ro tài sản trị giá lên đến 2 tỷ đồng"
    ]
  },
  {
    id: "giai-phap-xe-dien",
    title: "GIẢI PHÁP CHO XE ĐIỆN",
    description: "Cung cấp trạm xe máy điện doanh nghiệp giao vận, trạm thay thế pin tự động và các cụm pack pin lithium tối ưu hóa quãng đường cho xe chở hàng du lịch sân golf, xe nâng điện siêu tải trong nhà kho logistic.",
    badge: "Di chuyển thông minh",
    iconName: "Zap",
    image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=600",
    details: [
      "Pack pin Lithium LiFePO4 chuẩn kháng nước IP67 chống chọi ngập lụt đô thị",
      "Tối ưu hóa hành trình giao vận tăng thêm 40% hiệu năng so với ắc quy chì",
      "Kèm mạch sạc nhanh thông minh chống chai phồng dòng sạc lớn",
      "Lập trình định vị bản đồ trạm và tình trạng sức khỏe pin SOH qua liên kết đám mây"
    ]
  }
];

export const PROJECTS_DATA: Project[] = [
  {
    id: "project-1",
    title: "Biệt thự nghỉ dưỡng cao cấp - TP. Đà Lạt",
    solutionType: "Giải pháp lưu trữ năng lượng gia đình",
    location: "Phường 10, Thành phố Đà Lạt, Lâm Đồng",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600",
    specs: "Lắp đặt 2 bộ UPS Voltara 2200VA và hệ thống lưu trữ pin Lithium ESS 5.12kWh"
  },
  {
    id: "project-2",
    title: "Nhà máy sản xuất linh kiện chính xác - Bình Dương",
    solutionType: "Giải pháp chống sụt áp nguồn 3 pha công nghiệp",
    location: "Khu công nghiệp VSIP II, Thủ Dầu Một, Bình Dương",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600",
    specs: "Tổng thầu cung cấp tủ pin lưu trữ LFP Voltara 20kVA tích hợp hệ biến tần thông minh"
  },
  {
    id: "project-3",
    title: "Chuỗi cà phê thương hiệu lớn - TP. Hồ Chí Minh",
    solutionType: "Giải pháp nguồn điện kinh doanh liên tục",
    location: "Quận 1, Thành phố Hồ Chí Minh",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600",
    specs: "Trang bị cho 15 điểm bán hệ UPS lưu điện thông minh Voltara 1000VA cho quầy POS thu ngân"
  },
  {
    id: "project-4",
    title: "Hệ thống xe máy điện cho nhân viên bưu chính - Hà Nội",
    solutionType: "Giải pháp xe máy điện thông minh",
    location: "Các chi nhánh bưu điện toàn Hà Nội",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=600",
    specs: "Phát triển và bàn giao 500 pack pin Lithium định vị thông minh Voltara 72V 35Ah"
  }
];

export const ARTICLES_DATA: Article[] = [
  {
    id: "pin-lithium-la-gi-uu-diem-uu-viet",
    title: "Pin Lithium là gì? Ưu điểm & ứng dụng đột phá trong cuộc sống hiện đại",
    brief: "Tìm hiểu chi tiết về pin Lithium, cấu tạo hóa học, nguyên lý hoạt động và những lý do vì sao pin lithium hoàn toàn đánh bại ắc quy chì truyền thống về cả tuổi thọ, tính kinh tế lẫn độ an toàn xanh.",
    content: `Pin Lithium-ion (hay pin Li-ion) là một loại pin sạc sử dụng các ion lithium di chuyển từ điện cực âm sang điện cực dương trong quá trình xả và ngược lại khi sạc. Sau nhiều năm phát triển, pin Lithium đã mở ra kỷ nguyên mới cho ngành công nghệ thiết bị cầm tay, xe điện và điện năng lượng tái tạo.

### 1. Cấu tạo siêu bền của Pin Lithium Voltara
Cấu trúc cơ bản của một cell pin gồm:
- **Cực dương (Anode)**: Thường làm bằng than chì graphite giúp giam giữ các ion lithium.
- **Cực âm (Cathode)**: Sử dụng các hợp chất lithium như LiCoO2, LiMn2O4, hay nổi tiếng an toàn hơn cả là Lithium Sắt Phosphate (LiFePO4).
- **Màng ngăn điện môi**: Cho phép ion lithium đi qua nhưng cách ly dòng điện chạy trực tiếp gây đoản mạch.
- **Mạch quản lý BMS cực kỳ thông minh**: Đây là bộ não đo đạc điện áp từng lõi cell pin sạc, cân bằng điện môi chống quá áp quá nhiệt nguy hiểm.

### 2. Ưu điểm tuyệt đối so với ắc quy chì
- **Trọng lượng siêu nhẹ**: Chỉ bằng 1/3 ~ 1/4 so với bình ắc quy chì có cùng thông số dung lượng.
- **Tuổi thọ vượt thời gian**: Ắc quy chì sạc xả tối đa chỉ 300 - 400 chu kỳ là hỏng trong khi Pin Lithium LiFePO4 của Voltara hỗ trợ trên 4000 chu kỳ (hơn 10 năm dùng thực tế).
- **Không giải phóng hơi axit**: Kháng cháy tốt, an toàn hoàn hảo khi đặt trong phòng kín nhà riêng của bạn.`,
    date: "20/05/2026",
    readTime: "5 phút đọc",
    category: "Kiến thức pin",
    image: "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?auto=format&fit=crop&q=80&w=600",
    featured: true,
    views: 1240
  },
  {
    id: "mach-quan-ly-bms-la-gi-bms",
    title: "BMS là gì? Vai trò của định đoạt an toàn hệ thống pin Lithium",
    brief: "Mạch BMS (Battery Management System) đóng vai trò giám sát, bảo vệ mạch sạc, điều chỉnh nhiệt độ và đảm bảo s sạc đều ở các cell pin. Hãy cùng tìm hiểu trái tim an toàn này.",
    content: "Mạch BMS là hệ quản lý của pin giúp theo dõi từng thông số điện áp. Trình cân bằng cell tự động ngăn pin không rơi vào vùng phóng cạn hoặc nạp tràn dập tắt từ trứng nước các nguyên nhân đoản mạch...",
    date: "15/05/2026",
    readTime: "6 phút đọc",
    category: "Công nghệ",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600",
    views: 890
  },
  {
    id: "huong-dan-sac-pin-lithium-dung-cach",
    title: "Hướng dẫn sạc pin Lithium đúng cách để tối đa tuổi thọ chu kỳ sạc",
    brief: "Lời khuyên vàng từ chuyên gia Voltara: sạc 80% tốt hơn 100%, không để cạn 0%, tránh sạc trong trời nắng gắt hay sụt áp đột ngột.",
    content: "Nên sạc pin duy trì ở mức năng lượng lý tưởng từ 20% đến 85%. Đừng lạm dụng sạc nhanh khi thiết bị đang ở nhiệt độ quá cao từ vỏ máy cơ khí...",
    date: "15/05/2026",
    readTime: "5 phút đọc",
    category: "Hướng dẫn sử dụng",
    image: "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?auto=format&fit=crop&q=80&w=600",
    views: 940
  },
  {
    id: "pin-lily-trong-moi-truong-nhiet-do-thap",
    title: "Pin Lithium thông minh hoạt động ổn định trong nhiệt độ âm sâu",
    brief: "Khảo sát thực tế cấu tạo cell cải tiến giúp pin dụng cụ cơ khí Voltara hoạt động trơn tru bất kể sương muối Đà Lạt hay hầm đông lạnh công nghiệp.",
    content: "Công nghệ sưởi ấm nội tại và cải biến hóa chất điện ly của Voltara giúp hạ ngưỡng đóng băng dòng sạc lên đến -20 độ C, đảm bảo máy cắt vẫn xẻ gỗ mượt mà...",
    date: "10/05/2026",
    readTime: "4 phút đọc",
    category: "Công nghệ",
    image: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=600",
    views: 520
  },
  {
    id: "ung-dung-pin-lithium-trong-he-thong-mat-troi",
    title: "Tại sao nên chọn giải pháp Pin lưu trữ trong hệ điện mặt trời hộ gia đình",
    brief: "Giải phóng mái nhà khỏi bù trừ điện áp lưới, tích cóp từng kW điện dư sạc vào bình pin Lithium Voltara để dùng thắp đèn xuyên suốt ban đêm miễn phí.",
    content: "Các trạm sạc điện mặt trời phối hợp pin lưu trữ lithium giúp nâng hệ số tự chủ năng lượng của hộ gia đình lên hơn 90%, giảm gánh nặng hóa đơn điện hàng tháng...",
    date: "08/05/2026",
    readTime: "6 phút đọc",
    category: "Kiến thức pin",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=600",
    views: 740
  },
  {
    id: "voltara-mo-rong-nha-may-viet-nam-li",
    title: "VOLTARA mở rộng nhà máy sản xuất pin Lithium chuẩn công nghệ cao",
    brief: "Tầm nhìn dẫn đầu thị trường nội địa: Đầu tư dây chuyền sản xuất tự sạc màng cách điện và robot đóng gói module chất lượng đồng đều tối ưu nhất.",
    content: "Dự kiến nâng công suất lên gấp đôi đạt 500,000 kit pin mỗi năm để đáp ứng nhu cầu tăng vọt từ các hãng làm xe điện nội địa và đơn hàng xuất khẩu Đông Nam Á...",
    date: "02/05/2026",
    readTime: "3 phút đọc",
    category: "Tin tức & sự kiện",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=600",
    views: 610
  }
];

export const COURSES_DATA: Course[] = [
  {
    id: "course-1",
    title: "Cấu tạo và nguyên lý hoạt động cơ bản của pin Lithium",
    category: "CÔNG NGHỆ PIN LITHIUM",
    duration: "12 giờ học",
    difficulty: "Cơ bản",
    rating: 4.9,
    reviews: 125,
    progress: 60,
    image: "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?auto=format&fit=crop&q=80&w=600",
    lecturer: "TS. Nguyễn Văn Hùng - Viện Năng lượng Việt Nam",
    lessonsCount: 8
  },
  {
    id: "course-2",
    title: "Thiết kế hệ thống lưu trữ năng lượng mặt trời công nghiệp (ESS)",
    category: "HỆ THỐNG LƯU TRỮ NĂNG LƯỢNG",
    duration: "18 giờ học",
    difficulty: "Nâng cao",
    rating: 4.8,
    reviews: 98,
    progress: 35,
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=600",
    lecturer: "ThS. Trần Quốc Toản - Giám đốc Công nghệ Voltara",
    lessonsCount: 12
  },
  {
    id: "course-3",
    title: "BMS - Trí tuệ quản lý và phân phối dòng sạc cân bằng",
    category: "BMS & QUẢN LÝ PIN",
    duration: "15 giờ học",
    difficulty: "Trung cấp",
    rating: 4.9,
    reviews: 76,
    progress: 20,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600",
    lecturer: "KS. Lê Hoàng Nam - Chuyên gia R&D Mạch Nhúng",
    lessonsCount: 10
  },
  {
    id: "course-4",
    title: "Giải pháp Solar kết hợp pin Lithium lưu trữ (Hybrid Solar / ESS)",
    category: "NĂNG LƯỢNG MẶT TRỜI",
    duration: "10 giờ học",
    difficulty: "Trung cấp",
    rating: 4.7,
    reviews: 64,
    progress: 15,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",
    lecturer: "ThS. Vũ Sĩ Trung - Ban Tư vấn Kỹ thuật Voltara",
    lessonsCount: 7
  },
  {
    id: "course-5",
    title: "Xử lý sự cố và kiểm tra dung lượng thực tế pin dụng cụ, pin LFP",
    category: "KỸ THUẬT & ỨNG DỤNG",
    duration: "8 giờ học",
    difficulty: "Cơ bản",
    rating: 4.8,
    reviews: 52,
    progress: 0,
    image: "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?auto=format&fit=crop&q=80&w=600",
    lecturer: "KS. Đỗ Duy Mạnh - Trưởng bộ phận Bảo hành Voltara",
    lessonsCount: 6
  }
];

export const JOBS_DATA: Job[] = [
  {
    id: "job-1",
    title: "Kỹ sư R&D Pin Lithium cao cấp",
    department: "Phòng Nghiên cứu & Phát triển R&D",
    location: "KCN Hòa Phú, Huyện Long Hồ, tỉnh Vĩnh Long",
    type: "Toàn thời gian",
    salary: "25 - 35 triệu VNĐ",
    deadline: "15/07/2026",
    experience: "Tối thiểu 3 năm kinh nghiệm trong lĩnh vực đóng màng cách điện, thí nghiệm hóa chất cell pin Lithium LFP.",
    requirements: [
      "Tốt nghiệp Thạc sĩ/Kỹ sư Điện hóa, Hóa học ứng dụng, Kỹ thuật vật liệu hoặc tự động hóa chế tạo máy.",
      "Có kiến thức thực tế vận hành máy phân tích đặc tính pin sạc, sạc sụt áp hóa học.",
      "Đọc hiểu tốt tài liệu nghiên cứu tiếng Anh kỹ thuật, làm việc nhóm chủ động."
    ],
    benefits: [
      "Tham gia các dự án nghiên cứu phát triển đổi mới độc quyền cấp Nhà nước.",
      "Trực tiếp được chuyển giao công nghệ tại viện Khoa học Năng lượng Hàn Quốc / Đức.",
      "Thưởng dự án theo thành quả bán ra thị trường hấp dẫn không giới hạn trần."
    ]
  },
  {
    id: "job-2",
    title: "Kỹ sư nhúng R&D BMS (Battery Management System)",
    department: "Phòng Nghiên cứu & Phát triển R&D",
    location: "Hà Nội (Văn phòng đại diện Cầu Giấy)",
    type: "Toàn thời gian",
    salary: "20 - 30 triệu VNĐ",
    deadline: "30/07/2026",
    experience: "Tối thiểu 2 năm kinh nghiệm thiết kế mạch nhúng sạc, am hiểu STM32, ARM.",
    requirements: [
      "Có kinh nghiệm thiết kế sơ đồ nguyên lý mạch Altium / Eagle.",
      "Thông thạo truyền tin bus giao tiếp CAN-Bus, RS485 và Modbus công nghiệp.",
      "Đam mê lập trình C/C++ vi điều khiển, quản lý dòng xả cân bằng cell."
    ],
    benefits: [
      "Môi trường làm việc trẻ trung, trang bị dàn máy dao động ký tối tân.",
      "Hỗ trợ 100% ăn trưa sang xịn mịn tại văn phòng, đóng BHXH full lương.",
      "Du lịch nước ngoài nghỉ dưỡng cùng cả tập thể công ty 1 năm 2 lần."
    ]
  },
  {
    id: "job-3",
    title: "Nhân viên Phát triển Kênh Phân phối Đại lý",
    department: "Phòng Kinh doanh quốc nội",
    location: "Thành phố Hồ Chí Minh (Văn phòng đại diện Quận 7)",
    type: "Toàn thời gian",
    salary: "12 - 20 triệu + Hoa hồng KPIs",
    deadline: "10/07/2026",
    experience: "Có trên 1 năm kinh nghiệm phát triển thị trường điện gia dụng, ắc quy viễn thông hoặc phụ tùng xe máy máy công cụ.",
    requirements: [
      "Kỹ năng đàm phán xuất sắc, có sẵn hiểu biết về tệp khách hàng tiệm kim khí điện nước.",
      "Sẵn sàng đi công tác tỉnh thành thiết lập liên kết màng lưới xe tải phân phối sản phẩm.",
      "Nhanh nhẹn, trung thực, có máy tính xách tay cá nhân phục vụ báo cáo doanh số."
    ],
    benefits: [
      "Phụ cấp xăng xe, nhà nghỉ lưu động tối đa khi đi công tác mở rộng màng lưới.",
      "Mức hoa hồng trích thưởng doanh số cực cao thúc đẩy thực lực cá nhân.",
      "Lộ trình đề bạt rõ ràng từ Chuyên viên -> Trưởng nhóm -> Giám đốc Vùng chỉ sau 1 năm."
    ]
  }
];

export const BRANCHES_DATA: Branch[] = [
  {
    id: "branch-hq",
    name: "TRỤ SỞ CHÍNH – VĨNH LONG",
    type: "TRỤ SỞ CHÍNH",
    address: "123 Đường Năng Lượng, KCN Hòa Phú, H. Long Hồ, Vĩnh Long, Việt Nam",
    phone: "1900 1234",
    email: "info@voltara.vn",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "branch-hn",
    name: "VĂN PHÒNG ĐẠI DIỆN HÀ NỘI",
    type: "CHI NHÁNH",
    address: "Tầng 5, Tòa nhà TechnoPark, Vinhomes Ocean Park, Gia Lâm, Hà Nội",
    phone: "0981 234 567",
    email: "hanoi@voltara.vn",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "branch-dn",
    name: "CHI NHÁNH ĐÀ NẴNG",
    type: "CHI NHÁNH",
    address: "Tầng 3, 45 Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng",
    phone: "0905 678 999",
    email: "danang@voltara.vn",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "branch-hcm",
    name: "CHI NHÁNH TP. HỒ CHÍ MINH",
    type: "CHI NHÁNH",
    address: "Tầng 8, Tòa nhà PV Gas Tower, 673 Nguyễn Hữu Thọ, Nhà Bè, TP. HCM",
    phone: "0938 789 123",
    email: "hcm@voltara.vn",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600"
  }
];

export const DEALERS_DATA: Dealer[] = [
  { id: "dl-hq", name: "Tổng Kho Kỹ Thuật Voltara Vĩnh Long", province: "Vĩnh Long", district: "Huyện Long Hồ", address: "123 Đường Năng Lượng, KCN Hòa Phú", phone: "1900 1234", isHQ: true },
  { id: "dl-1", name: "Đại Lý Ủy Quyền Voltara Cầu Giấy (Hà Nội)", province: "Hà Nội", district: "Quận Cầu Giấy", address: "24 Duy Tân, Phường Dịch Vọng Hậu", phone: "0981 234 567" },
  { id: "dl-2", name: "Đại Lý Điện Máy Hoàng Long (Hải Phòng)", province: "Hải Phòng", district: "Quận Ngô Quyền", address: "142 Lê Lợi, Phường Máy Tơ", phone: "0912 345 678" },
  { id: "dl-3", name: "Nhà Phân Phối Pin Lithium Minh Đức (Đà Nẵng)", province: "Đà Nẵng", district: "Quận Hải Châu", address: "88 Điện Biên Phủ, Phường Chính Gián", phone: "0905 123 456" },
  { id: "dl-4", name: "Cửa hàng Kim Khí Thành Công (Nha Trang)", province: "Khánh Hòa", district: "Thành phố Nha Trang", address: "50 Thái Nguyên, Phường Phước Tân", phone: "0923 456 789" },
  { id: "dl-5", name: "Đại Lý Ủy Quyền Voltara Quận 7 (TP.HCM)", province: "Hồ Chí Minh", district: "Quận 7", address: "350 Nguyễn Thị Thập, Tân Quy", phone: "0938 111 222" },
  { id: "dl-6", name: "Phụ Tùng Xe Điện Đức Anh (Cần Thơ)", province: "Cần Thơ", district: "Quận Ninh Kiều", address: "45 Đường 3/2, Phường Xuân Khánh", phone: "0944 555 666" },
  { id: "dl-7", name: "Đại Lý Điện Máy Việt Tiến (Bình Dương)", province: "Bình Dương", district: "Thuận An", address: "78 Đại Lộ Bình Dương, Phú Hòa", phone: "0989 333 444" },
  { id: "dl-8", name: "Kim Khí Tổng Hợp Bắc Giang", province: "Bắc Giang", district: "Thành phố Bắc Giang", address: "112 Hùng Vương", phone: "0977 444 555" },
  { id: "dl-9", name: "Đại lý Ắc quy Đức Huy (Vinh)", province: "Nghệ An", district: "Thành phố Vinh", address: "90 Trần Phú", phone: "0966 555 666" },
];
