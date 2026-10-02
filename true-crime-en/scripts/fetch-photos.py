#!/usr/bin/env python3
"""Download freely licensed photos from Wikimedia Commons for the scenes listed in data/photos.py.

  python3 scripts/fetch-photos.py [slug ...]

Writes public/photos/<slug>/sNN.jpg and src/photos.json (file + credit per scene).
Only public domain / CC0 / CC BY / CC BY-SA files are accepted; everything else is skipped.
To use your own image instead, put it at public/photos/<slug>/sNN.jpg and add its entry to src/photos.json by hand.
"""
import html, json, re, sys, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "data"))
from photos import PHOTOS  # noqa: E402

API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "TechDZ-Trends true-crime shorts (educational video; contact via repository)"}
FREE = re.compile(r"^(cc0|public domain|pd\b|pd-|cc[ -]by(-sa)?[ -]\d)", re.I)


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()


def search(query):
    params = {"action": "query", "format": "json", "generator": "search", "gsrsearch": query, "gsrnamespace": 6,
              "gsrlimit": 20, "prop": "imageinfo", "iiprop": "url|extmetadata|size|mime", "iiurlwidth": 1600}
    data = json.loads(get(API + "?" + urllib.parse.urlencode(params)))
    pages = sorted(data.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
    for p in pages:
        info = (p.get("imageinfo") or [{}])[0]
        meta = info.get("extmetadata", {})
        lic = meta.get("LicenseShortName", {}).get("value", "")
        if info.get("mime") not in ("image/jpeg", "image/png") or info.get("width", 0) < 800 or not FREE.match(lic):
            continue
        artist = re.sub(r"<[^>]+>", "", html.unescape(meta.get("Artist", {}).get("value", "Unknown"))).strip()
        return {"url": info.get("thumburl") or info["url"], "license": lic, "artist": artist,
                "source": info.get("descriptionurl", ""), "title": p["title"]}
    return None


def main():
    manifest_path = ROOT / "src" / "photos.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    for slug in sys.argv[1:] or PHOTOS:
        out_dir = ROOT / "public" / "photos" / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        for scene, spec in PHOTOS.get(slug, {}).items():
            sid = f"s{scene:02d}"
            hit = search(spec["query"])
            if not hit:
                print(f"{slug} {sid}: no freely licensed image for '{spec['query']}'")
                continue
            (out_dir / f"{sid}.jpg").write_bytes(get(hit["url"]))
            credit = f"{hit['artist']} · {hit['license']} · Wikimedia Commons"
            manifest.setdefault(slug, {})[sid] = {"file": f"photos/{slug}/{sid}.jpg", "label": spec["label"], "credit": credit, "source": hit["source"]}
            print(f"{slug} {sid}: {hit['title']} ({hit['license']}, {hit['artist']})")
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
