from agents.eco_plan_agent import generate_plan

prompt = """
Design a sustainability strategy for a company using AI.
"""

result = generate_plan(prompt)

print("\nGenerated Plan:\n")

for step in result:
    print("-", step)