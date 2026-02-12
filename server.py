#!/usr/bin/env python3
import http.server
import os

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?')[0]
        if path != '/' and '.' not in os.path.basename(path):
            if os.path.exists(self.translate_path(path + '.html')):
                self.path = path + '.html'
        super().do_GET()

if __name__ == '__main__':
    print('Server running at http://localhost:8080')
    http.server.HTTPServer(('', 8080), CleanURLHandler).serve_forever()
