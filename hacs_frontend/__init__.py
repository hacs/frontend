"""HACS Frontend"""
from .version import VERSION

def locate_dir():
    return __path__[0]

def locate_js():
    return f"{__path__[0]}/main.js"

def locate_gz():
    return f"{__path__[0]}/main.js.gz"

def locate_debug_js():
    return f"{__path__[0]}/debug.js"

def locate_debug_gz():
    return f"{__path__[0]}/debug.js.gz"