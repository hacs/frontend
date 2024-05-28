from pathlib import Path

from setuptools import setup, find_packages

setup(
    name="hacs-frontend",
    version="main",
    description="The HACS frontend",
    url="https://github.com/hacs/frontend",
    author="Joakim Sorensen",
    author_email="ludeeus@gmail.com",
    packages=find_packages(include=["hacs_frontend", "hacs_frontend.*"]),
    include_package_data=True,
    zip_safe=False,
    long_description=Path("README.md").read_text(),
    long_description_content_type="text/markdown",
)