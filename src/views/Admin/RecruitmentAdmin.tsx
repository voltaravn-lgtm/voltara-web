import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Job } from "../../types";
import { Plus, Trash2, Edit, Copy, Save, X, Briefcase, DollarSign, Calendar, MapPin, Users } from "lucide-react";

export default function RecruitmentAdmin() {
  const { jobs, addJob, updateJob, deleteJob, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Form state
  const [form, setForm] = useState({
    id: "",
    title: "",
    department: "",
    location: "KCN Hòa Phú, Huyện Long Hồ, tỉnh Vĩnh Long",
    type: "Toàn thời gian",
    salary: "15 - 20 triệu VNĐ",
    deadline: "",
    experience: "",
    requirementsText: "",
    benefitsText: ""
  });

  const handleOpenAdd = () => {
    setEditingJob(null);
    setForm({
      id: "job-" + Date.now().toString().slice(-4),
      title: "",
      department: "Phòng Nghiên cứu & Phát triển R&D",
      location: "KCN Hòa Phú, Huyện Long Hồ, tỉnh Vĩnh Long",
      type: "Toàn thời gian",
      salary: "Thỏa thuận khi phỏng vấn",
      deadline: new Date(Date.now() + 30 * 24 * 3600 * 1000).toLocaleDateString("vi-VN"),
      experience: "Không yêu cầu kinh nghiệm, sẵn sàng trải qua đào tạo",
      requirementsText: "",
      benefitsText: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (jb: Job) => {
    setEditingJob(jb);
    setForm({
      id: jb.id,
      title: jb.title,
      department: jb.department,
      location: jb.location,
      type: jb.type,
      salary: jb.salary,
      deadline: jb.deadline,
      experience: jb.experience,
      requirementsText: jb.requirements?.join("\n") || "",
      benefitsText: jb.benefits?.join("\n") || ""
    });
    setIsModalOpen(true);
  };

  const handleCopy = (jb: Job) => {
    const copyId = `job-copy-${Date.now().toString().slice(-3)}`;
    const copiedJob: Job = {
      ...jb,
      id: copyId,
      title: `${jb.title} (Bản sao)`,
      deadline: new Date(Date.now() + 30 * 24 * 3600 * 1000).toLocaleDateString("vi-VN"),
    };
    addJob(copiedJob);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id || !form.title) {
      showToast("Vui lòng điền mã ID vị trí và tiêu đề tuyển dụng!", "warning");
      return;
    }

    const reqs = form.requirementsText.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    const bens = form.benefitsText.split("\n").map(line => line.trim()).filter(line => line.length > 0);

    const payload: Job = {
      id: form.id,
      title: form.title,
      department: form.department,
      location: form.location,
      type: form.type,
      salary: form.salary,
      deadline: form.deadline,
      experience: form.experience,
      requirements: reqs,
      benefits: bens
    };

    if (editingJob) {
      updateJob(payload);
      showToast("Đã cập nhật vị trí tuyển dụng thành công!", "success");
    } else {
      addJob(payload);
      showToast("Đã tạo vị trí tuyển dụng mới thành công!", "success");
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-display font-semibold tracking-wide text-white uppercase flex items-center gap-2 text-gold-light">
            <Briefcase className="w-5 h-5" />
            QUẢN TRỊ TUYỂN DỤNG ({jobs.length})
          </h2>
          <p className="text-xs text-gray-400">Điều phối, cập nhật đăng tuyển nhân tài kỹ sư, nhân viên phát triển đại lý nội bộ của Voltara.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="gold-gradient-bg hover:opacity-90 text-black px-4 py-2 text-xs font-display font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Tuyển vị trí mới
        </button>
      </div>

      <div className="space-y-4">
        {jobs.map((jb) => (
          <div key={jb.id} className="bg-black border border-white/5 p-5 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gold-dark/30 transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gold-light bg-gold-dark/10 px-2.5 py-0.5 border border-gold-dark/20">
                  {jb.department}
                </span>
                <span className="text-[9px] font-mono text-gray-400 border border-white/10 px-2 py-0.5">
                  {jb.type}
                </span>
              </div>
              <h3 className="text-sm font-display font-black text-white uppercase tracking-wide pt-1">
                {jb.title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[10.5px] text-gray-400 font-mono pt-1">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-500" /> {jb.location}</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-gray-500" /> {jb.salary}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-500" /> Hạn nộp: {jb.deadline}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-white/5 md:justify-end">
              <button
                onClick={() => handleOpenEdit(jb)}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-display font-semibold uppercase text-gold-light bg-gold-dark/5 border border-gold-dark/15 hover:bg-gold-light hover:text-black hover:border-transparent transition-all cursor-pointer"
              >
                <Edit className="w-3 h-3" /> Sửa
              </button>
              <button
                onClick={() => handleCopy(jb)}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-display font-semibold uppercase text-blue-400 bg-blue-500/5 border border-blue-500/15 hover:bg-blue-500 hover:text-white hover:border-transparent transition-all cursor-pointer"
                title="Nhân bản vị trí"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Xóa tin tuyển dụng: "${jb.title}"?`)) {
                    deleteJob(jb.id);
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-display font-semibold uppercase text-red-400 bg-red-500/5 border border-red-500/15 hover:bg-red-500 hover:text-white hover:border-transparent transition-all cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-gold-dark/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-display font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gold-light" />
              {editingJob ? "CẬP NHẬT CHỈ SỐ TUYỂN DỤNG" : "ĐĂNG TUYỂN VỊ TRÍ MỚI"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-gray-500 block font-bold">Mã việc làm (Job Code/ID) *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingJob}
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                    className="w-full bg-black text-white border border-white/10 px-3 py-2 text-xs focus:outline-none focus:border-gold-light disabled:opacity-40"
                    placeholder="job-rd-eng"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-gray-500 block font-bold">Phòng ban phụ trách *</label>
                  <input
                    type="text"
                    required
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full bg-black text-white border border-white/10 px-3 py-2 text-xs focus:outline-none"
                    placeholder="ví dụ: R&D, Nhân sự, Kinh doanh"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-gray-500 block font-bold">Tên công việc (Title) *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-black text-white border border-white/10 px-3 py-2 text-xs focus:outline-none"
                    placeholder="Kỹ sư vận hành pin Lithium..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-gray-500 block font-bold font-bold">Hình thức tuyển</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-black text-white border border-white/10 h-[34px] px-3 text-xs focus:outline-none rounded-md"
                  >
                    <option value="Toàn thời gian">Toàn thời gian</option>
                    <option value="Bán thời gian">Bán thời gian</option>
                    <option value="Cộng tác viên">Cộng tác viên</option>
                    <option value="Thực tập sinh">Thực tập sinh</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-gray-500 block font-bold">Mức lương tuyển *</label>
                  <input
                    type="text"
                    required
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    className="w-full bg-black text-white border border-white/10 px-3 py-2 text-xs focus:outline-none"
                    placeholder="25 - 35 triệu..."
                  />
                </div>
                <div className="space-y-1 font-sans">
                  <label className="text-[10px] font-display uppercase tracking-wider text-gray-500 block font-bold">Hạn nộp hồ sơ *</label>
                  <input
                    type="text"
                    required
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full bg-black text-white border border-white/10 px-3 py-2 text-xs focus:outline-none"
                    placeholder="30/08/2026"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-gray-500 block font-bold">Yêu cầu năm kinh nghiệm</label>
                  <input
                    type="text"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    className="w-full bg-black text-white border border-white/10 px-3 py-2 text-xs focus:outline-none"
                    placeholder="Tối thiểu 2 năm..."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-display uppercase tracking-wider text-gray-500 block font-bold">Địa điểm làm việc</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full bg-black text-white border border-white/10 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-gray-500 block font-bold">
                    Yêu cầu công việc (Mỗi dòng một ý)
                  </label>
                  <textarea
                    rows={5}
                    value={form.requirementsText}
                    onChange={(e) => setForm({ ...form, requirementsText: e.target.value })}
                    className="w-full bg-[#050505] text-[#ECECEC] border border-white/10 p-2.5 text-xs focus:outline-none focus:border-gold-light leading-relaxed font-sans"
                    placeholder="Ví dụ:&#10;Tốt nghiệp đại học chuyên ngành kỹ thuật&#10;Đọc hiểu tài liệu tiếng Anh"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-gray-500 block font-bold font-bold">
                    Quyền lợi của ứng viên (Mỗi dòng một ý)
                  </label>
                  <textarea
                    rows={5}
                    value={form.benefitsText}
                    onChange={(e) => setForm({ ...form, benefitsText: e.target.value })}
                    className="w-full bg-[#050505] text-[#ECECEC] border border-white/10 p-2.5 text-xs focus:outline-none focus:border-gold-light leading-relaxed font-sans"
                    placeholder="Ví dụ:&#10;Hỗ trợ ăn trưa 100% tại văn phòng&#10;Đóng bảo hiểm BHXH khi vào chính thức"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-white/10 text-xs text-gray-400 font-display font-bold uppercase tracking-widest hover:text-white cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="gold-gradient-bg text-black font-display font-bold px-6 py-2 text-xs uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Lưu Lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
