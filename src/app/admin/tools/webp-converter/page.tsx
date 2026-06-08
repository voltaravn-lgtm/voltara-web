"use client"
import React, { useEffect, useRef, useState } from "react"
type ResizeOption = "original" | 800 | 1200 | 1600 | 2000

interface ImageItem {
id: string
file: File
name: string
originalSize: number
originalWidth: number
originalHeight: number
previewUrl: string
convertedBlob?: Blob
convertedUrl?: string
convertedSize?: number
converting?: boolean
error?: string
}

const COLORS = {
bg: "#050505",
gold: "#d4a43b",
white: "#ffffff",
card: "#0b0b0b",
muted: "#9a9a9a",
}

function bytesToHuman(bytes: number) {
if (bytes === 0) return "0 B"
const k = 1024
const sizes = ["B", "KB", "MB", "GB"]
const i = Math.floor(Math.log(bytes) / Math.log(k))
return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function uid() {
return Math.random().toString(36).slice(2, 9)
}

export default function WebPConverterPage() {
const [items, setItems] = useState<ImageItem[]>([])
const [quality, setQuality] = useState<number>(82) // 50 - 100
const [resize, setResize] = useState<ResizeOption>("original")
const fileInputRef = useRef<HTMLInputElement | null>(null)
const dropRef = useRef<HTMLDivElement | null>(null)
const [dragging, setDragging] = useState(false)

  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 900;

useEffect(() => {
return () => {
// cleanup object URLs
items.forEach((it) => {
URL.revokeObjectURL(it.previewUrl)
if (it.convertedUrl) URL.revokeObjectURL(it.convertedUrl)
})
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

const handleFiles = async (files: FileList | null) => {
if (!files) return
const allowed = ["image/jpeg", "image/jpg", "image/png"]
const newItems: ImageItem[] = []
for (const f of Array.from(files)) {
if (!allowed.includes(f.type)) continue
try {
const dataUrl = await fileToDataUrl(f)
const dims = await getImageDimensions(dataUrl)
const previewUrl = URL.createObjectURL(f)
newItems.push({
id: uid(),
file: f,
name: f.name,
originalSize: f.size,
originalWidth: dims.width,
originalHeight: dims.height,
previewUrl,
})
} catch (e) {
// skip
}
}
if (newItems.length === 0) return
setItems((prev) => [...prev, ...newItems])
}

const onPickClick = () => {
fileInputRef.current?.click()
}

const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
handleFiles(e.target.files)
e.currentTarget.value = ""
}

const onDragOver = (e: React.DragEvent) => {
e.preventDefault()
e.stopPropagation()
setDragging(true)
}
const onDragLeave = (e: React.DragEvent) => {
e.preventDefault()
e.stopPropagation()
setDragging(false)
}
const onDrop = (e: React.DragEvent) => {
e.preventDefault()
e.stopPropagation()
setDragging(false)
const dt = e.dataTransfer
handleFiles(dt.files)
}

// Helpers
function fileToDataUrl(file: File): Promise<string> {
return new Promise((res, rej) => {
const fr = new FileReader()
fr.onload = () => res(String(fr.result))
fr.onerror = () => rej(new Error("Failed reading file"))
fr.readAsDataURL(file)
})
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
return new Promise((res, rej) => {
const img = new Image()
img.onload = () => {
res({ width: img.naturalWidth, height: img.naturalHeight })
}
img.onerror = () => rej(new Error("Image load error"))
img.src = dataUrl
})
}

function toBlob(canvas: HTMLCanvasElement, mime: string, qualityScalar: number): Promise<Blob> {
return new Promise((res, rej) => {
canvas.toBlob(
(b) => {
if (b) res(b)
else rej(new Error("Conversion failed"))
},
mime,
qualityScalar
)
})
}

async function convertItem(item: ImageItem, overrideResize?: ResizeOption): Promise<ImageItem> {
// If already converted and same params, return
// But params may change (quality/resize) — we'll always reconvert on demand
const qualityScalar = Math.max(0, Math.min(1, quality / 100))
const target = overrideResize ?? resize
// Read image
const dataUrl = await fileToDataUrl(item.file)
const img = await new Promise<HTMLImageElement>((res, rej) => {
const i = new Image()
i.onload = () => res(i)
i.onerror = () => rej(new Error("Image load error"))
i.src = dataUrl
})
// compute target dims
let targetWidth = img.naturalWidth
if (target !== "original") {
targetWidth = Math.min(Number(target), img.naturalWidth)
if (targetWidth <= 0) targetWidth = img.naturalWidth
}
const scale = targetWidth / img.naturalWidth
const targetHeight = Math.round(img.naturalHeight * scale)
// draw on canvas
const canvas = document.createElement("canvas")
canvas.width = targetWidth
canvas.height = targetHeight
const ctx = canvas.getContext("2d")
if (!ctx) throw new Error("Cannot get canvas context")
ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
const blob = await toBlob(canvas, "image/webp", qualityScalar)
const convertedUrl = URL.createObjectURL(blob)
const convertedSize = blob.size
return {
...item,
convertedBlob: blob,
convertedUrl,
convertedSize,
}
}

const convertSingle = async (id: string) => {
setItems((prev) => prev.map((p) => (p.id === id ? { ...p, converting: true, error: undefined } : p)))
try {
const it = items.find((i) => i.id === id)
if (!it) return
const converted = await convertItem(it)
setItems((prev) => prev.map((p) => (p.id === id ? { ...converted, converting: false } : p)))
} catch (e: any) {
setItems((prev) => prev.map((p) => (p.id === id ? { ...p, converting: false, error: String(e.message || e) } : p)))
}
}

const convertAll = async () => {
// Convert sequentially to avoid heavy memory use
for (const it of items) {
if (it.converting) continue
// update converting flag
setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, converting: true, error: undefined } : p)))
try {
const converted = await convertItem(it)
setItems((prev) => prev.map((p) => (p.id === it.id ? { ...converted, converting: false } : p)))
} catch (e: any) {
setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, converting: false, error: String(e.message || e) } : p)))
}
}
}

const downloadItem = (it: ImageItem) => {
if (!it.convertedUrl || !it.convertedBlob) {
return
}
const a = document.createElement("a")
a.href = it.convertedUrl
const baseName = it.name.replace(/\.[^/.]+$/, "")
a.download = `${baseName}.webp`
document.body.appendChild(a)
a.click()
a.remove()
}

const downloadAll = async () => {
// ensure all converted first
const needConvert = items.filter((i) => !i.convertedBlob)
if (needConvert.length > 0) {
await convertAll()
}
// then download, small delay between clicks to avoid browser blocking
for (const it of items) {
if (it.convertedUrl) {
downloadItem(it)
// tiny pause
await new Promise((r) => setTimeout(r, 150))
}
}
}

const clearAll = () => {
items.forEach((it) => {
URL.revokeObjectURL(it.previewUrl)
if (it.convertedUrl) URL.revokeObjectURL(it.convertedUrl)
})
setItems([])
}

const removeItem = (id: string) => {
const it = items.find((i) => i.id === id)
if (it) {
URL.revokeObjectURL(it.previewUrl)
if (it.convertedUrl) URL.revokeObjectURL(it.convertedUrl)
}
setItems((prev) => prev.filter((p) => p.id !== id))
}

// Stats
const totalImages = items.length
const totalOriginal = items.reduce((s, i) => s + (i.originalSize || 0), 0)
const totalWebp = items.reduce((s, i) => s + (i.convertedSize || 0), 0)
const totalSaved = totalOriginal - totalWebp

return (
<div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.white, padding: 20, fontFamily: "Inter, system-ui, Arial, sans-serif" }}>
<div style={{ maxWidth: 1200, margin: "0 auto" }}>
<h1 style={{ margin: "8px 0 20px", color: COLORS.gold }}>WEBP Converter</h1>

    {/* Stats */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 20 }}>
      <StatCard label="Tổng ảnh" value={String(totalImages)} />
      <StatCard label="Dung lượng gốc" value={bytesToHuman(totalOriginal)} />
      <StatCard label="Dung lượng WEBP" value={bytesToHuman(totalWebp)} />
      <StatCard label="Saved Space" value={bytesToHuman(totalSaved)} />
    </div>

    {/* Main area */}
    <div style={{ display: "grid", gridTemplateColumns: isMobile
  ? "1fr"
  : "minmax(220px, 300px) minmax(0, 1fr)", gap: 16 }}>
      {/* Upload / Controls */}
      <div style={{ background: COLORS.card, borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0, color: COLORS.gold }}>Upload Images</h2>

        <div
          ref={dropRef}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          style={{
            borderWidth: 2,
            borderStyle: "dashed",
            borderColor: dragging ? COLORS.gold : COLORS.muted,
            borderRadius: 10,
            padding: 20,
            textAlign: "center",
            background: dragging ? "rgba(212,164,59,0.05)" : "transparent",
            color: COLORS.muted,
            transition: "all .15s ease",
            marginBottom: 12,
          }}
        >
          <p style={{ margin: "8px 0", fontSize: 14 }}>{dragging ? "Drop images here" : "Drag & drop JPG/PNG files here"}</p>
          <button
            onClick={onPickClick}
            style={{
              background: COLORS.gold,
              color: COLORS.bg,
              border: "none",
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Choose Files
          </button>
          <input ref={fileInputRef} type="file" accept=".png,image/png,.jpg,.jpeg,image/jpeg" multiple style={{ display: "none" }} onChange={onFileInputChange} />
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 220 }}>
            <label style={{ display: "block", color: COLORS.muted, fontSize: 13, marginBottom: 6 }}>Quality</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="range"
                min={50}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <div style={{ minWidth: 44, textAlign: "right", color: COLORS.white }}>{quality}</div>
            </div>
          </div>

          <div>
            <label style={{ display: "block", color: COLORS.muted, fontSize: 13, marginBottom: 6 }}>Resize</label>
            <select
              value={String(resize)}
              onChange={(e) => setResize(e.target.value === "original" ? "original" : (Number(e.target.value) as ResizeOption))}
              style={{
                background: "transparent",
                color: COLORS.white,
                border: `1px solid ${COLORS.muted}`,
                padding: "8px 10px",
                borderRadius: 8,
                minWidth: 140,
              }}
            >
              <option value="original">Original</option>
              <option value="800">800px</option>
              <option value="1200">1200px</option>
              <option value="1600">1600px</option>
              <option value="2000">2000px</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={convertAll}
            disabled={items.length === 0}
            style={actionButtonStyle()}
          >
            Convert All
          </button>
          <button
            onClick={downloadAll}
            disabled={items.length === 0}
            style={actionButtonStyle(false)}
          >
            Download All
          </button>
          <button
            onClick={clearAll}
            disabled={items.length === 0}
            style={{
              background: "transparent",
              color: COLORS.muted,
              border: `1px solid ${COLORS.muted}`,
              padding: "8px 12px",
              borderRadius: 8,
              cursor: items.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Results */}
      {/* Results */}
<div style={{ background: COLORS.card, borderRadius: 12, padding: 16, minWidth: 0, overflow: "hidden" }}>
        <h2 style={{ marginTop: 0, color: COLORS.gold }}>Results</h2>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? 500 : 680 }}>
            <thead>
              <tr style={{ textAlign: "left", color: COLORS.muted, fontSize: 13 }}>
                <th style={thStyle()}>Preview</th>
                <th style={thStyle()}>Filename</th>
                <th style={thStyle()}>Original</th>
                <th style={thStyle()}>Orig Size</th>
                <th style={thStyle()}>WebP Size</th>
                <th style={thStyle()}>Saved</th>
                <th style={thStyle()}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} style={{ borderTop: `1px solid rgba(255,255,255,0.03)` }}>
                  <td style={tdStyle()}>
                    <div style={{ width: 80, height: 60, borderRadius: 6, overflow: "hidden", background: "#000" }}>
                      <img src={it.previewUrl} alt={it.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  </td>
                  <td style={tdStyle()}>
                    <div style={{ color: COLORS.white, fontSize: 14 }}>{it.name}</div>
                    <div style={{ color: COLORS.muted, fontSize: 12 }}>{it.originalWidth}×{it.originalHeight}px</div>
                  </td>
                  <td style={tdStyle()}>
                    <div style={{ color: COLORS.muted }}>{it.originalWidth}×{it.originalHeight}</div>
                  </td>
                  <td style={tdStyle()}>
                    <div style={{ color: COLORS.white }}>{bytesToHuman(it.originalSize)}</div>
                  </td>
                  <td style={tdStyle()}>
                    <div style={{ color: COLORS.white }}>{it.convertedSize ? bytesToHuman(it.convertedSize) : "-"}</div>
                  </td>
                  <td style={tdStyle()}>
                    <div style={{ color: COLORS.gold }}>
                      {it.convertedSize ? `${Math.round(((it.originalSize - it.convertedSize) / it.originalSize) * 100)}%` : "-"}
                    </div>
                  </td>
                  <td style={tdStyle()}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <button
                        onClick={() => convertSingle(it.id)}
                        disabled={it.converting}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: "none",
                          background: COLORS.gold,
                          color: COLORS.bg,
                          cursor: it.converting ? "not-allowed" : "pointer",
                        }}
                      >
                        {it.converting ? "Converting..." : "Convert"}
                      </button>

                      <button
                        onClick={() => {
                          if (!it.convertedUrl) {
                            // convert then download
                            convertSingle(it.id).then(() => {
                              const updated = items.find((x) => x.id === it.id)
                              if (updated?.convertedUrl) downloadItem(updated)
                            })
                          } else {
                            downloadItem(it)
                          }
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: `1px solid ${COLORS.muted}`,
                          background: "transparent",
                          color: COLORS.white,
                          cursor: "pointer",
                        }}
                      >
                        Download
                      </button>

                      <button
                        onClick={() => removeItem(it.id)}
                        style={{
                          padding: "6px 8px",
                          borderRadius: 8,
                          border: `1px solid rgba(255,255,255,0.04)`,
                          background: "transparent",
                          color: COLORS.muted,
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    {it.error && <div style={{ color: "#ff6b6b", marginTop: 6, fontSize: 12 }}>{it.error}</div>}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 20, color: COLORS.muted, textAlign: "center" }}>
                    Chưa có ảnh nào — hãy thêm ảnh để chuyển đổi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Footer small note */}
    <div style={{ marginTop: 18, color: COLORS.muted, fontSize: 13 }}>
      Ảnh được xử lý trực tiếp trên trình duyệt. Không tải lên máy chủ.
    </div>
  </div>
</div>
)
}

// Small presentational components and styles
function StatCard({ label, value }: { label: string; value: string }) {
return (
<div style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent)", borderRadius: 12, padding: 14 }}>
<div style={{ color: COLORS.muted, fontSize: 13 }}>{label}</div>
<div style={{ color: COLORS.white, fontSize: 20, fontWeight: 600 }}>{value}</div>
</div>
)
}

function actionButtonStyle(primary = true): React.CSSProperties {
return {
background: primary ? COLORS.gold : "transparent",
color: primary ? COLORS.bg : COLORS.white,
border: primary ? "none" : `1px solid ${COLORS.muted}`,
padding: "8px 12px",
borderRadius: 8,
cursor: "pointer",
}
}

function thStyle(): React.CSSProperties {
return { padding: "12px 10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.02em" }
}
function tdStyle(): React.CSSProperties {
return { padding: "10px", verticalAlign: "middle", fontSize: 14, color: COLORS.muted }
}