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
    svg = f"""<svg width="800" height="80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <text x="400" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="36" font-weight="900" fill="url(#grad)" text-anchor="middle" letter-spacing="3">{text}</text>
</svg>"""
    with open(f'/Users/abcom/.gemini/antigravity/scratch/aniketkrs/assets/{filename}.svg', 'w') as f:
        f.write(svg)

create_header("ABOUT ME", "header-about")
create_header("PRODUCT STACK", "header-stack")
create_header("GITHUB METRICS", "header-stats")

ts = datetime.now().timestamp()

readme_content = f"""<div align="center">
  <img src="assets/animated-header.svg?v={ts}" alt="Aniket Kumar" width="100%" />
</div>

<div align="center" style="margin-top: -30px; margin-bottom: 5px;">
  <img src="https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif" alt="Crazy Fast Typing Kermit" width="500" style="border-radius: 24px;" />
</div>

<div align="center">
  <img src="assets/header-about.svg?v={ts}" alt="About Me" width="100%" />
  <img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=500&size=20&pause=1500&color=f4f4f5&center=true&vCenter=true&multiline=true&width=800&height=220&lines=Product+Manager+transitioned+from+Designer.;I+love+building+features+and+making+user+experiences;seamless+and+good,+thinking+for+the+long+term.;I+love+to+play+and+experiment+with+new+tools+and+features.;Now+on+the+journey+of+building+AI+products;and+I+love+to+read+books+and+write+articles.&v={ts}" alt="Typing Intro" width="100%" />
</div>

<div align="center">
  <img src="assets/header-stack.svg?v={ts}" alt="Product Stack" width="100%" />
</div>

<div align="center">
  <img src="assets/animated-badges.svg?v={ts}" alt="Product Stack Badges" width="100%" />
</div>

<div align="center">
  <img src="assets/header-stats.svg?v={ts}" alt="GitHub Metrics" width="100%" />
</div>

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
