"""
Rebuild People Overlay from CSV
Correctly maps people to product hierarchy with proper leader identification
"""

import csv
import json
from collections import defaultdict
from datetime import datetime

# Role hierarchy for determining product leaders (higher = more senior)
ROLE_HIERARCHY = {
    'CEO': 100,
    'President': 90,
    'EVP': 85,
    'SVP': 80,
    'VP': 75,
    'Director': 70,
    'Senior Manager': 65,
    'Manager': 60,
    'Regional Manager': 58,
    'Consultant Manager': 55,
    'Senior Consultant': 50,
    'Consultant': 45,
    'Presales': 40,
    'National Manager': 38,
    'Player/Coach': 35,
    'Senior Analyst': 30,
    'Analyst': 25,
    'Associate': 20,
    'Coordinator': 15,
    'Other': 10
}

def get_role_score(role):
    """Get hierarchy score for a role"""
    if not role:
        return 0
    role = role.strip()
    # Exact match
    if role in ROLE_HIERARCHY:
        return ROLE_HIERARCHY[role]
    # Partial match (e.g., "Senior Manager - Finance")
    for key, score in ROLE_HIERARCHY.items():
        if key.lower() in role.lower():
            return score
    return ROLE_HIERARCHY['Other']

def build_product_path(row):
    """Build hierarchical product path from PE_L3 to PE_L8"""
    path_parts = []
    for level in ['PE_L3', 'PE_L4', 'PE_L5', 'PE_L6', 'PE_L7', 'PE_L8']:
        value = row.get(level, '').strip()
        # Skip empty, #N/A, or invalid values
        if value and value.upper() not in ['#N/A', 'N/A', '']:
            path_parts.append(value.upper())
    return ' -> '.join(path_parts) if path_parts else None

def main():
    print("🔄 Rebuilding People Overlay from CSV...")
    
    # Read CSV
    csv_file = 'demo_product_to_people - Copy(DATA_REFINED).csv'
    
    # Try different encodings
    for encoding in ['utf-8-sig', 'cp1252', 'latin-1', 'iso-8859-1']:
        try:
            with open(csv_file, 'r', encoding=encoding) as f:
                reader = csv.DictReader(f)
                rows = list(reader)
            print(f"✅ Successfully read CSV with {encoding} encoding")
            break
        except UnicodeDecodeError:
            continue
    else:
        print("❌ Failed to read CSV with any encoding")
        return
    
    print(f"📊 Loaded {len(rows)} rows from CSV")
    
    # Group people by product path
    products = defaultdict(lambda: {
        'people': [],
        'path': None
    })
    
    for row in rows:
        product_path = build_product_path(row)
        if not product_path:
            continue
        
        employee_id = row.get('Employee_ID', '').strip()
        consultant = row.get('Consultant', '').strip()
        role = row.get('Role', '').strip()
        
        if not employee_id or not consultant:
            continue
        
        # Store product info
        products[product_path]['path'] = product_path
        
        # Add person to this product
        person = {
            'name': consultant,
            'employee_id': employee_id,
            'role': role,
            'role_score': get_role_score(role),
            'consultant_manager': row.get('Consultant Manager', '').strip(),
            'regional_manager': row.get('Regional Manager', '').strip()
        }
        
        products[product_path]['people'].append(person)
    
    print(f"📦 Found {len(products)} unique products")
    
    # Process each product
    node_metrics = []
    
    for product_path, data in products.items():
        people = data['people']
        
        # Deduplicate people by employee_id
        unique_people = {}
        for person in people:
            emp_id = person['employee_id']
            # Keep the highest role score for each person
            if emp_id not in unique_people or person['role_score'] > unique_people[emp_id]['role_score']:
                unique_people[emp_id] = person
        
        people_list = list(unique_people.values())
        
        if not people_list:
            continue
        
        # Sort by role hierarchy
        people_list.sort(key=lambda x: x['role_score'], reverse=True)
        
        # Identify leader (highest role score)
        leader = people_list[0]
        team_members = people_list[1:] if len(people_list) > 1 else []
        
        # Build keyPeople list (excluding leader)
        key_people = [{
            'name': p['name'],
            'title': p['role'],
            'email': f"{p['employee_id']}@fis.com"  # Placeholder email
        } for p in team_members]
        
        # Create node metric
        node_metric = {
            'nodeId': product_path,
            'headcount': len(people_list),
            'leader': leader['name'],
            'leaderTitle': leader['role'],
            'leaderEmail': f"{leader['employee_id']}@fis.com",
            'leaderPhone': None,
            'keyPeople': key_people
        }
        
        node_metrics.append(node_metric)
        
        # Log progress
        if len(node_metrics) % 50 == 0:
            print(f"  ✅ Processed {len(node_metrics)} products...")
    
    print(f"\n✅ Created {len(node_metrics)} product node metrics")
    
    # Calculate total unique people across all products
    all_employee_ids = set()
    for metric in node_metrics:
        # Add leader
        if metric.get('leader'):
            # Extract employee ID from email (placeholder logic)
            all_employee_ids.add(metric['leaderEmail'])
        # Add team members
        for person in metric.get('keyPeople', []):
            all_employee_ids.add(person.get('email', ''))
    
    print(f"👥 Total unique people: {len(all_employee_ids)}")
    
    # Sort by nodeId
    node_metrics.sort(key=lambda x: x['nodeId'])
    
    # Create overlay structure
    overlay = {
        'overlayId': 'people',
        'overlayName': 'Team Members',
        'description': 'People and managers assigned to each product/business unit',
        'lastUpdated': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
        'nodeMetrics': node_metrics,
        'visualizationConfig': {
            'hotspotEnabled': True,
            'hotspotMetric': 'headcount',
            'hotspotLabel': 'Team Size',
            'hotspotRanges': [
                {'min': 0, 'max': 50, 'color': '#E0E7FF', 'label': 'Small (0-50)'},
                {'min': 51, 'max': 150, 'color': '#C7D2FE', 'label': 'Medium (51-150)'},
                {'min': 151, 'max': 300, 'color': '#A5B4FC', 'label': 'Large (151-300)'},
                {'min': 301, 'max': 500, 'color': '#818CF8', 'label': 'Very Large (301-500)'},
                {'min': 501, 'max': 99999, 'color': '#6366F1', 'label': 'Enterprise (500+)'}
            ],
            'aggregateMetrics': [
                {'field': 'headcount', 'label': 'Total Team Size', 'aggregation': 'sum'}
            ],
            'icon': 'users'
        }
    }
    
    # Write to file
    output_file = 'overlay-people.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(overlay, f, indent=2)
    
    print(f"\n🎉 Successfully created {output_file}")
    print(f"📊 Summary:")
    print(f"  - Products with teams: {len(node_metrics)}")
    print(f"  - Total unique people: {len(all_employee_ids)}")
    
    # Show sample
    print(f"\n📝 Sample product:")
    if node_metrics:
        sample = node_metrics[0]
        print(f"  Product: {sample['nodeId']}")
        print(f"  Leader: {sample['leader']} ({sample['leaderTitle']})")
        print(f"  Team Size: {sample['headcount']}")
        print(f"  Team Members: {len(sample['keyPeople'])}")

if __name__ == '__main__':
    main()
