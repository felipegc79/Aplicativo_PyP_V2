import os, re, sys

base = r'D:\Proyecto PyP Colsanitas react V2\src'

# All double-encoded patterns (cp1252 -> UTF-8 mojibake)
replacements = {}

# Level 1: direct Latin-1 double encoding
for orig, fixed in [
    (b'\xc3\x83\xc2\xa1', b'\xc3\xa1'),  # á
    (b'\xc3\x83\xc2\xa9', b'\xc3\xa9'),  # é
    (b'\xc3\x83\xc2\xad', b'\xc3\xad'),  # í
    (b'\xc3\x83\xc2\xb1', b'\xc3\xb1'),  # ñ
    (b'\xc3\x83\xc2\xb3', b'\xc3\xb3'),  # ó
    (b'\xc3\x83\xc2\xba', b'\xc3\xba'),  # ú
    (b'\xc3\x83\xc2\xbc', b'\xc3\xbc'),  # ü
    (b'\xc3\x83\xc2\x81', b'\xc3\x81'),  # Á
    (b'\xc3\x83\xc2\x89', b'\xc3\x89'),  # É
    (b'\xc3\x83\xc2\x8d', b'\xc3\x8d'),  # Í
    (b'\xc3\x83\xc2\x93', b'\xc3\x93'),  # Ó
    (b'\xc3\x83\xc2\x9a', b'\xc3\x9a'),  # Ú
    (b'\xc3\x83\xc2\x91', b'\xc3\x91'),  # Ñ
    (b'\xc3\x83\xc2\x9c', b'\xc3\x9c'),  # Ü
]:
    replacements[orig] = fixed

# Level 2: WS1252-specific double encodings (where second byte > 0x7F)
for orig, fixed in [
    (b'\xc3\x83\xe2\x80\x9c', b'\xc3\x93'),  # Ó
    (b'\xc3\x83\xe2\x80\x98', b'\xc3\x91'),  # Ñ
    (b'\xc3\x83\xe2\x80\xb0', b'\xc3\x89'),  # É
    (b'\xc3\x83\xe2\x80\xa1', b'\xc3\x81'),  # Á
    (b'\xc3\x83\xe2\x80\xba', b'\xc3\x9a'),  # Ú
    (b'\xc3\x83\xe2\x80\x9e', b'\xc3\x9c'),  # Ü
    (b'\xc3\x83\xe2\x80\xb9', b'\xc3\x8b'),  # Ë
    (b'\xc3\x83\xe2\x80\x93', b'\xc3\x96'),  # Ö
]:
    replacements[orig] = fixed

# Level 3: Emoji/unicode encoded through WS1252
for orig, fixed in [
    (b'\xc3\xb0\xc5\xb8\xe2\x80\x9c\xe2\x80\xa6', b'\xf0\x9f\x93\x85'),  # 📅
    (b'\xc3\xb0\xc5\xb8\xe2\x80\x9c\xe2\x80\xb9', b'\xf0\x9f\x93\x8b'),  # 📋
    (b'\xc3\xb0\xc5\xb8\xe2\x80\xa2\xe2\x80\x99', b'\xf0\x9f\x92\x99'),  # 💙
    (b'\xc3\xb0\xc5\xb8\xc5\xa1\xc2\xaa', b'\xf0\x9f\x9a\xaa'),  # 🚪
    (b'\xc3\xa2\xe2\x80\xa0\xe2\x80\x99', b'\xe2\x86\x92'),  # →
    (b'\xc3\xa2\xc5\xa1\xc2\xa0', b'\xe2\x9a\xa0'),  # ⚠
    (b'\xc3\xa2\xc5\x93\xe2\x80\x9c', b'\xe2\x9c\x85'),  # ✅
]:
    replacements[orig] = fixed

# Handle remaining C1 mojibake: individual byte double-encoded as UTF-8
# This handles patterns like \xc3\x83\xe2\x80\x9c where \xc3\x83 is Ã (UTF8 of 0xC3) 
# and \xe2\x80\x9c is " (U+201C, WP1252 of 0x93) -> should combine to Ó (0xC3 0x93)

# Polish / special chars
for orig, fixed in [
    (b'\xc5\x82', b'\xc5\x81'),  # Ł -> Ł (Polish)
]:
    replacements[orig] = fixed

total_fixes = 0
for root, dirs, files in os.walk(base):
    for f in files:
        if not f.endswith(('.jsx','.js','.json','.css','.html')):
            continue
        fp = os.path.join(root, f)
        with open(fp, 'rb') as fh:
            data = fh.read()
        changed = False
        for orig, fixed in replacements.items():
            if orig in data:
                data = data.replace(orig, fixed)
                changed = True
        if changed:
            with open(fp, 'wb') as fh:
                fh.write(data)
            txt = data.decode('utf-8')
            c1 = sum(1 for c in txt if '\x80' <= c <= '\x9f')
            rel = os.path.relpath(fp, base)
            print(f'FIXED {rel}: {c1} C1 chars remain')
            total_fixes += 1

print(f'\nTotal files fixed: {total_fixes}')
