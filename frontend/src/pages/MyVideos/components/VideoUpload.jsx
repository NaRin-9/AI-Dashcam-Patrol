import { useRef, useState } from 'react'
import { uploadVideo } from '@/services/api'
import './video-upload.css'

const maxVideoBytes = 500 * 1024 * 1024
const formatSize = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 })

export default function VideoUpload({ onUploaded }) {
  const dialog = useRef(null)
  const nextId = useRef(0)
  const [items, setItems] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [notice, setNotice] = useState('')
  const pending = items.filter((item) => item.status !== 'saved')

  function addFiles(files) {
    if (uploading) return
    const accepted = []
    const rejected = []
    for (const file of files) {
      if (/\.(mp4|mov)$/i.test(file.name) && file.size > 0 && file.size <= maxVideoBytes) {
        accepted.push({ id: nextId.current++, file, status: 'ready', progress: 0 })
      } else {
        rejected.push(file.name)
      }
    }
    setItems((current) => [...current, ...accepted])
    setNotice(rejected.length ? `เลือกไฟล์ไม่ได้: ${rejected.join(', ')}` : '')
  }

  function update(id, changes) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item))
  }

  async function submit(event) {
    event.preventDefault()
    if (uploading || !pending.length) return
    setUploading(true)
    setNotice('')
    try {
      for (const { id, file } of pending) {
        update(id, { status: 'uploading', progress: 0, error: '' })
        try {
          await uploadVideo(file, (progress) => update(id, { progress }))
          update(id, { status: 'saved', progress: 100 })
          onUploaded?.()
        } catch (error) {
          update(id, { status: 'failed', error: error.message })
        }
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <button type="button" className="video-upload-trigger" onClick={() => dialog.current.showModal()}>
        <span aria-hidden="true">+</span> อัปโหลดวิดีโอ
      </button>
      <dialog
        ref={dialog}
        className="video-upload"
        aria-labelledby="video-upload-title"
        onCancel={(event) => { if (uploading) event.preventDefault() }}
        onClose={() => {
          setItems((current) => current.filter((item) => item.status !== 'saved'))
          setNotice('')
          setDragging(false)
        }}
      >
        <form onSubmit={submit}>
          <div className="video-upload-heading">
            <h2 id="video-upload-title">อัปโหลดวิดีโอ</h2>
            <button type="button" className="video-upload-close" aria-label="ปิด" disabled={uploading} onClick={() => dialog.current.close()}>×</button>
          </div>
          <label
            className={dragging ? 'video-upload-drop is-dragging' : 'video-upload-drop'}
            onDragOver={(event) => { event.preventDefault(); if (!uploading) setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              addFiles(event.dataTransfer.files)
            }}
          >
            <input
              type="file"
              className="sr-only"
              accept=".mp4,.mov,video/mp4,video/quicktime"
              multiple
              disabled={uploading}
              aria-label="เลือกไฟล์วิดีโอ"
              onChange={(event) => {
                addFiles(event.currentTarget.files)
                event.currentTarget.value = ''
              }}
            />
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M13 3H5v18h14V9l-6-6Zm0 0v6h6M12 17v-5m-2 2 2-2 2 2" />
            </svg>
            <span>ลากไฟล์มาวาง หรือ <strong>เลือกไฟล์</strong></span>
          </label>
          <p className="video-upload-hint">รองรับ MP4 และ MOV ขนาดไม่เกิน 500 MB ต่อไฟล์</p>
          {notice && <p className="video-upload-error" role="alert">{notice}</p>}
          {items.length > 0 && <ul className="video-upload-items" aria-label="ไฟล์วิดีโอ">
            {items.map(({ id, file, status, progress, error }) => (
              <li key={id}>
                <div className="video-upload-file">
                  <strong>{file.name}</strong>
                  <small>{formatSize.format(file.size / 1024 / 1024)} MB</small>
                </div>
                {status === 'saved' ? (
                  <small className="video-upload-success" role="status">อัปโหลดแล้ว · รอประมวลผล</small>
                ) : (
                  <button type="button" className="video-upload-close" aria-label={`เอา ${file.name} ออกจากรายการ`} disabled={uploading} onClick={() => setItems((current) => current.filter((item) => item.id !== id))}>×</button>
                )}
                {status === 'uploading' && (
                  <div className="video-upload-progress">
                    <progress max="100" value={progress === 100 ? undefined : progress} aria-label={`ความคืบหน้า ${file.name}`} />
                    <small>{progress === 100 ? 'กำลังบันทึก' : `${progress}%`}</small>
                  </div>
                )}
                {error && <small className="video-upload-error" role="alert">{error}</small>}
              </li>
            ))}
          </ul>}
          {items.length > 0 && pending.length === 0 ? (
            <button type="button" className="video-upload-submit" onClick={() => dialog.current.close()}>เสร็จสิ้น</button>
          ) : (
            <button type="submit" className="video-upload-submit" disabled={uploading || !pending.length}>
              {uploading ? 'กำลังอัปโหลด…' : 'อัปโหลดวิดีโอ'}
            </button>
          )}
        </form>
      </dialog>
    </>
  )
}
