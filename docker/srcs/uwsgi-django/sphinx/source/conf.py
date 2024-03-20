# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'ft'
copyright = '2024, hioikawa'
author = 'hioikawa'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

# extensions = ['myst_parser']
extensions = [
    'myst_parser',  # Markdown support
    'sphinx.ext.autodoc',  # Enables autodoc
    'sphinx.ext.viewcode'  # Add links to highlighted source code
]

import os
import sys
import django

sys.path.insert(0, os.path.abspath('../../')) # Djangoプロジェクトルートへのパス
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trans_pj.settings') # Django設定モジュールへのパス
django.setup()

templates_path = ['_templates']
exclude_patterns = []


# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'sphinxdoc'
# html_theme = 'bizstyle'
html_static_path = ['_static']
