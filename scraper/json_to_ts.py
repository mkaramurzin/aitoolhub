import json

# Read the JSON file
with open('ai_tools.json', 'r') as f:
    tools_data = json.load(f)

# Convert to TypeScript format
ts_content = "export const tools = "
ts_content += json.dumps(tools_data, indent=2)
ts_content += ";"

# Write to TypeScript file
with open('../web/src/lib/ai_tools.ts', 'w') as f:
    f.write(ts_content)

print(f"Converted {len(tools_data)} tools to TypeScript format") 