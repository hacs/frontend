"""HACS Frontend"""

def locate_dir():
    return __path__[0]

def locate_js():
    return f"{__path__[0]}/main.js"

def locate_gz():
    return f"{__path__[0]}/main.js.gz"