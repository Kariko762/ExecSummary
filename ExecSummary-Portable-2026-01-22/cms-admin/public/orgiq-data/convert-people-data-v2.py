"""
OrgIQ People Data Converter V2
Converts CSV with product-to-people mappings into overlay JSON format.

Fixes:
1. Properly identifies product leaders (managers)
2. Deduplicates people entries
3. Handles consultant vs regional manager hierarchy
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
    # Read CSV
    product_people_map = defaultdict(lambda: {
        'people': {},  # Use dict to deduplicate by employee_id
        'managers': set(),  # Track potential managers
        'regional_managers': set()
    })
    
    print("📖 Reading CSV file...")
    with open('demo_product_to_people - Copy(DATA_REFINED).csv', 'r', encoding='utf-8-sig', errors='ignore') as f:
        reader = csv.DictReader(f)
        total_rows = 0
        
        for row in reader:
            total_rows += 1
            breadcrumb = build_breadcrumb(row)
            
            if not breadcrumb:
                continue
            
            person_name = row.get('Consultant', '').strip()
            employee_id = row.get('Employee_ID', '').strip()
            role = row.get('Role', '').strip()
            consultant_manager = row.get('Consultant Manager', '').strip()
            regional_manager = row.get('Regional Manager', '').strip()
            
            if not person_name or not employee_id:
                continue
            
            # Store person (deduplicated by employee_id)
            product_people_map[breadcrumb]['people'][employee_id] = {
                'name': person_name,
                'title': role,
                'email': None,  # Not in CSV
                'eid': employee_id
            }
            
            # Track managers
            if consultant_manager:
                product_people_map[breadcrumb]['managers'].add(consultant_manager)
            if regional_manager:
                product_people_map[breadcrumb]['regional_managers'].add(regional_manager)
    
    print(f"✅ Processed {total_rows} rows")
    print(f"📊 Found {len(product_people_map)} unique products")
    
    # Build node metrics
    node_metrics = []
    
    for breadcrumb, data in sorted(product_people_map.items()):
        people_list = list(data['people'].values())
        
        # Determine leader:
        # 1. If there's exactly one consultant manager, use them
        # 2. Otherwise, use regional manager
        # 3. If multiple, pick first alphabetically
        leader_name = None
        leader_title = None
        
        # Check if any consultant manager is in the people list
        managers_in_team = [m for m in data['managers'] if any(p['name'] == m for p in people_list)]
        
        if len(managers_in_team) == 1:
            leader_name = managers_in_team[0]
        elif len(data['managers']) == 1:
            leader_name = list(data['managers'])[0]
        elif len(data['regional_managers']) == 1:
            leader_name = list(data['regional_managers'])[0]
        elif data['managers']:
            leader_name = sorted(data['managers'])[0]
        elif data['regional_managers']:
            leader_name = sorted(data['regional_managers'])[0]
        
        # Find leader's title if they're in the team
        if leader_name:
            leader_person = next((p for p in people_list if p['name'] == leader_name), None)
            if leader_person:
                leader_title = leader_person['title']
            else:
                # Leader not in team, default title
                leader_title = 'Manager'
        
        # Remove leader from keyPeople if they exist there
        key_people = [p for p in people_list if p['name'] != leader_name]
        
        node_metrics.append({
            'nodeId': breadcrumb,
            'headcount': len(people_list),  # Deduplicated count
            'leader': leader_name,
            'leaderTitle': leader_title,
            'leaderEmail': None,
            'leaderPhone': None,
            'imageUrl': None,
            'keyPeople': sorted(key_people, key=lambda x: x['name'])
        })
    
    # Create output structure
    output = {
        'lastUpdated': datetime.utcnow().isoformat() + 'Z',
        'nodeMetrics': node_metrics,
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
    
    # Write to file
    print("💾 Writing overlay-people-v2.json...")
    with open('overlay-people-v2.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ SUCCESS!")
    print(f"📄 Created: overlay-people-v2.json")
    print(f"📊 {len(node_metrics)} products with team data")
    
    # Statistics
    total_people_with_dupes = sum(len(data['people']) for data in product_people_map.values())
    products_with_leaders = sum(1 for m in node_metrics if m['leader'])
    
    print(f"\n📈 Statistics:")
    print(f"   - Total unique people across all products: {total_people_with_dupes}")
    print(f"   - Products with identified leaders: {products_with_leaders}/{len(node_metrics)}")
    print(f"   - Average team size: {total_people_with_dupes / len(node_metrics):.1f}")
    
    # Show sample
    print(f"\n📋 Sample (first 3 products):")
    for metric in node_metrics[:3]:
        print(f"   {metric['nodeId']}")
        print(f"      Leader: {metric['leader']} ({metric['leaderTitle']})")
        print(f"      Team: {metric['headcount']} people")
        print()

if __name__ == '__main__':
    main()
