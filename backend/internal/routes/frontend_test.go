package routes

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"
)

func TestWithFrontendRoutes(t *testing.T) {
	const appShell = "<!doctype html><div id=\"root\"></div>"
	files := fstest.MapFS{
		"index.html":    {Data: []byte(appShell)},
		"assets/app.js": {Data: []byte("console.log('app')")},
	}
	handler, err := WithFrontend(New("http://localhost:5173"), files)
	if err != nil {
		t.Fatal(err)
	}

	tests := []struct {
		method string
		path   string
		status int
		body   string
	}{
		{http.MethodGet, "/", http.StatusOK, appShell},
		{http.MethodGet, "/live-map", http.StatusOK, appShell},
		{http.MethodHead, "/live-map", http.StatusOK, ""},
		{http.MethodGet, "/reports/archive/", http.StatusOK, appShell},
		{http.MethodGet, "/assets/app.js", http.StatusOK, "console.log('app')"},
		{http.MethodGet, "/assets/missing", http.StatusNotFound, "404 page not found\n"},
		{http.MethodGet, "/missing.png", http.StatusNotFound, "404 page not found\n"},
		{http.MethodGet, "/api/health", http.StatusOK, "{\"status\":\"ok\"}\n"},
		{http.MethodGet, "/api/missing", http.StatusNotFound, "404 page not found\n"},
		{http.MethodPost, "/live-map", http.StatusMethodNotAllowed, "Method Not Allowed\n"},
	}

	for _, test := range tests {
		t.Run(test.method+" "+test.path, func(t *testing.T) {
			response := httptest.NewRecorder()
			handler.ServeHTTP(response, httptest.NewRequest(test.method, test.path, nil))
			if response.Code != test.status || response.Body.String() != test.body {
				t.Fatalf("status = %d, body = %q; want %d, %q", response.Code, response.Body, test.status, test.body)
			}
		})
	}
}

func TestWithFrontendRequiresIndex(t *testing.T) {
	_, err := WithFrontend(New(""), fstest.MapFS{})
	if err == nil || !strings.Contains(err.Error(), "index.html") {
		t.Fatalf("error = %v, want missing index.html error", err)
	}
}
