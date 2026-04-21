"""Quick smoke test for all AI service endpoints."""
import json
import urllib.request

API = "http://localhost:5000"

def post(path, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(f"{API}{path}", data=body, headers={"Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(req).read())

def get(path):
    return json.loads(urllib.request.urlopen(f"{API}{path}").read())

student = {
    "gender": "Male", "age": 21, "degree": "BTech", "branch": "CS",
    "cgpa": 7.5, "backlogs": 0, "internships": 1, "certifications": 2,
    "coding_skills": 6, "communication_skills": 6, "aptitude_score": 65, "projects": 2,
}

print("=== HEALTH ===")
print(get("/health"))

print("\n=== PREDICT ===")
pred = post("/predict", student)
print(json.dumps(pred, indent=2))

print("\n=== EXPLAIN ===")
expl = post("/explain", student)
placed = expl["placed"]
prob = expl["placement_probability"]
print(f"Placed: {placed}, Probability: {prob}")
print(f"Strengths: {expl['top_strengths']}")
print(f"Weaknesses: {expl['top_weaknesses']}")
for e in expl["explanations"][:3]:
    print(f"  {e['display_name']}: {e['shap_value']:+.4f} ({e['impact']})")

print("\n=== STUDY PLAN ===")
plan = post("/study-plan", student)
print(f"Plan items: {len(plan['plan_items'])}")
print(f"Flow nodes: {len(plan['flow_nodes'])}, edges: {len(plan['flow_edges'])}")
print(f"Milestones: {len(plan['weekly_milestones'])}")
for item in plan["plan_items"][:3]:
    print(f"  [{item['priority'].upper()}] {item['title']} (Week {item['timeline_week']})")

print("\n=== CHAT ===")
chat = post("/chat", {"message": "Hello"})
print(f"Response: {chat['response'][:100]}...")
print(f"Suggestions: {chat['suggestions']}")

print("\n=== MODEL INFO ===")
info = get("/model-info")
print(f"Classification: {info['classification_metrics']}")
print(f"Regression: {info['regression_metrics']}")
for fi in info["feature_importances"][:5]:
    print(f"  {fi['display_name']}: {fi['importance']:.4f}")

print("\n[OK] ALL 6 ENDPOINTS WORKING!")
