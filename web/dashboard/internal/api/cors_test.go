package api

import (
	"net/http"
	"testing"
)

func TestCORSAllowsConfiguredOrigin(t *testing.T) {
	api := NewWithConfig(nil, Config{
		AllowedOrigins: []string{"https://install.regenfass.eu"},
	})

	req, err := http.NewRequest(http.MethodOptions, "/healthz", nil)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Origin", "https://install.regenfass.eu")
	req.Header.Set("Access-Control-Request-Method", "GET")

	res, err := api.app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if got := res.Header.Get("Access-Control-Allow-Origin"); got != "https://install.regenfass.eu" {
		t.Fatalf("Access-Control-Allow-Origin = %q, want configured origin", got)
	}
}

func TestCORSRejectsUnknownOrigin(t *testing.T) {
	api := NewWithConfig(nil, Config{
		AllowedOrigins: []string{"https://install.regenfass.eu"},
	})

	req, err := http.NewRequest(http.MethodOptions, "/healthz", nil)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Origin", "https://example.invalid")
	req.Header.Set("Access-Control-Request-Method", "GET")

	res, err := api.app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if got := res.Header.Get("Access-Control-Allow-Origin"); got != "" {
		t.Fatalf("Access-Control-Allow-Origin = %q, want empty for unknown origin", got)
	}
}

func TestNormalizeAllowedOrigins(t *testing.T) {
	got := normalizeAllowedOrigins([]string{" https://install.regenfass.eu ", "", "   "})

	if len(got) != 1 || got[0] != "https://install.regenfass.eu" {
		t.Fatalf("normalizeAllowedOrigins() = %#v", got)
	}
}
