#!/usr/bin/env python3
"""Fetch Petra docs pages and save raw HTML locally.

Usage:
  python3 tools/petra_crawl.py --out docs/_raw/petra --list tools/petra_pages.txt
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

DEFAULT_UA = "Mozilla/5.0 (compatible; PetraDocsCrawler/1.0; +https://petra.app/docs)"


def slugify(url: str) -> str:
    # Stable filename from URL
    h = hashlib.sha256(url.encode("utf-8")).hexdigest()[:12]
    safe = url.replace("https://", "").replace("http://", "").replace("/", "_")
    return f"{safe}_{h}.html"


def fetch(url: str, ua: str) -> bytes:
    req = Request(url, headers={"User-Agent": ua})
    with urlopen(req, timeout=20) as resp:
        return resp.read()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True, help="Output directory")
    parser.add_argument("--list", required=True, help="Text file with one URL per line")
    parser.add_argument("--sleep", type=float, default=0.8, help="Sleep seconds between requests")
    parser.add_argument("--ua", default=DEFAULT_UA, help="User-Agent")
    args = parser.parse_args()

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    list_path = Path(args.list)
    urls = [line.strip() for line in list_path.read_text().splitlines() if line.strip()]

    index = []
    for url in urls:
        filename = slugify(url)
        out_path = out_dir / filename
        try:
            content = fetch(url, args.ua)
            out_path.write_bytes(content)
            index.append({"url": url, "file": str(out_path)})
            print(f"Saved: {url} -> {out_path}")
        except (HTTPError, URLError) as e:
            print(f"Failed: {url} ({e})", file=sys.stderr)
            index.append({"url": url, "file": None, "error": str(e)})
        time.sleep(args.sleep)

    (out_dir / "index.json").write_text(json.dumps(index, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
