"""HACS Frontend"""

def locate_dir():
    return __path__

def locate_js():
    return f"{__path__}/main.js"

def locate_gz():
    return f"{__path__}/main.js.gz"