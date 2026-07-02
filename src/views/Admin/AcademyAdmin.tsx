import React, { useMemo, useState } from "react";
import { BookOpen, Copy, Edit, Eye, EyeOff, Loader2, Plus, Save, Search, Trash2, Upload, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Course } from "../../types";
import { isCloudinaryConfigured, uploadImageToCloudinary } from "../../lib/cloudinary";

const defaultCourseForm: Course = {
  id: "",
  title: "",
  category: "CÔNG NGHỆ PIN LITHIUM",
  duration: "8 giờ học",
  difficulty: "Cơ bản",
  rating: 4.8,
  reviews: 0,
  progress: 0,
  image: "/images/hoc-vien.webp",
  lecturer: "Đội ngũ kỹ thuật Voltara",
  lessonsCount: 6,
  description: "",
  hidden: false,
};

export default function AcademyAdmin() {
  const {
    academyCourses,
    addAcademyCourse,
    updateAcademyCourse,
    deleteAcademyCourse,
    showToast,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<Course>(defaultCourseForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "visible" | "hidden">("all");
  const [uploading, setUploading] = useState(false);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return academyCourses.filter((course) => {
      const matchesSearch =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.id.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.lecturer.toLowerCase().includes(query);
      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "hidden" ? Boolean(course.hidden) : !course.hidden);

      return matchesSearch && matchesVisibility;
    });
  }, [academyCourses, searchQuery, visibilityFilter]);

  const openAddModal = () => {
    setEditingCourse(null);
    setForm({
      ...defaultCourseForm,
      id: `course-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setForm({ ...defaultCourseForm, ...course, hidden: course.hidden ?? false });
    setIsModalOpen(true);
  };

  const copyCourse = (course: Course) => {
    const copiedCourse: Course = {
      ...course,
      id: `${course.id}-copy-${Date.now().toString().slice(-4)}`,
      title: `${course.title} (Bản sao)`,
      hidden: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addAcademyCourse(copiedCourse);
    showToast("Đã nhân bản khóa học và đặt ở trạng thái ẩn.", "success");
  };

  const toggleVisibility = (course: Course) => {
    updateAcademyCourse({ ...course, hidden: !course.hidden });
    showToast(course.hidden ? "Đã bật hiển thị khóa học." : "Đã ẩn khóa học khỏi trang học viện.", "info");
  };

  const handleUploadImage = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    if (!isCloudinaryConfigured()) {
      showToast("Chưa cấu hình Cloudinary để tải ảnh từ máy.", "warning");
      return;
    }

    setUploading(true);
    try {
      const uploadedUrl = await uploadImageToCloudinary(files[0]);
      setForm(prev => ({ ...prev, image: uploadedUrl }));
      showToast("Đã tải ảnh khóa học lên Cloudinary.", "success");
    } catch (error) {
      console.error("Could not upload academy image:", error);
      showToast("Không tải được ảnh lên Cloudinary.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.id.trim() || !form.title.trim()) {
      showToast("Vui lòng nhập ID và tên khóa học.", "warning");
      return;
    }

    const payload: Course = {
      ...form,
      id: form.id.trim(),
      title: form.title.trim(),
      category: form.category.trim() || "CÔNG NGHỆ PIN LITHIUM",
      lecturer: form.lecturer.trim() || "Đội ngũ kỹ thuật Voltara",
      rating: Number(form.rating) || 0,
      reviews: Number(form.reviews) || 0,
      progress: Math.min(100, Math.max(0, Number(form.progress) || 0)),
      lessonsCount: Math.max(0, Number(form.lessonsCount) || 0),
      hidden: form.hidden ?? false,
      createdAt: form.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!editingCourse && academyCourses.some(course => course.id === payload.id)) {
      showToast("ID khóa học bị trùng. Vui lòng đổi ID khác.", "error");
      return;
    }

    if (editingCourse) {
      updateAcademyCourse(payload);
      showToast("Đã cập nhật khóa học.", "success");
    } else {
      addAcademyCourse(payload);
      showToast("Đã thêm khóa học mới.", "success");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (course: Course) => {
    if (window.confirm(`Xóa khóa học "${course.title}"?`)) {
      deleteAcademyCourse(course.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-display font-semibold tracking-wide text-white uppercase flex items-center gap-2 text-gold-light">
            <BookOpen className="w-5 h-5" />
            QUẢN TRỊ HỌC VIỆN ({academyCourses.length})
          </h2>
          <p className="text-xs text-gray-400">Thêm, chỉnh sửa, nhân bản và ẩn hiện các khóa học hiển thị tại trang Học viện Voltara.</p>
        </div>
        <button
          onClick={openAddModal}
          className="gold-gradient-bg hover:opacity-90 text-black px-4 py-2 text-xs font-display font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Thêm khóa học
        </button>
      </div>

      <div className="bg-black border border-white/5 p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm theo tên, ID, danh mục hoặc giảng viên..."
            className="w-full bg-[#050505] border border-white/10 pl-9 pr-3 py-3 text-xs text-white focus:outline-none focus:border-gold-light"
          />
        </div>
        <select
          value={visibilityFilter}
          onChange={(event) => setVisibilityFilter(event.target.value as "all" | "visible" | "hidden")}
          className="md:col-span-4 bg-[#050505] border border-white/10 px-3 py-3 text-xs text-white focus:outline-none focus:border-gold-light"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="visible">Đang hiện</option>
          <option value="hidden">Đang ẩn</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredCourses.map((course) => (
          <div key={course.id} className={`border border-white/5 bg-black p-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between hover:border-gold-dark/30 transition-all ${course.hidden ? "opacity-60" : ""}`}>
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={course.image}
                alt=""
                className="w-20 h-14 object-cover border border-white/10 bg-[#050505] shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] font-mono text-gold-light border border-gold-dark/20 bg-gold-dark/10 px-2 py-0.5">{course.category}</span>
                  <span className={`text-[9px] font-display font-bold uppercase px-2 py-0.5 border ${course.hidden ? "text-gray-400 border-gray-700 bg-gray-900/60" : "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"}`}>
                    {course.hidden ? "Đang ẩn" : "Đang hiện"}
                  </span>
                </div>
                <h3 className="text-sm font-display font-black text-white uppercase tracking-wide truncate">{course.title}</h3>
                <p className="text-[10.5px] text-gray-500 font-mono truncate">
                  ID: {course.id} / {course.duration} / {course.lessonsCount} bài / {course.lecturer}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <button onClick={() => toggleVisibility(course)} className="bg-[#111] hover:bg-[#222] border border-white/5 text-[10px] font-display uppercase tracking-wider px-2.5 py-1.5 flex items-center gap-1 transition-all cursor-pointer text-gray-300">
                {course.hidden ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3" />}
                {course.hidden ? "Hiện" : "Ẩn"}
              </button>
              <button onClick={() => copyCourse(course)} className="bg-lime-500/10 hover:bg-lime-500 text-lime-400 hover:text-black border border-lime-500/20 text-[10px] font-display uppercase tracking-wider px-2.5 py-1.5 flex items-center gap-1 transition-all cursor-pointer">
                <Copy className="w-3 h-3" /> Nhân bản
              </button>
              <button onClick={() => openEditModal(course)} className="bg-gold-dark/10 hover:bg-gold-light text-gold-light hover:text-black border border-gold-dark/20 text-[10px] font-display uppercase tracking-wider px-2.5 py-1.5 flex items-center gap-1 transition-all cursor-pointer">
                <Edit className="w-3 h-3" /> Sửa
              </button>
              <button onClick={() => handleDelete(course)} className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 text-[10px] font-display uppercase tracking-wider px-2.5 py-1.5 flex items-center gap-1 transition-all cursor-pointer">
                <Trash2 className="w-3 h-3" /> Xóa
              </button>
            </div>
          </div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="border border-dashed border-white/10 bg-black p-8 text-center text-xs text-gray-500">
            Chưa có khóa học phù hợp bộ lọc hiện tại.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-[#0D0D0D] border border-gold-dark/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-display font-black text-white uppercase tracking-wide mb-6">
              {editingCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-gray-400">ID khóa học</span>
                <input value={form.id} onChange={(event) => setForm(prev => ({ ...prev, id: event.target.value }))} className="w-full bg-black border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold-light" required />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-gray-400">Danh mục</span>
                <input value={form.category} onChange={(event) => setForm(prev => ({ ...prev, category: event.target.value }))} className="w-full bg-black border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold-light" />
              </label>
              <label className="md:col-span-2 space-y-1">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-gray-400">Tên khóa học</span>
                <input value={form.title} onChange={(event) => setForm(prev => ({ ...prev, title: event.target.value }))} className="w-full bg-black border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold-light" required />
              </label>
              <label className="md:col-span-2 space-y-1">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-gray-400">Mô tả ngắn</span>
                <textarea value={form.description || ""} onChange={(event) => setForm(prev => ({ ...prev, description: event.target.value }))} rows={4} className="w-full bg-black border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold-light" />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-gray-400">Giảng viên</span>
                <input value={form.lecturer} onChange={(event) => setForm(prev => ({ ...prev, lecturer: event.target.value }))} className="w-full bg-black border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold-light" />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-gray-400">Thời lượng</span>
                <input value={form.duration} onChange={(event) => setForm(prev => ({ ...prev, duration: event.target.value }))} className="w-full bg-black border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold-light" />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-gray-400">Độ khó</span>
                <select value={form.difficulty} onChange={(event) => setForm(prev => ({ ...prev, difficulty: event.target.value as Course["difficulty"] }))} className="w-full bg-black border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold-light">
                  <option value="Cơ bản">Cơ bản</option>
                  <option value="Trung cấp">Trung cấp</option>
                  <option value="Nâng cao">Nâng cao</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-gray-400">Ảnh khóa học</span>
                <div className="flex gap-2">
                  <input value={form.image} onChange={(event) => setForm(prev => ({ ...prev, image: event.target.value }))} className="min-w-0 flex-1 bg-black border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold-light" />
                  <label className="shrink-0 border border-white/10 px-3 py-2.5 text-xs text-gray-300 hover:text-gold-light hover:border-gold-dark cursor-pointer flex items-center gap-1">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => handleUploadImage(event.target.files)} />
                  </label>
                </div>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:col-span-2">
                <label className="space-y-1">
                  <span className="text-[10px] font-display font-bold uppercase tracking-wider text-gray-400">Rating</span>
                  <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(event) => setForm(prev => ({ ...prev, rating: Number(event.target.value) }))} className="w-full bg-black border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold-light" />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] font-display font-bold uppercase tracking-wider text-gray-400">Đánh giá</span>
                  <input type="number" min="0" value={form.reviews} onChange={(event) => setForm(prev => ({ ...prev, reviews: Number(event.target.value) }))} className="w-full bg-black border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold-light" />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] font-display font-bold uppercase tracking-wider text-gray-400">Tiến trình %</span>
                  <input type="number" min="0" max="100" value={form.progress} onChange={(event) => setForm(prev => ({ ...prev, progress: Number(event.target.value) }))} className="w-full bg-black border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold-light" />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] font-display font-bold uppercase tracking-wider text-gray-400">Số bài</span>
                  <input type="number" min="0" value={form.lessonsCount} onChange={(event) => setForm(prev => ({ ...prev, lessonsCount: Number(event.target.value) }))} className="w-full bg-black border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold-light" />
                </label>
              </div>
              <label className="md:col-span-2 flex items-center gap-2 text-xs text-gray-300 border border-white/10 bg-black px-3 py-3">
                <input type="checkbox" checked={Boolean(form.hidden)} onChange={(event) => setForm(prev => ({ ...prev, hidden: event.target.checked }))} className="accent-[#D89A2B]" />
                Ẩn khóa học khỏi trang Học viện
              </label>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 border border-white/10 text-xs font-display font-bold uppercase tracking-widest text-gray-300 hover:text-white">
                Hủy
              </button>
              <button type="submit" className="px-5 py-3 gold-gradient-bg text-black text-xs font-display font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Lưu khóa học
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
