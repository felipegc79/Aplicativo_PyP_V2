import os

base = r'D:\Proyecto PyP Colsanitas react V2\src'
all_clean = True

for root, dirs, files in os.walk(base):
    for f in files:
        if not f.endswith(('.jsx','.js','.json','.css','.html')):
            continue
        fp = os.path.join(root, f)
        with open(fp, 'rb') as fh:
            data = fh.read()
        txt = data.decode('utf-8')
        c1_count = sum(1 for c in txt if '\x80' <= c <= '\x9f')
        if c1_count:
            rel = os.path.relpath(fp, base)
            print(f'ISSUE: {rel} has {c1_count} C1 chars')
            all_clean = False
        
        # Also check for obvious mojibake strings like "Ã©" or "Ã³" etc.
        mojibake = re.findall(r'Ã[¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏ]', txt) if 're' in dir() else []
        # simpler: just look for Ã followed by a high byte
        import re
        mb = re.findall(b'\xc3[\x83\x82\xa0-\xbf]', data) if False else []
    
if all_clean:
    print('ALL FILES CLEAN - no C1 control characters found')
else:
    print('Some files still have issues')
