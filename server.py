"""A tiny local server for AI Intelligence Desk.

It serves the mobile web app and exposes the latest curated issue from
data/daily.json. There are no packages to install: macOS already includes
the Python runtime needed to run this file.
"""

from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os


ROOT = Path(__file__).resolve().parent
BRIEF_FILE = ROOT / "data" / "daily.json"
PORT = int(os.environ.get("PORT", "8787"))


class IntelligenceDeskHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path.split("?", 1)[0] != "/api/brief":
            return super().do_GET()

        try:
            payload = BRIEF_FILE.read_text(encoding="utf-8")
            json.loads(payload)
        except (OSError, json.JSONDecodeError):
            self.send_error(HTTPStatus.SERVICE_UNAVAILABLE, "Daily brief is not ready")
            return

        body = payload.encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        # Keep the terminal readable while the site is used on a phone.
        return


if __name__ == "__main__":
    with ThreadingHTTPServer(("0.0.0.0", PORT), IntelligenceDeskHandler) as server:
        print(f"AI Intelligence Desk is ready at http://localhost:{PORT}")
        server.serve_forever()
