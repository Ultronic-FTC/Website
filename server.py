#!/usr/bin/env python3
import http.server
import os

PORT = 8000

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Redirect /index.html to /
        if self.path == '/index.html':
            self.send_response(301)
            self.send_header('Location', '/')
            self.end_headers()
            return

        # Redirect *.html to clean URL
        if self.path.endswith('.html') and self.path != '/index.html':
            clean_path = self.path[:-5]  # Remove .html
            self.send_response(301)
            self.send_header('Location', clean_path)
            self.end_headers()
            return

        path = self.translate_path(self.path)

        # If path is a directory, look for index.html
        if os.path.isdir(path):
            index_path = os.path.join(path, 'index.html')
            if os.path.exists(index_path):
                return super().do_GET()

        # If file exists, serve it
        if os.path.exists(path):
            return super().do_GET()

        # Try adding .html extension (clean URLs)
        html_path = path + '.html'
        if os.path.exists(html_path):
            self.path = self.path + '.html'
            return super().do_GET()

        # Otherwise serve 404.html
        self.send_response(404)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

        with open('404.html', 'rb') as f:
            self.wfile.write(f.read())

if __name__ == '__main__':
    with http.server.HTTPServer(('', PORT), CustomHandler) as httpd:
        print(f'Serving at http://localhost:{PORT}')
        httpd.serve_forever()
