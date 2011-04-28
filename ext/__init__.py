import os
import sys

ext_path = os.path.dirname(__file__)
if ext_path not in sys.path:
    sys.path.insert(0, ext_path)