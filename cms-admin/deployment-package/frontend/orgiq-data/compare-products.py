import csv
import json
from collections import defaultdict

# Load existing people structure
with open('people_structure.json', 'r', encoding='utf-8') as f:
    people_data = json.load(f)

existing_products = set(p['nodeId'] for p in people_data['peopleStructure'])

# Get products from CSV
csv_products = set()
with open('demo_product_to_people - Copy(DATA_REFINED).csv', 'r', encoding='utf-8-sig', errors='ignore') as f:
    reader = csv.DictReader(f)
    for row in reader:
        parts = []
        for level in ['PE_L3', 'PE_L4', 'PE_L5', 'PE_L6', 'PE_L7', 'PE_L8']:
            if row.get(level) and row[level].strip():
                parts.append(row[level].strip().upper())
        if parts:
            breadcrumb = ' -> '.join(parts)
            csv_products.add(breadcrumb)

print(f"Products in people_structure.json: {len(existing_products)}")
print(f"Products in CSV: {len(csv_products)}")

# Find products in CSV but not in people_structure.json
missing = csv_products - existing_products
if missing:
    print(f"\n⚠️  Products in CSV but NOT in people_structure.json: {len(missing)}")
    for product in sorted(missing)[:10]:  # Show first 10
        print(f"   - {product}")
else:
    print("\n✅ All CSV products exist in people_structure.json")

# Check if Derivatives Utility is in either
deriv_in_csv = any('DERIVATIVES UTILITY' in p for p in csv_products)
deriv_in_json = any('DERIVATIVES UTILITY' in p for p in existing_products)

print(f"\nDerivatives Utility in CSV: {deriv_in_csv}")
print(f"Derivatives Utility in people_structure.json: {deriv_in_json}")

if deriv_in_csv:
    deriv_product = [p for p in csv_products if 'DERIVATIVES UTILITY' in p][0]
    print(f"  Full path: {deriv_product}")
