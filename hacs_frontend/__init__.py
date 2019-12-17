"""HACS Frontend"""
from .version import VERSION

def locate_dir():
    return __path__[0]

def locate_js():
    return f"{__path__[0]}/main{VERSION}.js"

def locate_gz():
    return f"{__path__[0]}/main{VERSION}.js.gz"

def locate_debug_js():
    return f"{__path__[0]}/debug{VERSION}.js"

def locate_debug_gz():
    return f"{__path__[0]}/debug{VERSION}.js.gz"