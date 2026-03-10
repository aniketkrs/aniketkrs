import urllib.request
import re
from datetime import datetime
import ssl
ssl._create_default_https_context = ssl._create_unverified_context

badges = [
    "https://img.shields.io/badge/Figma-000000?style=for-the-badge&logo=figma&logoColor=4f46e5",
    "https://img.shields.io/badge/Jira-000000?style=for-the-badge&logo=jira&logoColor=4f46e5",
    "https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=4f46e5",
    "https://img.shields.io/badge/Linear-000000?style=for-the-badge&logo=linear&logoColor=4f46e5",
    "https://img.shields.io/badge/Framer-000000?style=for-the-badge&logo=framer&logoColor=4f46e5",
    "https://img.shields.io/badge/Mixpanel-000000?style=for-the-badge&logo=mixpanel&logoColor=4f46e5",
    "https://img.shields.io/badge/Hotjar-000000?style=for-the-badge&logo=hotjar&logoColor=4f46e5",
    "https://img.shields.io/badge/GA4-000000?style=for-the-badge&logo=googleanalytics&logoColor=4f46e5",
    "https://img.shields.io/badge/Claude-000000?style=for-the-badge&logo=anthropic&logoColor=4f46e5",
    "https://img.shields.io/badge/Antigravity_AI-000000?style=for-the-badge&logo=googlebard&logoColor=4f46e5"
]

svgs = []
for url in badges:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            svg_data = response.read().decode('utf-8')
            svg_data = re.sub(r'<\?xml.*?\?>', '', svg_data).strip()
            svgs.append(svg_data)
            print(f"Fetched {url.split('badge/')[1].split('-')[0]}")
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
import base64

# Build the linear row of badges
row_content = ""
x = 0
for i, svg in enumerate(svgs):
    match = re.search(r'<svg[^>]*width="(\d+(?:\.\d+)?)"', svg)
    width = float(match.group(1)) if match else 100
    
    inner = svg.replace('<svg', '<svg x="0" y="0"').replace('xmlns="http://www.w3.org/2000/svg"', '')
    
    # Extract base64 image and convert to nested SVG
    img_match = re.search(r'<image\s+x="(\d+)"\s+y="(\d+)"\s+width="(\d+)"\s+height="(\d+)"\s+href="data:image/svg\+xml;base64,([^"]+)"\s*/>', inner)
    if img_match:
        ix, iy, iw, ih, b64 = img_match.groups()
        try:
            decoded_svg = base64.b64decode(b64).decode('utf-8')
            # Extract just the inner path/shapes from the decoded SVG
            inner_content_match = re.search(r'<svg[^>]*>(.*)</svg>', decoded_svg, re.DOTALL)
            if inner_content_match:
                inner_content = inner_content_match.group(1)
                
                # We need to scale the inner content to fit the space
                scale_x = float(iw) / 24.0
                scale_y = float(ih) / 24.0
                scale = min(scale_x, scale_y)
                
                # Center it
                tx = float(ix) + (float(iw) - 24 * scale) / 2
                ty = float(iy) + (float(ih) - 24 * scale) / 2
                
                replacement = f'<g transform="translate({tx}, {ty}) scale({scale})">{inner_content}</g>'
                inner = inner[:img_match.start()] + replacement + inner[img_match.end():]
        except Exception as e:
            print(f"Failed to decode base64 for badge {i}: {e}")
            
    row_content += f'      <g transform="translate({x}, 0)">\n        {inner}\n      </g>\n'
    x += width + 15

total_width = x

# Create the master SVG with a wrapping marquee group
master_svg = f"""<svg width="800" height="50" xmlns="http://www.w3.org/2000/svg">
  <g>
    <animateTransform attributeName="transform" type="translate" from="0 0" to="-{total_width} 0" dur="25s" repeatCount="indefinite" />
    <g class="badge-row">
{row_content}
    </g>
    <g class="badge-row" transform="translate({total_width}, 0)">
{row_content}
    </g>
  </g>
</svg>"""

with open('/Users/abcom/.gemini/antigravity/scratch/aniketkrs/assets/animated-badges.svg', 'w') as f:
    f.write(master_svg)

def create_header(text, filename):
    # Dark mode — off-white on dark, no gradient
    svg_dark = f"""<svg width="800" height="72" xmlns="http://www.w3.org/2000/svg">
  <text x="400" y="48" font-family="'Space Mono', 'Courier New', Courier, monospace" font-size="30" font-weight="700" fill="#e2e8f0" text-anchor="middle" letter-spacing="3">{text}</text>
</svg>"""
    # Light mode — deep navy on white, no gradient
    svg_light = f"""<svg width="800" height="72" xmlns="http://www.w3.org/2000/svg">
  <text x="400" y="48" font-family="'Space Mono', 'Courier New', Courier, monospace" font-size="30" font-weight="700" fill="#0f172a" text-anchor="middle" letter-spacing="3">{text}</text>
</svg>"""
    with open(f'/Users/abcom/.gemini/antigravity/scratch/aniketkrs/assets/{filename}-dark.svg', 'w') as f:
        f.write(svg_dark)
    with open(f'/Users/abcom/.gemini/antigravity/scratch/aniketkrs/assets/{filename}-light.svg', 'w') as f:
        f.write(svg_light)

create_header("ABOUT ME", "header-about")
create_header("PRODUCT STACK", "header-stack")
create_header("GITHUB METRICS", "header-stats")

ts = datetime.now().timestamp()

readme_content = f"""<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)"  srcset="assets/animated-header-dark.svg?v={ts}">
  <source media="(prefers-color-scheme: light)" srcset="assets/animated-header-light.svg?v={ts}">
  <img alt="Aniket Kumar" src="assets/animated-header-dark.svg?v={ts}" width="100%" />
</picture>

<img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDNxazFhdTRsemwzbHkxdmtsaGE2MHloYWkydXh2ZHJtOWs3OHc3aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WWvEKfHYy5TGiJPS4L/giphy.gif" alt="Aniket Kumar" width="65%" style="border-radius: 16px;" />

</div>

---

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)"  srcset="assets/header-about-dark.svg?v={ts}">
  <source media="(prefers-color-scheme: light)" srcset="assets/header-about-light.svg?v={ts}">
  <img alt="About Me" src="assets/header-about-dark.svg?v={ts}" width="60%" />
</picture>

</div>

Product Manager transitioned from Designer. I love building features and making user experiences seamless and intentional — thinking for the long term. I enjoy experimenting with new tools and ideas, and I'm now deep into building AI-powered products. Outside work, I read books and write articles.

---

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)"  srcset="assets/header-stack-dark.svg?v={ts}">
  <source media="(prefers-color-scheme: light)" srcset="assets/header-stack-light.svg?v={ts}">
  <img alt="Product Stack" src="assets/header-stack-dark.svg?v={ts}" width="60%" />
</picture>

<img src="assets/animated-badges.svg?v={ts}" alt="Product Stack Badges" width="100%" />

</div>

---

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)"  srcset="assets/header-stats-dark.svg?v={ts}">
  <source media="(prefers-color-scheme: light)" srcset="assets/header-stats-light.svg?v={ts}">
  <img alt="GitHub Metrics" src="assets/header-stats-dark.svg?v={ts}" width="60%" />
</picture>

<a href="https://github.com/aniketkrs">
  <img src="https://github-readme-activity-graph.vercel.app/graph?username=aniketkrs&bg_color=0d1117&color=6366f1&line=a855f7&point=ffffff&area=true&hide_border=true&title_color=e0e7ff&radius=12&custom_title=Contribution+Graph" alt="Contribution Graph" width="100%" />
</a>

</div>

<table width="100%" style="border-collapse: collapse; border: none;">
  <tr>
    <td width="50%" align="center" style="border: none; padding: 4px;">
      <a href="https://github.com/aniketkrs">
        <img src="https://github-readme-stats-eight-theta.vercel.app/api/top-langs/?username=aniketkrs&layout=compact&show_icons=true&hide_border=true&bg_color=0d1117&title_color=6366f1&icon_color=a855f7&text_color=e0e7ff&border_radius=12&count_private=true" alt="Top Languages" width="100%" />
      </a>
    </td>
    <td width="50%" align="center" style="border: none; padding: 4px;">
      <a href="https://github.com/aniketkrs">
        <img src="https://github-readme-stats-eight-theta.vercel.app/api?username=aniketkrs&show_icons=true&hide_border=true&bg_color=0d1117&title_color=6366f1&icon_color=a855f7&text_color=e0e7ff&border_radius=12&count_private=true&include_all_commits=true" alt="GitHub Stats" width="100%" />
      </a>
    </td>
  </tr>
</table>

<div align="center">
  <a href="https://github.com/aniketkrs">
    <img src="https://streak-stats.demolab.com/?user=aniketkrs&hide_border=true&background=0d1117&ring=6366f1&fire=a855f7&currStreakNum=e0e7ff&sideNums=e0e7ff&currStreakLabel=a855f7&sideLabels=6366f1&dates=94a3b8&stroke=00000000&border_radius=12" alt="GitHub Streak" width="100%" />
  </a>
</div>

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=6366f1,a855f7&height=80&section=footer" width="100%" alt="Footer"/>
</div>
"""

with open("/Users/abcom/.gemini/antigravity/scratch/aniketkrs/README.md", "w") as f:
    f.write(readme_content)

print("Badges generated and layout applied successfully!")
