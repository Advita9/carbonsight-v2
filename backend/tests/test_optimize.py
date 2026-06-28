from agents.eco_rewrite_agent import optimize_prompt

prompt = """
Can you please provide me with a very detailed explanation of what machine learning is and how it works?
"""

optimized, kwh, co2 = optimize_prompt(prompt)

print("\nOriginal:\n")
print(prompt)

print("\nOptimized:\n")
print(optimized)

print("\nSavings:")
print("kWh:", kwh)
print("CO2:", co2)