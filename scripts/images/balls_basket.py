import math, sys
W, H, R = 1920, 700, 88
DY = 190
OUT = '#1a1a1a'

def ball(cx, cy, rot, cid):
    p = []
    pent = ' '.join(f'{cx + 0.34*R*math.cos(math.radians(rot + 72*i)):.1f},{cy + 0.34*R*math.sin(math.radians(rot + 72*i)):.1f}' for i in range(5))
    p.append(f'<clipPath id="c{cid}"><circle cx="{cx}" cy="{cy}" r="{R}"/></clipPath>')
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="#fff"/>')
    p.append(f'<g clip-path="url(#c{cid})">')
    p.append(f'<polygon points="{pent}" fill="{OUT}"/>')
    for i in range(5):
        a = rot + 72*i
        def pt(r, da=0):
            return cx + r*R*math.cos(math.radians(a+da)), cy + r*R*math.sin(math.radians(a+da))
        x1, y1 = pt(0.34); x2, y2 = pt(0.80)
        p.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{OUT}" stroke-width="6"/>')
        patch = [pt(0.80), pt(0.96, 16), pt(1.3, 16), pt(1.3, -16), pt(0.96, -16)]
        p.append('<polygon points="' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in patch) + f'" fill="{OUT}"/>')
    p.append('</g>')
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="{OUT}" stroke-width="9"/>')
    return '\n'.join(p)

def shadow(cx, cy):
    return f'<ellipse cx="{cx}" cy="{cy + R - 4}" rx="{R*0.95}" ry="16" fill="#3f9a3a"/>'

s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">']
s.append(f'<defs><clipPath id="frame"><rect width="{W}" height="{H}" rx="40"/></clipPath></defs><g clip-path="url(#frame)">')
s.append(f'<rect width="{W}" height="{H}" fill="#cfeaff"/>')
# sun and clouds
s.append('<circle cx="1800" cy="62" r="40" fill="#ffd84a" stroke="#1a1a1a" stroke-width="7"/>')
for cx, cy in [(1000, 62), (1420, 50)]:
    s.append(f'<path d="M{cx-80} {cy+22} a26 26 0 0 1 14 -46 a40 40 0 0 1 72 -8 a32 32 0 0 1 56 20 a20 20 0 0 1 -6 34 Z" fill="#fff" stroke="{OUT}" stroke-width="6" stroke-linejoin="round"/>')
# lawn
s.append(f'<path d="M0 150 Q 960 100 {W} 150 L {W} {H} L 0 {H} Z" fill="#5cc452" stroke="{OUT}" stroke-width="7"/>')
for x, y in [(760, 280), (1010, 610), (1560, 240), (1840, 370), (60, 570), (430, 640), (1180, 250), (1650, 630)]:
    s.append(f'<path d="M{x} {y} l8 -26 l8 26 l8 -30 l8 30" fill="none" stroke="#2f8a2b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>')

# basket (a gym ball cart): 3 balls inside
bx0, bx1, by0, by1 = 90, 700, 200, 430
cyb = by1 - R - 12
inside = [(205, cyb, 10), (395, cyb, 40), (585, cyb, -20)]
# cart shadow, legs, wheels
s.append(f'<ellipse cx="{(bx0+bx1)/2}" cy="560" rx="330" ry="22" fill="#3f9a3a"/>')
for x in (bx0 + 50, bx1 - 50):
    s.append(f'<line x1="{x}" y1="{by1}" x2="{x}" y2="520" stroke="{OUT}" stroke-width="12"/>')
    s.append(f'<circle cx="{x}" cy="533" r="26" fill="#666" stroke="{OUT}" stroke-width="8"/>')
# back of the basket (light fill so it reads as a container)
s.append(f'<rect x="{bx0}" y="{by0}" width="{bx1-bx0}" height="{by1-by0}" rx="14" fill="#ffffff" fill-opacity="0.3"/>')
for i, (x, y, r) in enumerate(inside):
    s.append(ball(x, y, r, f'i{i}'))
# wires over the balls
n = 10
for i in range(1, n):
    x = bx0 + (bx1 - bx0) * i / n
    s.append(f'<line x1="{x:.1f}" y1="{by0}" x2="{x:.1f}" y2="{by1}" stroke="#4a5560" stroke-width="5"/>')
for y in (by0 + 80, by0 + 160):
    s.append(f'<line x1="{bx0}" y1="{y}" x2="{bx1}" y2="{y}" stroke="#4a5560" stroke-width="5"/>')
s.append(f'<rect x="{bx0}" y="{by0}" width="{bx1-bx0}" height="{by1-by0}" rx="14" fill="none" stroke="{OUT}" stroke-width="13"/>')

# 6 balls on the grass
ground = [(900, 370, 0), (1250, 345, 30), (1600, 375, -15), (1060, 555, 50), (1420, 570, 15), (1770, 545, -40)]
for x, y, r in ground:
    s.append(shadow(x, y))
for i, (x, y, r) in enumerate(ground):
    s.append(ball(x, y, r, f'g{i}'))
s.append('</g></svg>')
open(sys.argv[1], 'w').write('\n'.join(s))
