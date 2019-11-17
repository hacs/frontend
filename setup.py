from setuptools import setup, find_packages

setup(
    name="hacs-frontend",
    version="1",
    description="The HACS frontend",
    url="https://github.com/hacs/frontend",
    author="Joakim Sorensen",
    author_email="ludeeus@gmail.com",
    packages=find_packages(include=["hacs_frontend", "hacs_frontend.*"]),
    include_package_data=True,
    zip_safe=False,
)