import json
import re

html_path = r'C:\Users\Dell\.gemini\antigravity\scratch\mvab_v21_web\index.html'
json_path = r'C:\Users\Dell\.gemini\antigravity\brain\b06119a5-bc45-4e2a-a63d-5a4cd3ef5791\items_extracted.json'

with open(json_path, 'r', encoding='utf-8') as f:
    items = json.load(f)

for idx, item in enumerate(items):
    item['stt'] = idx + 1
    # add maxScore for JS reverse scoring logic
    item['maxScore'] = 5

js_array = json.dumps(items, ensure_ascii=False, indent=2)

with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Replace const ITEMS_DATA = [ ... ];
# Using regex dotall
pattern = re.compile(r'const ITEMS_DATA = \[.*?\];', re.DOTALL)
new_html = pattern.sub(f'const ITEMS_DATA = {js_array};', html_content)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_html)

print('Updated index.html successfully')
