"""
OrgIQ People Data Merger
Merges existing people_structure.json (source of truth for leaders) 
with CSV data (source of Employee IDs)
"""

import csv
import json
from collections import defaultdict
from datetime import datetime

def build_breadcrumb(row):
    """Build product breadcrumb from PE_L3 through PE_L8"""
    parts = []
    for level in ['PE_L3', 'PE_L4', 'PE_L5', 'PE_L6', 'PE_L7', 'PE_L8']:
        if row.get(level) and row[level].strip():
            parts.append(row[level].strip().upper())
    return ' -> '.join(parts) if parts else None

def main():
    # Load existing people_structure.json
    print("📖 Loading existing people_structure.json...")
    with open('people_structure.json', 'r', encoding='utf-8') as f:
        people_data = json.load(f)
    
    print(f"✅ Loaded {len(people_data['peopleStructure'])} products from JSON")
    
    # Build EID lookup from CSV
    print("\n📖 Reading CSV for Employee IDs...")
    name_to_eid = {}  # Map person name -> Employee ID
    
    with open('demo_product_to_people - Copy(DATA_REFINED).csv', 'r', encoding='utf-8-sig', errors='ignore') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get('Consultant', '').strip()
            eid = row.get('Employee_ID', '').strip()
            if name and eid:
                name_to_eid[name] = eid
    
    print(f"✅ Found {len(name_to_eid)} unique people with EIDs")
    
    # Enhance people_structure with EIDs
    print("\n🔄 Merging Employee IDs into people structure...")
    enhanced_count = 0
    
    for product in people_data['peopleStructure']:
        # Add EID to keyPeople
        if 'keyPeople' in product:
            for person in product['keyPeople']:
                if person['name'] in name_to_eid:
                    person['eid'] = name_to_eid[person['name']]
                    enhanced_count += 1
    
    print(f"✅ Enhanced {enhanced_count} people records with Employee IDs")
    
    # Write output
    output = {
        'lastUpdated': datetime.now().isoformat() + 'Z',
        'nodeMetrics': people_data['peopleStructure'],
        'visualizationConfig': {
            'hotspotEnabled': True,
            'hotspotMetric': 'headcount',
            'hotspotLabel': 'Team Size',
            'hotspotRanges': [
                {'min': 0, 'max': 50, 'label': 'Small (0-50)', 'color': '#E0E7FF'},
                {'min': 51, 'max': 150, 'label': 'Medium (51-150)', 'color': '#C7D2FE'},
                {'min': 151, 'max': 300, 'label': 'Large (151-300)', 'color': '#A5B4FC'},
                {'min': 301, 'max': 500, 'label': 'Very Large (301-500)', 'color': '#818CF8'},
                {'min': 501, 'max': 99999, 'label': 'Enterprise (500+)', 'color': '#6366F1'}
            ],
            'aggregateMetrics': [
                {'field': 'headcount', 'label': 'Total Team Members', 'aggregation': 'sum'}
            ],
            'icon': 'users'
        }
    }
    
    print("\n💾 Writing overlay-people.json...")
    with open('overlay-people.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ SUCCESS!")
    print(f"📄 Updated: overlay-people.json")
    print(f"📊 {len(people_data['peopleStructure'])} products")
    print(f"💼 {enhanced_count} people with Employee IDs added")
    
    # Calculate total people
    total_people = sum(len(p.get('keyPeople', [])) for p in people_data['peopleStructure'])
    print(f"👥 Total people across all products: {total_people}")

if __name__ == '__main__':
    main()
