import { useRef, useState } from 'react'

export default function UploadBox({ onUpload, label = 'Upload file', accepted = '.pdf,.xlsx,.csv,.docx' }) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    setUploading(true)
    await onUpload(file)
    setUploading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFile(file)
  }

  return (
    <div
      style={{
        border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: '30px 20px',
        textAlign: 'center',
        background: dragOver ? 'var(--accent-soft)' : 'var(--panel)',
        transition: 'border-color 0.2s, background 0.2s',
        cursor: 'pointer'
      }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accepted}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <i className="ti ti-cloud-upload" style={{ fontSize: 28, color: 'var(--accent)', display: 'block', marginBottom: 8 }} />
      <p style={{ fontSize: 13, margin: 0 }}>
        {uploading ? 'Uploading...' : label}
      </p>
      <p style={{ fontSize: 11, color: 'var(--muted)', margin: '4px 0 0' }}>
        Drag & drop or click to browse
      </p>
    </div>
  )
}