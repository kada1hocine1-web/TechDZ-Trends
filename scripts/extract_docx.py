"""Extract text (in body order, incl. tables, math and image refs) and media from the exercises docx."""
import sys, zipfile, pathlib
from lxml import etree

SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "input/سلسلة_تمارين_الوحدة_الاولى.docx")
OUT_TXT = pathlib.Path("solutions/source_extracted.md")
FIG = pathlib.Path("public/figures")
NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "m": "http://schemas.openxmlformats.org/officeDocument/2006/math",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "v": "urn:schemas-microsoft-com:vml",
}
W = "{%s}" % NS["w"]; M = "{%s}" % NS["m"]

z = zipfile.ZipFile(SRC)
rels = etree.fromstring(z.read("word/_rels/document.xml.rels"))
rid2target = {r.get("Id"): r.get("Target") for r in rels}
FIG.mkdir(parents=True, exist_ok=True)
# media file -> descriptive name (mapping established by visual inspection of each figure)
RENAME = {"image1.png": "ex11_S2O8_vs_t.png", "image2.png": "ex12_nI2_curves_abc.png", "image3.jpg": "ex13_I2_vs_t.jpg"}
for n in z.namelist():
    if n.startswith("word/media/"):
        name = pathlib.Path(n).name
        (FIG / RENAME.get(name, name)).write_bytes(z.read(n))

def math_text(el):
    return "".join(t.text or "" for t in el.iter(M + "t"))

def para_text(p):
    out = []
    for el in p.iter():
        if el.tag == W + "t":
            if not any(a.tag in (M + "oMath",) for a in el.iterancestors()):
                out.append(el.text or "")
        elif el.tag == W + "tab":
            out.append("\t")
        elif el.tag == M + "oMath":
            out.append(" $" + math_text(el) + "$ ")
        elif el.tag == "{%s}blip" % NS["a"]:
            rid = el.get("{%s}embed" % NS["r"])
            out.append(f" [IMAGE: {rid2target.get(rid)}] ")
        elif el.tag == "{%s}imagedata" % NS["v"]:
            rid = el.get("{%s}id" % NS["r"])
            out.append(f" [IMAGE: {rid2target.get(rid)}] ")
    return "".join(out).strip()

doc = etree.fromstring(z.read("word/document.xml"))
body = doc.find("w:body", NS)
lines = []
for child in body:
    if child.tag == W + "p":
        t = para_text(child)
        if t:
            lines.append(t)
    elif child.tag == W + "tbl":
        for tr in child.iter(W + "tr"):
            cells = [" ".join(para_text(p) for p in tc.iter(W + "p")).strip() for tc in tr.iter(W + "tc")]
            lines.append("| " + " | ".join(cells) + " |")
        lines.append("")
OUT_TXT.write_text("\n\n".join(lines), encoding="utf-8")
print(f"wrote {OUT_TXT}, figures -> {FIG}")
