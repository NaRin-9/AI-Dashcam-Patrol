package routes

import (
	"fmt"
	"io/fs"
	"net/http"
	"path"
	"strings"
)

// WithFrontend ให้ React ใช้ URL แบบ /live-map โดยเสิร์ฟ index.html สำหรับเส้นทางของเว็บ
func WithFrontend(api http.Handler, files fs.FS) (http.Handler, error) {
	entry, err := fs.Stat(files, "index.html")
	if err != nil {
		return nil, fmt.Errorf("read frontend index.html: %w", err)
	}
	if !entry.Mode().IsRegular() {
		return nil, fmt.Errorf("frontend index.html must be a regular file")
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		urlPath := r.URL.Path
		if urlPath == "/api" || strings.HasPrefix(urlPath, "/api/") {
			api.ServeHTTP(w, r)
			return
		}

		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			w.Header().Set("Allow", "GET, HEAD")
			http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
			return
		}

		name := strings.Trim(urlPath, "/")
		if name != "" {
			if !fs.ValidPath(name) || strings.Contains(name, `\`) {
				http.NotFound(w, r)
				return
			}
			if file, err := fs.Stat(files, name); err == nil && file.Mode().IsRegular() {
				http.ServeFileFS(w, r, files, name)
				return
			}
			if name == "assets" || strings.HasPrefix(name, "assets/") || path.Ext(name) != "" {
				http.NotFound(w, r)
				return
			}
		}

		w.Header().Set("Cache-Control", "no-cache")
		http.ServeFileFS(w, r, files, "index.html")
	}), nil
}
