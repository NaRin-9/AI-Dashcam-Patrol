package controllers

import (
	"bytes"
	"database/sql"
	"encoding/binary"
	"errors"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"unicode/utf8"

	"ai-dashcam-patrol/backend/internal/entities/videoupload"
	"ai-dashcam-patrol/backend/internal/middleware"
	"github.com/gin-gonic/gin"
)

const (
	maxVideoBytes   = 500 << 20
	maxRequestBytes = maxVideoBytes + (1 << 20)
)

type VideoUploadsController struct {
	db  *sql.DB
	dir string
}

func NewVideoUploadsController(db *sql.DB, dir string) *VideoUploadsController {
	return &VideoUploadsController{db: db, dir: dir}
}

func (ctrl *VideoUploadsController) ListMine(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	rows, err := ctrl.db.QueryContext(c.Request.Context(),
		`SELECT id, original_name, size_bytes, status, created_at
		 FROM video_uploads WHERE uploaded_by = $1 ORDER BY created_at DESC, id DESC`, user.ID)
	if err != nil {
		replyVideoListError(c, err)
		return
	}
	defer rows.Close()

	videos := make([]videoupload.Summary, 0)
	for rows.Next() {
		var video videoupload.Summary
		if err := rows.Scan(&video.ID, &video.Name, &video.SizeBytes, &video.Status, &video.CreatedAt); err != nil {
			replyVideoListError(c, err)
			return
		}
		videos = append(videos, video)
	}
	if err := rows.Err(); err != nil {
		replyVideoListError(c, err)
		return
	}
	c.Header("Cache-Control", "no-store")
	c.JSON(http.StatusOK, gin.H{"videos": videos})
}

func replyVideoListError(c *gin.Context, err error) {
	_ = c.Error(err)
	c.JSON(http.StatusInternalServerError, gin.H{"error": "โหลดรายการวิดีโอไม่สำเร็จ"})
}

func (ctrl *VideoUploadsController) Upload(c *gin.Context) {
	if c.Request.ContentLength > maxRequestBytes {
		replyUploadReadError(c, &http.MaxBytesError{Limit: maxRequestBytes})
		return
	}
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxRequestBytes)
	reader, err := c.Request.MultipartReader()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาแนบไฟล์วิดีโอ"})
		return
	}
	part, err := reader.NextPart()
	if err != nil {
		replyUploadReadError(c, err)
		return
	}

	name := filepath.Base(strings.ReplaceAll(part.FileName(), "\\", "/"))
	ext := strings.ToLower(filepath.Ext(name))
	if part.FormName() != "video" || (ext != ".mp4" && ext != ".mov") ||
		len(name) > 255 || !utf8.ValidString(name) || strings.ContainsRune(name, 0) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาเลือกไฟล์ MP4 หรือ MOV ที่มีชื่อไฟล์ถูกต้อง"})
		return
	}
	header := make([]byte, 8)
	if _, err := io.ReadFull(part, header); err != nil || !hasVideoContainerHeader(header) {
		c.JSON(http.StatusUnsupportedMediaType, gin.H{"error": "ไฟล์นี้ไม่ใช่วิดีโอ MP4 หรือ MOV ที่รองรับ"})
		return
	}

	if err := os.MkdirAll(ctrl.dir, 0700); err != nil {
		replyUploadStorageError(c, err)
		return
	}
	file, err := os.CreateTemp(ctrl.dir, "video-*"+ext)
	if err != nil {
		replyUploadStorageError(c, err)
		return
	}
	saved := false
	defer func() {
		if !saved {
			_ = os.Remove(file.Name())
		}
	}()
	size, err := io.Copy(file, io.LimitReader(io.MultiReader(bytes.NewReader(header), part), maxVideoBytes+1))
	closeErr := file.Close()
	if err != nil {
		var pathErr *os.PathError
		if errors.As(err, &pathErr) {
			replyUploadStorageError(c, err)
		} else {
			replyUploadReadError(c, err)
		}
		return
	}
	if closeErr != nil {
		replyUploadStorageError(c, closeErr)
		return
	}
	if size > maxVideoBytes {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "ไฟล์ต้องมีขนาดไม่เกิน 500 MB"})
		return
	}
	if _, err := reader.NextPart(); err != io.EOF {
		replyUploadReadError(c, err)
		return
	}

	user := middleware.GetCurrentUser(c)
	var id, status string
	err = ctrl.db.QueryRowContext(c.Request.Context(),
		`INSERT INTO video_uploads (uploaded_by, original_name, storage_key, size_bytes)
		 VALUES ($1, $2, $3, $4) RETURNING id, status`,
		user.ID, name, filepath.Base(file.Name()), size,
	).Scan(&id, &status)
	if err != nil {
		replyUploadStorageError(c, err)
		return
	}
	saved = true
	c.JSON(http.StatusCreated, gin.H{"id": id, "name": name, "sizeBytes": size, "status": status})
}

// MP4 and QuickTime use box headers. Older MOV files may start with media or padding boxes.
func hasVideoContainerHeader(header []byte) bool {
	length := binary.BigEndian.Uint32(header[:4])
	if length > 1 && length < 8 {
		return false
	}
	switch string(header[4:8]) {
	case "ftyp", "moov", "mdat", "wide", "free", "skip":
		return true
	default:
		return false
	}
}

func replyUploadReadError(c *gin.Context, err error) {
	var sizeErr *http.MaxBytesError
	if errors.As(err, &sizeErr) {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "ไฟล์ต้องมีขนาดไม่เกิน 500 MB"})
		return
	}
	c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาส่งวิดีโอครั้งละหนึ่งไฟล์ต่อคำขอ"})
}

func replyUploadStorageError(c *gin.Context, err error) {
	_ = c.Error(err)
	c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกวิดีโอไม่สำเร็จ กรุณาลองอีกครั้ง"})
}
