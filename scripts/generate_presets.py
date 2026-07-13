# -*- coding: utf-8 -*-
"""자소서랩 기업 프리셋 페이지 생성기.

data/presets.json → presets/index.html + presets/<id>/index.html + sitemap.xml
실행: python scripts/generate_presets.py
"""
from __future__ import annotations

import json
import os
import shutil

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
SITE_URL = "https://maestro24.github.io/jasolab"
OG_IMAGE = "https://maestro24.github.io/jasolab/assets/og-image.png"

FAVICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='%23A78BFA'/><stop offset='1' stop-color='%236D3EE0'/></linearGradient></defs><rect width='100' height='100' rx='18' fill='url(%23g)'/><rect x='24' y='20' width='52' height='60' rx='8' fill='white' opacity='.95'/><rect x='32' y='32' width='36' height='5' rx='2.5' fill='%23A78BFA'/><rect x='32' y='44' width='36' height='5' rx='2.5' fill='%23d5c8f7'/><rect x='32' y='56' width='24' height='5' rx='2.5' fill='%23d5c8f7'/></svg>"

GTAG = """<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-2P73L29BH7"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-2P73L29BH7');
</script>"""

PROMO = """<aside class="promo" data-coupang>
  <div class="coupang-wrap">
    <a href="https://link.coupang.com/a/flCfhuxEJM" target="_blank" rel="sponsored noopener" referrerpolicy="unsafe-url"><img src="https://ads-partners.coupang.com/banners/1006097?trackingCode=AF8748009&subId=&traceId=V0-301-879dd1202e5c73b2-I1006097&w=728&h=90" alt="쿠팡 파트너스 배너" style="max-width:100%;height:auto" loading="lazy"></a>
  </div>
  <p class="promo-disclosure">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
</aside>
<script>
  setTimeout(function () {
    document.querySelectorAll('[data-coupang]').forEach(function (el) {
      var f = el.querySelector('iframe');
      var m = el.querySelector('img');
      var ok = (f && f.getBoundingClientRect().height >= 10) || (m && m.complete && m.naturalWidth > 0);
      if (!ok) el.hidden = true;
    });
  }, 4000);
</script>"""

RAILS = """<div class="side-rail side-l" data-coupang>
  <script src="https://ads-partners.coupang.com/g.js"></script>
  <script>new PartnersCoupang.G({ id: 1006093, template: "carousel", trackingCode: "AF8748009", width: "160", height: "600", tsource: "" });</script>
</div>
<div class="side-rail side-r" data-coupang>
  <script>new PartnersCoupang.G({ id: 1006093, template: "carousel", trackingCode: "AF8748009", width: "160", height: "600", tsource: "" });</script>
</div>"""

UNIT_KO = {"chars_with_space": "자 (공백 포함)", "chars_no_space": "자 (공백 제외)", "bytes": "바이트"}


def shell(*, title, desc, canonical, depth, body, jsonld=None):
    p = "../" * depth
    ld = f'<script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False)}</script>' if jsonld else ""
    return f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
{GTAG}
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content="{desc}" />
<link rel="canonical" href="{canonical}" />
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{desc}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="{canonical}" />
<meta property="og:locale" content="ko_KR" />
<meta property="og:image" content="{OG_IMAGE}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{title}" />
<meta name="twitter:description" content="{desc}" />
<meta name="twitter:image" content="{OG_IMAGE}" />
<meta name="theme-color" content="#f8f7fc" />
<link rel="icon" href="{FAVICON}" />
{ld}
<link rel="stylesheet" href="{p}css/style.css" />
</head>
<body>
<div id="app">
<header class="header">
  <a class="brand" href="{p}index.html">📝 자소서랩</a>
  <nav class="nav">
    <a href="{p}index.html">문항 관리</a>
    <a href="{p}count.html">글자수 세기</a>
    <a href="{p}presets/index.html">기업 프리셋</a>
    <a href="{p}guide.html">가이드</a>
  </nav>
</header>
<main class="main">
{body}
</main>
{PROMO}
<footer class="footer">
  <span>프리셋은 공개 채용공고 기반 참고 정보입니다. 실제 공고를 반드시 확인하세요.</span>
  <a href="{p}index.html">문항 관리</a>
  <a href="{p}guide.html">가이드</a>
</footer>
</div>
{RAILS}
</body>
</html>"""


def main():
    with open(os.path.join(ROOT, "data", "presets.json"), encoding="utf-8") as f:
        data = json.load(f)
    companies = data["companies"]
    shutil.rmtree(os.path.join(ROOT, "presets"), ignore_errors=True)
    pages = {}

    # 목록 페이지
    rows = "".join(
        f'<tr><td><a href="{c["id"]}/index.html">{c["name"]}</a></td>'
        f'<td>{len(c["questions"])}문항</td>'
        f'<td>{" · ".join(f"{q["limit"]}{("byte" if q["unit"] == "bytes" else "자")}" for q in c["questions"][:4])}</td>'
        f'<td>{c.get("year", "")}</td></tr>'
        for c in companies
    )
    body = f"""<div>
  <h1 class="page-title">기업별 자소서 글자수 프리셋</h1>
  <p class="page-desc">주요 기업 {len(companies)}곳의 문항 수·글자수 제한. 공개 채용공고 기반 참고 정보 — 실제 공고를 꼭 확인하세요.</p>
</div>
<div class="card">
  <table class="tbl"><thead><tr><th>기업</th><th>문항</th><th>글자수 제한</th><th>기준연도</th></tr></thead><tbody>{rows}</tbody></table>
</div>
<div class="card">
  <p style="font-size:0.9rem">프리셋을 문항에 바로 적용하려면 → <a href="../index.html"><b>문항 관리 작업대</b></a></p>
</div>"""
    pages["presets/index.html"] = shell(
        title=f"기업별 자소서 글자수 제한 모음 ({len(companies)}개사) | 자소서랩",
        desc=f"삼성·현대차·LG·SK·은행권 등 주요 기업 {len(companies)}곳의 자소서 문항 수와 글자수 제한을 정리. 공개 채용공고 기반, 문항 관리 도구에서 바로 적용 가능.",
        canonical=f"{SITE_URL}/presets/", depth=1, body=body,
    )

    # 기업별 페이지
    for c in companies:
        qrows = "".join(
            f'<tr><td>{q["type"]}</td><td>{q["limit"]:,}{UNIT_KO.get(q["unit"], q["unit"])}</td></tr>'
            for q in c["questions"]
        )
        notes = c.get("notes", "")
        faq = {
            "@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": [{
                "@type": "Question",
                "name": f"{c['name']} 자소서는 몇 자인가요?",
                "acceptedAnswer": {"@type": "Answer", "text": f"{c.get('year', '')}년 공고 기준 {c['name']} 자기소개서는 {len(c['questions'])}개 문항이며, " + ", ".join(f"{q['type']} {q['limit']:,}{('바이트' if q['unit'] == 'bytes' else '자')}" for q in c["questions"]) + " 제한입니다. 채용 시기마다 바뀔 수 있으니 실제 공고를 확인하세요."},
            }],
        }
        body = f"""<nav class="crumb"><a href="../../index.html">자소서랩</a> › <a href="../index.html">기업 프리셋</a> › {c['name']}</nav>
<div>
  <h1 class="page-title">{c['name']} 자소서 글자수 ({c.get('year', '')}년 기준)</h1>
  <p class="page-desc">{notes if notes else '공개 채용공고 기반 참고 정보입니다.'}</p>
</div>
<div class="card">
  <table class="tbl"><thead><tr><th>문항 유형</th><th>제한</th></tr></thead><tbody>{qrows}</tbody></table>
</div>
<div class="card">
  <div class="rel-grid">
    <a class="rel-link" href="../../index.html">이 프리셋으로 작성 시작 →</a>
    <a class="rel-link" href="../../count.html">글자수 세기</a>
    <a class="rel-link" href="../index.html">다른 기업 보기</a>
  </div>
</div>"""
        pages[f"presets/{c['id']}/index.html"] = shell(
            title=f"{c['name']} 자소서 글자수·문항 수 ({c.get('year', '')}) | 자소서랩",
            desc=f"{c['name']} 자기소개서 문항 {len(c['questions'])}개의 글자수 제한 정리. 문항 관리 도구에서 프리셋으로 바로 적용하세요.",
            canonical=f"{SITE_URL}/presets/{c['id']}/", depth=2, body=body, jsonld=faq,
        )

    for path, html in pages.items():
        full = os.path.join(ROOT, path.replace("/", os.sep))
        os.makedirs(os.path.dirname(full), exist_ok=True)
        with open(full, "w", encoding="utf-8") as f:
            f.write(html)

    # sitemap (고정 페이지 + 프리셋)
    urls = [f"{SITE_URL}/", f"{SITE_URL}/count.html", f"{SITE_URL}/guide.html"]
    urls += [SITE_URL + "/" + p.replace("index.html", "") for p in sorted(pages)]
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + "\n".join(f"<url><loc>{u}</loc></url>" for u in urls) + "\n</urlset>\n")
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"[presets] 페이지 {len(pages)}개 + sitemap {len(urls)} URL")


if __name__ == "__main__":
    main()
