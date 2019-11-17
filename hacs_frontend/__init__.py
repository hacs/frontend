"""HACS Frontend"""
import os

def locate_dir():
    return os.getcwd()

def locate_js():
    return f"{locate_dir()}/main.js"

def locate_gz():
    return f"{locate_dir()}/main.js.gz"