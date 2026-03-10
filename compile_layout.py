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

master_svg = """<svg width="800" height="130" xmlns="http://www.w3.org/2000/svg">
  <style>
    .badge { transition: all 0.3s ease; cursor: pointer; }
    .badge:hover { transform: translateY(-5px) scale(1.05); filter: drop-shadow(0 4px 8px rgba(79, 70, 229, 0.4)); }
    @keyframes float1 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    @keyframes float2 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    @keyframes float3 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    .b0 { animation: float1 3s ease-in-out infinite 0.1s; }
    .b1 { animation: float2 3.2s ease-in-out infinite 0.2s; }
    .b2 { animation: float3 2.8s ease-in-out infinite 0.3s; }
    .b3 { animation: float1 3.1s ease-in-out infinite 0.4s; }
    .b4 { animation: float2 2.9s ease-in-out infinite 0.5s; }
    .b5 { animation: float3 3s ease-in-out infinite 0.6s; }
    .b6 { animation: float1 3.3s ease-in-out infinite 0.7s; }
    .b7 { animation: float2 2.7s ease-in-out infinite 0.8s; }
    .b8 { animation: float3 3.1s ease-in-out infinite 0.9s; }
    .b9 { animation: float1 2.9s ease-in-out infinite 1.0s; }
  </style>
  <g transform="translate(10, 20)">
"""

x = 0
y = 0
for i, svg in enumerate(svgs):
    match = re.search(r'<svg[^>]*width="(\d+(?:\.\d+)?)"', svg)
    width = float(match.group(1)) if match else 100
    
    if x + width > 780:
        x = 0
        y += 50
        
    master_svg += f'    <g class="badge b{i}" transform="translate({x}, {y})">\n'
    inner = svg.replace('<svg', '<svg x="0" y="0"').replace('xmlns="http://www.w3.org/2000/svg"', '')
    
    # Extract base64 image and convert to nested SVG
    img_match = re.search(r'<image\s+x="(\d+)"\s+y="(\d+)"\s+width="(\d+)"\s+height="(\d+)"\s+href="data:image/svg\+xml;base64,([^"]+)"\s*/>', inner)
    if img_match:
        ix, iy, iw, ih, b64 = img_match.groups()
        try:
            decoded_svg = base64.b64decode(b64).decode('utf-8')
            # Extract just the inner parts of the decoded SVG, and add our own wrapper
            inner_content_match = re.search(r'<svg[^>]*>(.*)</svg>', decoded_svg, re.DOTALL)
            if inner_content_match:
                inner_content = inner_content_match.group(1)
                replacement = f'<svg x="{ix}" y="{iy}" width="{iw}" height="{ih}" viewBox="0 0 24 24">{inner_content}</svg>'
                inner = inner[:img_match.start()] + replacement + inner[img_match.end():]
        except Exception as e:
            print(f"Failed to decode base64 for badge {i}: {e}")
            
    master_svg += "      " + inner + "\n"
    master_svg += f'    </g>\n'
    x += width + 15

master_svg += """  </g>\n</svg>"""

with open('/Users/abcom/.gemini/antigravity/scratch/aniketkrs/assets/animated-badges.svg', 'w') as f:
    f.write(master_svg)

ts = datetime.now().timestamp()

readme_content = f"""<div align="center">
  <img src="assets/animated-header.svg?v={ts}" alt="Aniket Kumar" width="100%" />
</div>

<div align="center" style="margin-top: -30px; margin-bottom: 5px;">
  <img src="https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif" alt="Crazy Fast Typing Kermit" width="500" style="border-radius: 24px;" />
</div>

<div align="center">
  <h2 align="center">About Me</h2>
  <p align="center" style="max-width: 600px; line-height: 1.6;">
    Product Manager transitioned from Designer. I love building features and making user experiences seamless and good, thinking for the long term. I love to play and experiment with new tools and features. Now on the journey of building AI products, and I love to read books and write articles.
  </p>
</div>

<h2 align="center">Product Stack</h2>

<div align="center">
  <img src="assets/animated-badges.svg?v={ts}" alt="Product Stack Badges" width="100%" />
</div>

<h2 align="center">GitHub Activity &amp; Stats</h2>

<table width="100%" style="border-collapse: collapse; border: none;">
  <tr>
    <td width="50%" align="center" style="border: none;">
      <a href="https://github.com/aniketkrs">
        <img src="https://github-readme-activity-graph.vercel.app/graph?username=aniketkrs&bg_color=0a0a0a&color=4f46e5&line=4f46e5&point=ffffff&area=true&hide_border=false&title_color=4f46e5&radius=24&custom_title=Aniket%20Kumar%27s%20Contribution%20Graph&v={ts}" alt="Activity Graph" width="100%" />
      </a>
    </td>
    <td width="50%" align="center" style="border: none;">
      <a href="https://github.com/aniketkrs">
        <img src="https://github-readme-stats-eight-theta.vercel.app/api/top-langs/?username=aniketkrs&show_icons=true&hide_border=false&bg_color=0a0a0a&title_color=4f46e5&icon_color=4f46e5&text_color=ffffff&border_radius=24&custom_title=My%20Programming%20Languages&v={ts}" alt="Top Languages" width="100%" />
      </a>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center" style="border: none;">
      <a href="https://github.com/aniketkrs">
        <img src="https://github-readme-stats-eight-theta.vercel.app/api?username=aniketkrs&show_icons=true&hide_border=false&bg_color=0a0a0a&title_color=4f46e5&icon_color=4f46e5&text_color=ffffff&border_radius=24&custom_title=My%20GitHub%20Statistics&v={ts}" alt="GitHub Stats" width="100%" />
      </a>
    </td>
    <td width="50%" align="center" style="border: none;">
      <a href="https://github.com/aniketkrs">
        <img src="https://github-readme-streak-stats.herokuapp.com/?user=aniketkrs&hide_border=false&background=0a0a0a&ring=4f46e5&fire=4f46e5&currStreakNum=ffffff&sideNums=ffffff&currStreakLabel=ffffff&sideLabels=ffffff&dates=ffffff&stroke=00000000&border_radius=24&v={ts}" alt="GitHub Streak" width="100%" />
      </a>
    </td>
  </tr>
</table>

<div align="center" style="margin-top: -20px;">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=4F46E5&height=100&section=footer&v={ts}" width="100%"/>
</div>
"""

with open("/Users/abcom/.gemini/antigravity/scratch/aniketkrs/README.md", "w") as f:
    f.write(readme_content)

print("Badges generated and layout applied successfully!")
