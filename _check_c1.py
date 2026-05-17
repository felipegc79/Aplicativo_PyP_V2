import os

base = r'D:\Proyecto PyP Colsanitas react V2\src'

for root, dirs, files in os.walk(base):
    for f in files:
        if not f.endswith(('.jsx','.js','.json','.css','.html')):
            continue
        fp = os.path.join(root, f)
        with open(fp, 'rb') as fh:
            data = fh.read()
        txt = data.decode('utf-8')
        c1 = [(i,c,hex(ord(c))) for i,c in enumerate(txt) if '\x80' <= c <= '\x9f']
        if c1:
            rel = os.path.relpath(fp, base)
            print(f'\n=== {rel} ({len(c1)} C1 chars) ===')
            for pos, ch, code in c1[:20]:
                start = max(0, pos-30)
                end = min(len(txt), pos+30)
                ctx = txt[start:end]
                print(f'  pos {pos}: U+{code[2:].upper().zfill(4)} -> {repr(ctx)}')
            # Also show raw bytes around first C1 char
            if c1:
                pos = c1[0][0]
                raw_start = max(0, pos-10)
                raw_end = min(len(data), pos+10)
                raw_bytes = data[raw_start:raw_end]
                print(f'  raw bytes around pos {pos}: {raw_bytes.hex(" ")}')
