#!/usr/bin/env python3
"""Static file server for local preview of the Butcher Core marketing site.
Serves the ./public web root on port 4179 using an absolute directory so it
works in restricted sandboxes (avoids os.getcwd())."""
import functools
import http.server
import socketserver

PORT = 4179
DIRECTORY = "/Users/justinkeir/Documents/ClaudeCode/ButcherCore/public"

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=DIRECTORY)


class Server(socketserver.TCPServer):
    allow_reuse_address = True


with Server(("127.0.0.1", PORT), Handler) as httpd:
    print(f"Serving {DIRECTORY} at http://127.0.0.1:{PORT}")
    httpd.serve_forever()
