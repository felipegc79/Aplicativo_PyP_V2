import os, re

base = r'D:\Proyecto PyP Colsanitas react V2\src'

# Additional emoji corruptions found
extra_fixes = {
    b'\xc3\xb0\xc5\xb8\xe2\x80\x9c\xc2\x8d': b'\xf0\x9f\x93\x8d',  # 📍 pushpin
}

for root, dirs, files in os.walk(base):
    for f in files:
        if not f.endswith(('.jsx','.js','.json','.css','.html')):
            continue
        fp = os.path.join(root, f)
        with open(fp, 'rb') as fh:
            data = fh.read()
        
        changed = False
        for orig, fixed in extra_fixes.items():
            if orig in data:
                data = data.replace(orig, fixed)
                changed = True
        
        # Also try: any remaining C1 in the text can be decoded via CP1252 roundtrip
        # Find clusters of corruption
        txt = data.decode('utf-8')
        has_c1 = any('\x80' <= c <= '\x9f' for c in txt)
        
        if changed or has_c1:
            if changed:
                with open(fp, 'wb') as fh:
                    fh.write(data)
                txt = data.decode('utf-8')
            
            c1 = [(i,c) for i,c in enumerate(txt) if '\x80' <= c <= '\x9f']
            rel = os.path.relpath(fp, base)
            if c1:
                print(f'{rel}: {len(c1)} C1 chars remain')
                for pos, ch in c1[:5]:
                    ctx = txt[max(0,pos-20):pos+20]
                    print(f'  U+{ord(ch):04X} -> {repr(ctx)}')
            else:
                print(f'{rel}: CLEAN after extra fixes')
