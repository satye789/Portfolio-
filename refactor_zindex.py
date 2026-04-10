import sys
import re

file_path = r"d:\AntiGravity\(2) portfoliio\style.css"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

replacements = {
    95: "var(--z-bg)",
    109: "var(--z-cursor)",
    124: "var(--z-cursor-trail)",
    156: "var(--z-nav)",
    209: "var(--z-wrapper)",
    552: "var(--z-content)",
    754: "var(--z-nav)",
    784: "var(--z-nav-toggle)",
    952: "var(--z-wrapper)",
    989: "var(--z-chatbot)",
    1008: "var(--z-chatbot-toggle)",
    1323: "var(--z-content)",
    1468: "var(--z-marquee)",
    1527: "var(--z-base)"
}

for line_num, new_val in replacements.items():
    idx = line_num - 1
    if idx < len(lines):
        lines[idx] = re.sub(r'z-index:\s*[^;]+;', f'z-index: {new_val};', lines[idx])

root_start = -1
root_end = -1
for i, line in enumerate(lines):
    if line.startswith(":root {"):
        root_start = i
    if root_start != -1 and line.startswith("}"):
        root_end = i
        break

if root_start != -1 and root_end != -1:
    new_root = [
        ":root {\n",
        "  --bg-color: #030305;\n",
        "  --text-main: #f9fafb;\n",
        "  --text-muted: #a1a1aa;\n",
        "  --accent-primary: #00ffd5;\n",
        "  --accent-secondary: #9d00ff;\n",
        "  --accent-tertiary: #00b3ff;\n",
        "  --glass-bg: rgba(255, 255, 255, 0.03);\n",
        "  --glass-border: rgba(255, 255, 255, 0.08);\n",
        "  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);\n",
        "  --nav-bg: rgba(3, 3, 5, 0.6);\n",
        "  --z-bg: -1;\n",
        "  --z-base: 0;\n",
        "  --z-content: 1;\n",
        "  --z-marquee: 5;\n",
        "  --z-wrapper: 10;\n",
        "  --z-nav: 100;\n",
        "  --z-nav-toggle: 101;\n",
        "  --z-chatbot: 1000;\n",
        "  --z-chatbot-toggle: 1001;\n",
        "  --z-cursor-trail: 9998;\n",
        "  --z-cursor: 9999;\n",
        "}\n"
    ]
    lines = lines[:root_start] + new_root + lines[root_end+1:]

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Update complete")