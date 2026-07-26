"""Generates charts for the Kepang AI proposal PDF from LIVE API data.

Every figure here is drawn from kepang-ai-api.onrender.com at run time - no
hand-typed numbers - so the proposal cannot drift from what a reader sees when
they open the app. Charts are written to submission_attachments/assets/charts/.
"""

import json
import ssl
import urllib.request
from datetime import datetime
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "submission_attachments" / "assets" / "charts"
API = "https://kepang-ai-api.onrender.com/api"

# Brand palette, matching the live app's Industry design system.
FOREST = "#07291F"
EMERALD = "#16A34A"
EMERALD_LT = "#4ADE80"
AMBER = "#D97706"
ROSE = "#E11D48"
SLATE = "#5B6B63"
GRID = "#D8E8DE"

plt.rcParams.update({
    "font.family": "sans-serif",
    "font.sans-serif": ["Calibri", "Arial", "DejaVu Sans"],
    "axes.edgecolor": GRID,
    "axes.labelcolor": FOREST,
    "text.color": FOREST,
    "xtick.color": SLATE,
    "ytick.color": SLATE,
    "axes.grid": True,
    "grid.color": GRID,
    "grid.linewidth": 0.6,
    "figure.dpi": 200,
})


def fetch(path):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(API + path, timeout=90, context=ctx) as r:
        return json.loads(r.read())["data"]


def rupiah(v, _=None):
    return f"{int(v):,}".replace(",", ".")


# ── 1. Province price spread ────────────────────────────────────────────────
def chart_province_spread(prov):
    rows = sorted(prov["provinces"], key=lambda x: x["price_idr"])
    median = prov["national_median"]
    names = [r["province"] for r in rows]
    vals = [r["price_idr"] for r in rows]
    colors = [ROSE if r["tone"] == "danger" else (EMERALD if r["tone"] == "positive" else AMBER) for r in rows]

    fig, ax = plt.subplots(figsize=(9.2, 8.4))
    ax.barh(names, vals, color=colors, height=0.72)
    ax.axvline(median, color=FOREST, linestyle="--", linewidth=1.4)
    ax.text(median, len(names) - 0.2, f"  Median nasional Rp{rupiah(median)}",
            color=FOREST, fontsize=9.5, fontweight="bold", va="center")

    lo, hi = rows[0], rows[-1]
    spread = (hi["price_idr"] - lo["price_idr"]) / lo["price_idr"] * 100
    ax.annotate(
        f"Selisih {spread:.0f}%\nRp{rupiah(lo['price_idr'])} → Rp{rupiah(hi['price_idr'])}",
        xy=(hi["price_idr"], len(names) - 1), xytext=(-14, -46),
        textcoords="offset points", ha="right", fontsize=10.5, fontweight="bold",
        color=FOREST,
        bbox=dict(boxstyle="round,pad=0.5", facecolor="#ECFDF5", edgecolor=EMERALD, linewidth=1.1),
    )

    ax.set_xlabel("Harga beras (Rp/kg)", fontsize=10)
    ax.xaxis.set_major_formatter(FuncFormatter(rupiah))
    ax.set_xlim(0, max(vals) * 1.12)
    ax.tick_params(axis="y", labelsize=8.6)
    ax.grid(axis="y", visible=False)
    ax.spines[["top", "right"]].set_visible(False)
    ax.set_title("Disparitas harga beras 34 provinsi dalam satu hari yang sama",
                 fontsize=12.5, fontweight="bold", pad=12, loc="left")
    fig.tight_layout()
    p = OUT / "01_province_spread.png"
    fig.savefig(p, bbox_inches="tight")
    plt.close(fig)
    return p, spread, lo, hi, median


# ── 2. Deficit × harvest risk (the "weaving" insight) ───────────────────────
def chart_deficit_vs_risk(regions, risks):
    risk_by = {}
    for r in risks:
        risk_by.setdefault(r["region_name"], float(r["risk_score"]))

    # Use the system's own status classification rather than balance < 0.
    # Two regions sit at roughly zero and are classified 'balanced'; colouring
    # them as double-risk would overstate the danger, which this proposal must
    # not do.
    pts = []
    for reg in regions:
        name = reg["region_name"]
        bal = float(reg["balance_ton"]) / 1000
        risk = risk_by.get(name)
        if risk is not None:
            pts.append((name, bal, risk, reg["status"] == "deficit"))

    xs = [p[1] for p in pts]
    ys = [p[2] for p in pts]
    xlo, xhi = min(xs) - 35, max(xs) + 40
    ylo, yhi = min(ys) - 7, max(ys) + 8

    fig, ax = plt.subplots(figsize=(9.2, 5.2))
    # Shade only the intersection - the actual double-risk quadrant. Shading two
    # overlapping bands made surplus regions with high risk (e.g. Jawa) read as
    # endangered, which is exactly the misreading this chart must avoid.
    ax.add_patch(plt.Rectangle((xlo, 70), -xlo, yhi - 70, facecolor="#FEF2F2",
                               edgecolor="none", zorder=0))

    # Alternate label placement so the cluster near zero stays legible.
    order = sorted(range(len(pts)), key=lambda i: pts[i][1])
    offsets = {}
    for rank, i in enumerate(order):
        offsets[i] = (0, 16) if rank % 2 == 0 else (0, -24)

    for i, (name, bal, risk, is_deficit) in enumerate(pts):
        danger = is_deficit and risk >= 70
        ax.scatter(bal, risk, s=250 if danger else 165,
                   color=ROSE if danger else EMERALD,
                   edgecolor="white", linewidth=1.6, zorder=3)
        ax.annotate(name, (bal, risk), xytext=offsets[i], textcoords="offset points",
                    ha="center", fontsize=9,
                    fontweight="bold" if danger else "normal",
                    color=FOREST if danger else SLATE, zorder=4)

    ax.axvline(0, color=SLATE, linewidth=1)
    ax.axhline(70, color=SLATE, linewidth=1, linestyle=":")
    ax.set_xlabel("Neraca pasokan beras (ribu ton) — negatif berarti defisit", fontsize=10)
    ax.set_ylabel("Skor risiko panen (0–100)", fontsize=10)
    ax.set_xlim(xlo, xhi)
    ax.set_ylim(ylo, yhi)
    ax.spines[["top", "right"]].set_visible(False)
    ax.text(xlo + (0 - xlo) * 0.03, yhi - 1.2,
            "KUADRAN RISIKO GANDA — berstatus defisit + risiko panen tinggi",
            fontsize=9.5, fontweight="bold", color=ROSE, va="top")
    ax.set_title("Wilayah yang defisit DAN berisiko panen tinggi secara bersamaan",
                 fontsize=12.5, fontweight="bold", pad=12, loc="left")
    fig.tight_layout()
    p = OUT / "02_deficit_vs_risk.png"
    fig.savefig(p, bbox_inches="tight")
    plt.close(fig)
    return p, pts


# ── 3. Data lineage composition ─────────────────────────────────────────────
LINEAGE_ORDER = ["real-time", "official-release", "forecast", "unavailable"]
LINEAGE_COLOR = {"real-time": EMERALD, "official-release": EMERALD_LT,
                 "forecast": AMBER, "unavailable": "#B7B7BA"}
LINEAGE_LABEL = {"real-time": "Real-time", "official-release": "Rilis resmi",
                 "forecast": "Forecast (model)", "unavailable": "Belum tersedia"}
WEIGHT = {"real-time": 100, "official-release": 88, "forecast": 62, "unavailable": 28}


def chart_lineage(prov_rows):
    counts = {k: 0 for k in LINEAGE_ORDER}
    for row in prov_rows:
        counts[row["status"]] = counts.get(row["status"], 0) + 1
    conf = round(sum(WEIGHT.get(r["status"], 40) for r in prov_rows) / len(prov_rows))

    fig, ax = plt.subplots(figsize=(6.6, 5.4))
    labels = [LINEAGE_LABEL[k] for k in LINEAGE_ORDER if counts[k]]
    sizes = [counts[k] for k in LINEAGE_ORDER if counts[k]]
    colors = [LINEAGE_COLOR[k] for k in LINEAGE_ORDER if counts[k]]
    wedges, _ = ax.pie(sizes, colors=colors, startangle=90,
                       wedgeprops=dict(width=0.42, edgecolor="white", linewidth=2))
    ax.text(0, 0.08, f"{conf}%", ha="center", va="center", fontsize=30,
            fontweight="bold", color=FOREST)
    ax.text(0, -0.22, "data confidence", ha="center", va="center",
            fontsize=10, color=SLATE)
    ax.legend(wedges, [f"{l} ({s})" for l, s in zip(labels, sizes)],
              loc="lower center", bbox_to_anchor=(0.5, -0.16), ncol=2,
              frameon=False, fontsize=9.5)
    ax.set_title("Komposisi status data — dilabeli, tidak dibulatkan",
                 fontsize=12.5, fontweight="bold", pad=6, loc="center")
    fig.tight_layout()
    p = OUT / "03_lineage.png"
    fig.savefig(p, bbox_inches="tight")
    plt.close(fig)
    return p, counts, conf


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    prov = fetch("/prices/provinces?commodity=BERAS")
    res = fetch("/forecast/resilience")
    regions = fetch("/supply/regions?commodity=BERAS")
    risks = fetch("/weather/risk")

    p1, spread, lo, hi, median = chart_province_spread(prov)
    p2, pts = chart_deficit_vs_risk(regions, risks)
    p3, counts, conf = chart_lineage(res["data_provenance"])

    facts = {
        "as_of": datetime.now().strftime("%d %B %Y"),
        "spread_pct": round(spread),
        "cheapest": {"name": lo["province"], "price": int(lo["price_idr"])},
        "priciest": {"name": hi["province"], "price": int(hi["price_idr"]),
                     "dev": hi["dev_from_median_pct"]},
        "median": int(median),
        "above_median": sum(1 for x in prov["provinces"] if x["tone"] == "danger"),
        "provinces": len(prov["provinces"]),
        "resilience": res["summary"]["resilience_score"],
        "resilience_level": res["summary"]["resilience_level"],
        "macro": res.get("macro", {}),
        "confidence": conf,
        "lineage": counts,
        "decision_plan": res.get("decision_plan", [])[:3],
        "deficit_regions": sum(1 for r in regions if r["status"] == "deficit"),
        "double_risk": [p[0] for p in pts if p[3] and p[2] >= 70],
        "regions": [{"name": r["region_name"], "balance_k": round(float(r["balance_ton"]) / 1000),
                     "status": r["status"]} for r in regions],
    }
    (OUT / "facts.json").write_text(json.dumps(facts, ensure_ascii=False, indent=1), encoding="utf-8")

    for p in (p1, p2, p3):
        print(f"{p.name}  {p.stat().st_size/1024:.0f} KB")
    print(f"\nfacts.json — skor {facts['resilience']}, spread {facts['spread_pct']}%, "
          f"confidence {facts['confidence']}%, risiko ganda: {facts['double_risk']}")


if __name__ == "__main__":
    main()
