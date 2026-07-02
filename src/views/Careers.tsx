/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, DollarSign, Calendar, Upload, FileText, X, Check, ArrowRight, Heart, Users, MessageSquare, Sparkles } from "lucide-react";
import { JOBS_DATA } from "../data";
import { SectionTitle } from "../components/Cards";
import { useApp } from "../context/AppContext";
import { getMenuBanner } from "../lib/menuBanners";

export default function Careers() {
  const { menuItems } = useApp();
  const bannerImage = getMenuBanner(menuItems, "/tuyen-dung", "/images/tuyen-dung.webp");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [appForm, setAppForm] = useState({
    fullname: "",
    phone: "",
    email: "",
    notes: ""
  });
  const [resumeName, setResumeName] = useState("");
  const [appSuccess, setAppSuccess] = useState(false);

  const departments = ["all", "R&D / Kỹ thuật", "Sản xuất / Vận hành", "Kinh doanh / Phát triển thị trường", "Marketing"];

  const filteredJobs = selectedDepartment === "all"
    ? JOBS_DATA
    : JOBS_DATA.filter(j => j.department === selectedDepartment);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppSuccess(true);
    setTimeout(() => {
      setAppSuccess(false);
      setSelectedJob(null);
      setAppForm({ fullname: "", phone: "", email: "", notes: "" });
      setResumeName("");
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeName(e.target.files[0].name);
    }
  };

  const cultures = [
    { title: "MÔI TRƯỜNG HIỆN ĐẠI", desc: "Không gian R&D đỉnh cao tại Vĩnh Long cùng các chuyên gia pin sạc sụt áp Lithium ưu tú lý tưởng.", icon: <Sparkles className="w-5 h-5 text-gold-light" /> },
    { title: "THU NHẬP XỨNG ĐÁNG", desc: "Mức lương cơ sở cạnh tranh khốc liệt kèm tiền thưởng doanh số đại lý, bảo hiểm sức khỏe toàn diện.", icon: <DollarSign className="w-5 h-5 text-gold-light" /> },
    { title: "LỘ TRÌNH TOÀN DIỆN", desc: "Cơ hội nâng đỡ thăng tiến rộng lên Giám đốc cụm miền Nam hay Trưởng Lab đo kiểm chỉ sau 1.5 năm.", icon: <ArrowRight className="w-5 h-5 text-gold-light" /> },
    { title: "Ý CHÍ QUYẾT TỬ", desc: "Tinh thần đồng đội gắn kết keo sơn, dũng cảm đương đầu thử thách, tôn trọng thực tiễn thực lực.", icon: <Users className="w-5 h-5 text-gold-light" /> }
  ];

  return (
    <div id="careers-page" className="pb-20 relative bg-[#050505] text-left">
      {/* 1. HERO BANNER - FULL WIDTH */}
      <section className="relative min-h-[45vh] lg:min-h-[55vh] flex items-center overflow-hidden bg-black pt-16 lg:pt-24 pb-16 lg:pb-24 mb-12">
        {/* Full-screen Background Banner Image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src={bannerImage} 
            alt="Voltara Recruitment Banner Background" 
            className="w-full h-full object-cover object-center transform scale-100 opacity-80"
            referrerPolicy="no-referrer"
          />
          {/* Overlay to ensure maximum text readability and aesthetic integration */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 lg:from-black/95 lg:via-black/75 lg:to-transparent/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          {/* Breadcrumb navigation */}
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-gray-400 mb-6">
            <Link to="/" className="hover:text-gold-light pointer-events-auto transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-gold-dark font-black">Tuyển dụng</span>
          </div>

          <div className="max-w-3xl flex flex-col items-start text-left">
            <span className="text-xs font-display font-black tracking-[0.25em] text-gold-light uppercase mb-2">
              GIA NHẬP VOLTARA
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold leading-tight text-white uppercase mb-6 glow-text tracking-tight">
              ĐỒNG HÀNH CÙNG NĂNG LƯỢNG MỚI
            </h1>
            
            <div className="h-[2px] bg-gradient-to-r from-gold-dark to-transparent w-28 mb-6" />

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl backdrop-blur-[1px]">
              Tìm kiếm những tri thức dũng cảm, khao khát ứng dụng công nghệ xanh để chế tạo khối pin Lithium Việt bản lĩnh trường tồn.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 2. COMPANY CULTURE CARDS GRID */}
        <div className="py-12 bg-[#0A0A0A] border border-white/5 p-6 md:p-8 mb-16">
          <SectionTitle
            subtitle="CHẾ ĐỘ & QUY CHẾ"
            title="SỨC MẠNH VĂN HÓA DOANH NGHIỆP VOLTARA"
            description="Lấy năng lực cống hiến thực tiễn làm cán cân đãi ngộ hàng đầu quốc nội."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 pr-0">
            {cultures.map((c, idx) => (
              <div key={idx} className="bg-[#121212] border border-white/5 p-5 hover:border-gold-dark/20 transition-all text-left flex flex-col items-start">
                <div className="p-3 bg-white/5 border border-white/5 text-gold-light mb-4 text-center">
                  {c.icon}
                </div>
                <h4 className="text-xs font-display font-extrabold text-[#ECECEC] uppercase tracking-wider mb-2">{c.title}</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. CO-BODY LAYOUT - FILTERS & JOB LISTINGS PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
          
          {/* Filters column Left */}
          <div className="lg:col-span-3 space-y-6">
            
            <div className="bg-[#121212] border border-white/5 p-4">
              <h4 className="text-[11px] font-display font-bold text-gold-light uppercase tracking-wider mb-3">
                BỘ PHẬN TUYỂN DỤNG
              </h4>
              <div className="flex flex-col gap-1.5 font-display text-[10.5px]">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDepartment(dept)}
                    className={`w-full text-left px-3 py-2.5 transition-all flex items-center justify-between group ${
                      selectedDepartment === dept
                        ? "bg-[#D89A2B] text-black font-extrabold"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{dept === "all" ? "Tất cả vị trí" : dept}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-sm ${selectedDepartment === dept ? "bg-black/20 text-black font-bold" : "bg-white/5 text-gray-600"}`}>
                      {dept === "all" ? JOBS_DATA.length : JOBS_DATA.filter(j => j.department === dept).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-gold-dark/20 bg-gold-dark/5 p-5 inline-block w-full text-center">
              <h4 className="text-[11px] font-display font-bold text-white uppercase tracking-wider mb-1">HỒ SƠ KHÁC BIỆT?</h4>
              <p className="text-[10px] text-gray-500 mb-4 leading-relaxed">
                Nếu bạn có năng lực đặc thù nằm ngoài các vị trí niêm yết, vui lòng gửi trực tiếp hồ sơ ứng tuyển tự phát.
              </p>
              <a
                href="mailto:tuyendung@voltara.vn"
                className="inline-flex w-full items-center justify-center gap-2 bg-[#D89A2B] hover:bg-gold-light text-black font-display font-bold text-xs py-3 shadow-[0_0_10px_rgba(216,154,43,0.3)] transition-all"
              >
                <span>NỘP CV TỰ PHÁT</span>
              </a>
            </div>

          </div>

          {/* Job listings Right */}
          <div className="lg:col-span-9 space-y-4" id="jobs-listings-right">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2 select-none">
              <h3 className="text-xs font-display font-black text-white uppercase tracking-wider">
                VỊ TRÍ ĐANG TUYỂN DỤNG ({filteredJobs.length})
              </h3>
              <span className="text-[10px] text-gray-500 font-mono">OPPORTUNITIES</span>
            </div>

            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-[#121212] border border-white/5 p-5 hover:border-gold-dark/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 group transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 text-gold-light shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-display font-black text-[#ECECEC] uppercase tracking-wide group-hover:text-gold-light transition-colors mb-2">
                        {job.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-gray-500 font-sans">
                        <span>Bộ phận: <strong className="text-gray-400 font-sans">{job.department}</strong></span>
                        <span className="text-gray-700">•</span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <MapPin className="w-3.5 h-3.5 text-gold-dark shrink-0" />
                          <span>{job.location}</span>
                        </span>
                        <span className="text-gray-700">•</span>
                        <span className="text-gold-light">Lương: <strong className="font-sans font-medium">{job.salary}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto mt-2 sm:mt-0">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="w-full sm:w-auto text-center border border-gold-dark/35 bg-transparent hover:bg-gold-dark hover:text-black hover:border-transparent transition-all py-2.5 px-5 font-display font-bold text-gold-light text-[10px] tracking-widest uppercase"
                    >
                      ỨNG TUYỂN NGAY
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center border border-dashed border-white/10 text-gray-500 text-xs">
                Hiện tại chưa có vị trí đang đăng tuyển cho phòng ban này.
              </div>
            )}

          </div>

        </div>

        {/* 4. RECRUITMENT FLOW (PROCESS 4 STEPS) */}
        <div className="py-12 bg-[#0A0A0A] border-y border-white/5 mb-12 text-center" id="recruitment-flow">
          <SectionTitle
            subtitle="LỘ TRÌNH ĐẦU QUÂN"
            title="BIÊN CHẾ QUY TRÌNH TUYỂN DỤNG CHUẨN"
            description="Nhanh gọn, thực tiễn, phản hồi kết quả trong vòng tối đa 7 ngày làm việc."
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
            <div className="bg-[#121212] border border-white/5 p-4 rounded-lg relative">
              <span className="text-[10px] font-mono font-bold text-gold-dark mb-1 block">BƯỚC 1</span>
              <h4 className="text-xs font-display font-black text-[#ECECEC] uppercase mb-1.5">NHẬN HỒ SƠ</h4>
              <p className="text-[10.5px] text-gray-500">Ứng tuyển trực tiếp qua cổng thông tin website hoặc gửi mail tệp CV kèm file PDF chứng chỉ.</p>
            </div>
            <div className="bg-[#121212] border border-white/5 p-4 rounded-lg relative">
              <span className="text-[10px] font-mono font-bold text-gold-dark mb-1 block">BƯỚC 2</span>
              <h4 className="text-xs font-display font-black text-[#ECECEC] uppercase mb-1.5">SÀNG LỌC ĐỊNH LƯỢNG</h4>
              <p className="text-[10.5px] text-gray-500">Chuyên viên kỹ thuật duyệt xét học bạ, kinh nghiệm liên quan cấu trúc tụ xả chì hoặc lithium.</p>
            </div>
            <div className="bg-[#121212] border border-white/5 p-4 rounded-lg relative">
              <span className="text-[10px] font-mono font-bold text-gold-dark mb-1 block">BƯỚC 3</span>
              <h4 className="text-xs font-display font-black text-[#ECECEC] uppercase mb-1.5 font-sans">PHỎNG VẤN CHUYÊN SÂU</h4>
              <p className="text-[10.5px] text-gray-500">Gặp gỡ Hội đồng khoa học trao đổi thực tế khả năng chạy trạm R&D, kiểm định tải IP67 dồn dập.</p>
            </div>
            <div className="bg-[#121212] border border-white/5 p-4 rounded-lg relative">
              <span className="text-[10px] font-mono font-bold text-gold-dark mb-1 block">BƯỚC 4</span>
              <h4 className="text-xs font-display font-black text-[#ECECEC] uppercase mb-1.5">NHẬN THƯ MỜI & BIÊN CHẾ</h4>
              <p className="text-[10.5px] text-gray-500">Thống nhất lộ trình công tác đãi ngộ, ký hợp đồng lao động và bàn giao trang phục, thẻ nạp.</p>
            </div>
          </div>
        </div>

      </div>

      {/* 5. JOB DETAIL OVERLAY & MOCK CV SUBMISSION FORM */}
      {selectedJob && (
        <div id="job-apply-modal" className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left">
          <div className="bg-[#0D0D0D] border border-gold-dark/30 max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-xl relative shadow-2xl">
            
            {/* Close modal */}
            <button
              onClick={() => {
                setSelectedJob(null);
                setResumeName("");
              }}
              className="absolute top-4 right-4 p-2 bg-black border border-white/10 text-gray-400 hover:text-white hover:bg-gold-dark hover:border-transparent transition-all z-10"
              title="Đóng chi tiết"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 md:p-8 space-y-6">
              
              <div>
                <span className="text-[9.5px] font-display font-semibold text-gold-light uppercase tracking-widest">{selectedJob.department}</span>
                <h3 className="text-base sm:text-lg md:text-xl font-display font-black text-[#ECECEC] uppercase tracking-wide mt-1.5">
                  ỨNG TUYỂN: {selectedJob.title}
                </h3>
                <div className="h-[1.5px] bg-gold-dark w-24 mt-3" />
              </div>

              {/* Specs & Job Detail */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 p-4 text-xs">
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase">NƠI LÀM VIỆC</span>
                  <span className="text-gray-200 font-semibold">{selectedJob.location}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase">MỨC LƯƠNG</span>
                  <strong className="text-gold-light font-sans font-medium">{selectedJob.salary}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase">HẠN NỘP HỒ SƠ</span>
                  <span className="text-gray-200 font-mono">{selectedJob.deadline}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase">KINH NGHIỆM</span>
                  <span className="text-gray-200">{selectedJob.experience}</span>
                </div>
              </div>

              {/* Requirements & Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-300 leading-relaxed ">
                
                <div className="space-y-2">
                  <h4 className="text-[10.5px] font-display font-bold text-white uppercase tracking-wider border-b border-white/5 pb-1">MÔ TẢ CÔNG VIỆC & YÊU CẦU</h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-gray-400">
                    {selectedJob.requirements.map((req: string, idx: number) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10.5px] font-display font-bold text-white uppercase tracking-wider border-b border-white/5 pb-1">ĐÃI NGỘ & QUYỀN LỢI</h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-gray-400">
                    {selectedJob.benefits.map((ben: string, idx: number) => (
                      <li key={idx}>{ben}</li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Application Form */}
              <form onSubmit={handleApplySubmit} className="border-t border-white/5 pt-6 space-y-4">
                <h4 className="text-[11px] font-display font-bold text-gold-light uppercase tracking-widest mb-4">
                  ĐIỀN CHI TIẾT THÔNG TIN HỒ SƠ
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[9px] font-display font-bold text-gray-600 uppercase mb-1 block">Họ và Tên của bạn *</label>
                    <input
                      type="text"
                      required
                      value={appForm.fullname}
                      onChange={(e) => setAppForm({ ...appForm, fullname: e.target.value })}
                      placeholder="Ví dụ: Trần Minh Đức"
                      className="w-full bg-black text-[#ECECEC] border border-white/10 px-3.5 py-2.5 text-xs focus:outline-none focus:border-gold-light"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-display font-bold text-gray-600 uppercase mb-1 block">SĐT liên hệ *</label>
                    <input
                      type="text"
                      required
                      value={appForm.phone}
                      onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                      placeholder="Ví dụ: 0912*******"
                      className="w-full bg-black text-[#ECECEC] border border-white/10 px-3.5 py-2.5 text-xs focus:outline-none focus:border-gold-light"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-display font-bold text-gray-600 uppercase mb-1 block">Email hộp thư *</label>
                    <input
                      type="email"
                      required
                      value={appForm.email}
                      onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                      placeholder="Ví dụ: duc.tran@gmail.com"
                      className="w-full bg-black text-[#ECECEC] border border-white/10 px-3.5 py-2.5 text-xs focus:outline-none focus:border-gold-light"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-display font-bold text-gray-600 uppercase mb-1 block">Kể sơ lược thế mạnh hoặc thắc mắc của bạn</label>
                  <textarea
                    rows={2}
                    value={appForm.notes}
                    onChange={(e) => setAppForm({ ...appForm, notes: e.target.value })}
                    placeholder="Những bài luận hoặc mô tả cấu trúc pin sụt áp đã biết của bạn..."
                    className="w-full bg-black text-[#ECECEC] border border-white/10 px-3.5 py-2.5 text-xs focus:outline-none focus:border-gold-light"
                  />
                </div>

                {/* CV File Upload */}
                <div>
                  <label className="text-[9px] font-display font-bold text-gray-600 uppercase mb-1 block">Tải lên hồ sơ CV của bạn (PDF, Word) *</label>
                  <div className="flex items-center gap-3">
                    <label className="border border-dashed border-gold-dark/45 hover:border-gold-light cursor-pointer bg-white/5 active:bg-white/10 font-display font-semibold text-gold-light text-xs py-3 px-6 shrink-0 transition-all">
                      <span className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>CHỌN FILE ĐÍNH KÈM</span>
                      </span>
                      <input
                        type="file"
                        required={!resumeName}
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    
                    <span className="text-xs text-gray-500 font-mono truncate max-w-sm">
                      {resumeName ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Check className="w-4 h-4" />
                          <span>{resumeName}</span>
                        </span>
                      ) : (
                        "Chưa đính kèm file"
                      )}
                    </span>
                  </div>
                </div>

                {/* Submitting button */}
                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-gold-dark to-gold-light text-black font-display font-bold text-xs py-3.5 tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all text-center"
                  >
                    NỘP HỒ SƠ ỨNG TUYỂN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJob(null);
                      setResumeName("");
                    }}
                    className="border border-white/10 hover:border-white/20 bg-transparent text-gray-400 hover:text-white px-5 py-3.5 text-xs font-display uppercase tracking-widest text-center"
                  >
                    HỦY BỎ
                  </button>
                </div>

              </form>

              {appSuccess && (
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/20 text-xs text-emerald-400 text-center animate-bounce">
                  Hồ sơ ứng tuyển đã nộp biên thành công! Hệ thống tuyển dụng Voltara sẽ phản hồi email và đặt lịch hẹn phỏng vấn bạn trong vòng 24 giờ. Cảm ơn bạn.
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
