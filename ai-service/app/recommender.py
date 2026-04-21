"""
Personalized study / improvement plan generator.
Uses SHAP explanations + domain heuristics to build actionable,
prioritized improvement plans with React Flow graph data and weekly milestones.
"""
from typing import Dict, List
from .model import DISPLAY_NAMES, FEATURE_OPTIMAL, NUMERIC_FEATURES
from .explainer import SHAPExplainer


# ── Actionable strategies per feature ───────────────────────────────
STRATEGIES: Dict[str, Dict] = {
    "cgpa": {
        "category": "Academics",
        "title": "Improve Your CGPA",
        "advice": (
            "Focus on clearing upcoming exams with higher scores. "
            "Attend all lectures, revise weekly, use past papers for practice. "
            "Target an improvement of at least 0.5 in the next semester."
        ),
    },
    "backlogs": {
        "category": "Academics",
        "title": "Clear Active Backlogs",
        "advice": (
            "Prioritize clearing all backlogs before placement season. "
            "Dedicate 2+ hours daily to backlog subjects. "
            "Form study groups and seek faculty help for tough topics."
        ),
    },
    "internships": {
        "category": "Experience",
        "title": "Gain Internship Experience",
        "advice": (
            "Apply for internships on Internshala, LinkedIn, and company career pages. "
            "Even short 1-month internships add value. "
            "Target at least one relevant internship before final year."
        ),
    },
    "certifications": {
        "category": "Skills",
        "title": "Earn Industry Certifications",
        "advice": (
            "Complete certifications on Coursera, Udemy, or NPTEL. "
            "Focus on in-demand areas: cloud (AWS/Azure), data science, full-stack development. "
            "Add them to your LinkedIn profile and resume."
        ),
    },
    "coding_skills": {
        "category": "Technical",
        "title": "Sharpen Coding Skills",
        "advice": (
            "Practice daily on LeetCode, HackerRank, or CodeChef. "
            "Aim for 2-3 problems per day. Focus on arrays, strings, trees, DP. "
            "Participate in contests to build speed and accuracy."
        ),
    },
    "communication_skills": {
        "category": "Soft Skills",
        "title": "Improve Communication Skills",
        "advice": (
            "Join your college debate or speaking club. "
            "Practice mock interviews with peers. "
            "Read English newspapers daily and watch TED talks to improve vocabulary."
        ),
    },
    "aptitude_score": {
        "category": "Aptitude",
        "title": "Boost Aptitude Score",
        "advice": (
            "Practice quantitative aptitude, logical reasoning, and verbal ability daily. "
            "Use books like RS Aggarwal or apps like PrepInsta. "
            "Take timed mock tests weekly to improve speed."
        ),
    },
    "projects": {
        "category": "Projects",
        "title": "Build More Projects",
        "advice": (
            "Build 2-3 solid projects showcasing real-world problem solving. "
            "Host them on GitHub with proper documentation. "
            "Include at least one full-stack and one ML/data project."
        ),
    },
}


def generate_study_plan(features: dict, explainer: SHAPExplainer) -> dict:
    """
    Build a complete improvement plan from SHAP explanations.

    Returns:
      student_summary, probabilities, plan_items,
      flow_nodes/edges (for React Flow), weekly_milestones
    """
    explanation = explainer.explain(features)
    prob = explanation["placement_probability"]
    pkg = explanation["predicted_package"]
    risk = explanation["risk_level"]

    improvement_areas = _identify_improvements(features, explanation["explanations"])
    plan_items = _build_plan_items(features, improvement_areas)
    flow_nodes, flow_edges = _build_flow_graph(plan_items)
    milestones = _build_weekly_milestones(plan_items)
    summary = _build_summary(explanation)

    return {
        "student_summary": summary,
        "placement_probability": prob,
        "predicted_package": pkg,
        "risk_level": risk,
        "plan_items": plan_items,
        "flow_nodes": flow_nodes,
        "flow_edges": flow_edges,
        "weekly_milestones": milestones,
    }


# ── helpers ─────────────────────────────────────────────────────────

def _identify_improvements(features: dict, explanations: list) -> list:
    improvements = []
    for exp in explanations:
        fname = exp["feature"]
        if fname not in NUMERIC_FEATURES:
            continue  # can't change gender/degree/branch easily
        optimal = FEATURE_OPTIMAL.get(fname)
        if optimal is None:
            continue

        current = features.get(fname, 0)
        direction = optimal["direction"]

        # Skip features already at or beyond their optimal level —
        # no point suggesting improvement for backlogs=0 or coding=9.
        if direction == "higher" and current >= optimal["min"]:
            continue
        if direction == "lower" and current <= optimal["max"]:
            continue

        # Feature is genuinely below optimal — add as improvement area
        improvements.append({**exp, "optimal": optimal})

    return improvements


def _build_plan_items(features: dict, improvements: list) -> list:
    items = []
    for i, imp in enumerate(improvements[:8]):
        fname = imp["feature"]
        strat = STRATEGIES.get(fname, {})
        optimal = imp.get("optimal", {})

        if i < 2:
            priority, week = "high", 1
        elif i < 5:
            priority, week = "medium", 3
        else:
            priority, week = "low", 5

        current = features.get(fname, 0)
        target = optimal.get("min", current)
        if optimal.get("direction") == "lower":
            target = optimal.get("max", current)
        unit = optimal.get("unit", "")

        items.append({
            "id": f"item-{i+1}",
            "title": strat.get("title", f"Improve {imp['display_name']}"),
            "description": strat.get("advice", "Focus on improving this area."),
            "priority": priority,
            "category": strat.get("category", "General"),
            "current_value": f"{current}{unit}",
            "target_value": f"{target}{unit}",
            "estimated_impact": round(abs(imp["shap_value"]), 3),
            "timeline_week": week,
            "dependencies": _get_deps(fname),
        })
    return items


def _get_deps(feature: str) -> List[str]:
    deps = {
        "aptitude_score": ["coding_skills"],
        "projects": ["coding_skills", "internships"],
        "coding_skills": [],
        "internships": ["cgpa"],
    }
    return deps.get(feature, [])


def _build_flow_graph(plan_items: list) -> tuple:
    nodes, edges = [], []
    nodes.append({
        "id": "start",
        "type": "input",
        "data": {"label": "🎯 Start Improvement Plan"},
        "position": {"x": 300, "y": 0},
    })

    cats: dict[str, list] = {}
    for item in plan_items:
        cats.setdefault(item["category"], []).append(item)

    y, col = 120, 0
    priority_colors = {"high": "#ff6b6b", "medium": "#ffd93d", "low": "#6bcb77"}

    for cat, items in cats.items():
        cat_id = f"cat-{cat.lower().replace(' ', '-')}"
        nodes.append({
            "id": cat_id, "type": "default",
            "data": {"label": f"📂 {cat}", "itemCount": len(items)},
            "position": {"x": col * 320, "y": y},
            "style": {
                "background": "#1e1e2e", "border": "2px solid #6c63ff",
                "borderRadius": "12px", "padding": "10px", "color": "#fff",
            },
        })
        edges.append({"id": f"start-{cat_id}", "source": "start", "target": cat_id, "animated": True})

        iy = y + 100
        for item in items:
            nodes.append({
                "id": item["id"], "type": "default",
                "data": {"label": item["title"], "priority": item["priority"], "impact": item["estimated_impact"]},
                "position": {"x": col * 320, "y": iy},
                "style": {
                    "background": "#2d2d3f",
                    "border": f"2px solid {priority_colors.get(item['priority'], '#6c63ff')}",
                    "borderRadius": "8px", "padding": "8px", "color": "#fff", "fontSize": "12px",
                },
            })
            edges.append({"id": f"{cat_id}-{item['id']}", "source": cat_id, "target": item["id"]})
            iy += 90

        col += 1
        if col > 2:
            col, y = 0, y + 350

    max_y = max(n["position"]["y"] for n in nodes) + 120
    nodes.append({
        "id": "goal", "type": "output",
        "data": {"label": "🏆 Placement Ready!"},
        "position": {"x": 300, "y": max_y},
    })
    for item in plan_items:
        edges.append({
            "id": f"{item['id']}-goal", "source": item["id"], "target": "goal",
            "animated": True, "style": {"stroke": "#6c63ff"},
        })

    return nodes, edges


def _build_weekly_milestones(plan_items: list) -> list:
    weeks: dict[int, list] = {w: [] for w in range(1, 9)}
    for it in plan_items:
        w = min(it["timeline_week"], 8)
        weeks[w].append(it["title"])

    titles = {
        1: "Quick Wins & Foundation",
        2: "Building Momentum",
        3: "Core Skill Development",
        4: "Mid-Point Review",
        5: "Advanced Preparation",
        6: "Practice & Polish",
        7: "Mock Interviews",
        8: "Final Review",
    }
    return [
        {
            "week": w,
            "title": titles.get(w, f"Week {w}"),
            "tasks": weeks[w] if weeks[w] else ["Continue practising previous improvements"],
            "is_checkpoint": w in [4, 8],
        }
        for w in range(1, 9)
    ]


def _build_summary(explanation: dict) -> str:
    prob = explanation["placement_probability"]
    pkg = explanation["predicted_package"]
    risk = explanation["risk_level"]

    lines = [
        f"**Placement probability: {prob*100:.1f}%** — Risk level: **{risk.upper()}**.",
    ]
    if explanation["placed"]:
        lines.append(f"Estimated package: **₹{pkg:.2f} LPA**.")
    else:
        lines.append("Currently predicted as **not placed**. Follow this plan to improve your chances.")

    strengths = explanation.get("top_strengths", [])
    weaknesses = explanation.get("top_weaknesses", [])

    if strengths:
        lines.append("\n**Strengths:**")
        for s in strengths:
            lines.append(f"  • {s}")
    if weaknesses:
        lines.append("\n**Areas to improve:**")
        for w in weaknesses:
            lines.append(f"  • {w}")

    return "\n".join(lines)
