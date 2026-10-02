# Replace the Electron icon and names in a copy of electron.exe (in place, no resizing of .rsrc).
import struct, sys, json, base64
sys.path.insert(0, sys.path[0])
from peres import PE, load
src, dst, icons_json = sys.argv[1:4]
b = load(src); pe = PE(b)
icons = {int(k): (v['size'], base64.b64decode(v['data'])) for k, v in json.load(open(icons_json)).items()}
ents = pe.walk()
grp = [e for e in ents if e[0] == 14][0]
g = pe.off(grp[4])
cnt = struct.unpack_from('<H', b, g + 4)[0]
for i in range(cnt):
    eo = g + 6 + 14 * i
    nid = struct.unpack_from('<H', b, eo + 12)[0]
    if nid not in icons: continue
    size, data = icons[nid]
    ent = [e for e in ents if e[0] == 3 and e[1] == nid][0]
    if len(data) > ent[5]: raise SystemExit(f'icon {nid} too big: {len(data)} > {ent[5]}')
    o = pe.off(ent[4])
    b[o:o + ent[5]] = data + b'\0' * (ent[5] - len(data))
    struct.pack_into('<I', b, ent[3] + 4, len(data))          # data entry size
    wb = 0 if size >= 256 else size
    struct.pack_into('<BBBBHHI', b, eo, wb, wb, 0, 0, 1, 32, len(data))
    print('icon', nid, size, len(data))
ver = [e for e in ents if e[0] == 16][0]
vo = pe.off(ver[4]); vd = bytes(b[vo:vo + ver[5]])
old = 'Electron\0'.encode('utf-16le'); new = 'Mystara\0\0'.encode('utf-16le')
n = vd.count(old); vd = vd.replace(old, new); b[vo:vo + ver[5]] = vd
print('version strings patched:', n)
open(dst, 'wb').write(b)
