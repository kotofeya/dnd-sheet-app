import struct, sys
def load(path):
    return bytearray(open(path, 'rb').read())
class PE:
    def __init__(self, b):
        self.b = b
        e = struct.unpack_from('<I', b, 0x3C)[0]
        assert b[e:e+4] == b'PE\0\0'
        nsec = struct.unpack_from('<H', b, e + 6)[0]
        optsz = struct.unpack_from('<H', b, e + 20)[0]
        opt = e + 24
        magic = struct.unpack_from('<H', b, opt)[0]
        ddoff = opt + (112 if magic == 0x20b else 96)
        self.rsrc_rva, self.rsrc_size = struct.unpack_from('<II', b, ddoff + 8 * 2)
        self.secs = []
        so = opt + optsz
        for i in range(nsec):
            name = b[so + 40*i: so + 40*i + 8].rstrip(b'\0')
            vsize, va, rawsz, rawptr = struct.unpack_from('<IIII', b, so + 40*i + 8)
            self.secs.append((name, va, vsize, rawptr, rawsz))
    def off(self, rva):
        for n, va, vs, rp, rs in self.secs:
            if va <= rva < va + max(vs, rs): return rp + rva - va
        raise ValueError(hex(rva))
    def walk(self):
        """yields (type, name, lang, entry_file_offset_of_data_entry, data_rva, size)"""
        base = self.off(self.rsrc_rva)
        out = []
        def dirents(o):
            nnamed, nid = struct.unpack_from('<HH', self.b, o + 12)
            for i in range(nnamed + nid):
                nm, ptr = struct.unpack_from('<II', self.b, o + 16 + 8*i)
                if nm & 0x80000000:
                    so = base + (nm & 0x7fffffff); ln = struct.unpack_from('<H', self.b, so)[0]
                    nm = self.b[so+2: so+2+2*ln].decode('utf-16le')
                yield nm, ptr
        for t, p1 in dirents(base):
            for n, p2 in dirents(base + (p1 & 0x7fffffff)):
                for l, p3 in dirents(base + (p2 & 0x7fffffff)):
                    de = base + p3
                    rva, size = struct.unpack_from('<II', self.b, de)
                    out.append((t, n, l, de, rva, size))
        return out
if __name__ == '__main__':
    pe = PE(load(sys.argv[1]))
    print(pe.secs)
    for t, n, l, de, rva, size in pe.walk():
        if t in (3, 14, 16, 24): print(t, n, l, hex(rva), size)
