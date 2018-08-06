import http.server
import socketserver
from http.server import BaseHTTPRequestHandler, HTTPServer, SimpleHTTPRequestHandler

from os import curdir
from os.path import join as pjoin
import os

import speech_recognition as sr

PORT = 8001

r = sr.Recognizer()


Handler = http.server.SimpleHTTPRequestHandler

class StoreHandler(SimpleHTTPRequestHandler):
    store_path = pjoin(curdir, 'foo.wav')

    # def end_headers(self):
    #     self.send_header('Access-Control-Allow-Origin', '*')
    #     self.end_headers()

    def do_POST(self):
        print('foo')
        if self.path == '/api/guess':
            length = self.headers['content-length']
            data = self.rfile.read(int(length))

            # print(data)

            with open(self.store_path, 'wb') as fh:
                fh.write(data)
            # print("Google Speech Recognition thinks you said " + r.recognize_google(data))

            self.send_response(200)

    def do_OPTIONS(self):
        print('option')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header("Access-Control-Allow-Headers", "x-requested-with")
        self.send_header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS, POST')
        self.send_response(204)

with socketserver.TCPServer(("", PORT), StoreHandler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()