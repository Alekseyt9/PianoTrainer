# Simple helpers for serving the Piano Trainer locally.

PORT ?= 8080

.PHONY: run server browser

run: server

server:
	@echo "Serving on http://localhost:$(PORT)/"
	@python -m webbrowser "http://localhost:$(PORT)/index.html"
	@python -m http.server $(PORT)

browser:
	@python -m webbrowser "http://localhost:$(PORT)/index.html"
