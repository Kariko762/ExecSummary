"""
Rebuild core_data.json from CSV to match overlay-people.json nodeIds
"""

import csv
import json
from collections import defaultdict

def build_product_path(row):
    """Build hierarchical product path from PE_L3 to PE_L8"""
    path_parts = []
    for level in ['PE_L3', 'PE_L4', 'PE_L5', 'PE_L6', 'PE_L7', 'PE_L8']:
        value = row.get(level, '').strip()
        # Skip empty, #N/A, or invalid values
        if value and value.upper() not in ['#N/A', 'N/A', '']:
            path_parts.append(value.upper())
    return path_parts

def main():
    print("🔄 Rebuilding core_data.json from CSV...")
    
    # Read CSV
    csv_file = 'demo_product_to_people - Copy(DATA_REFINED).csv'
    
    for encoding in ['utf-8-sig', 'cp1252', 'latin-1']:
        try:
            with open(csv_file, 'r', encoding=encoding) as f:
                reader = csv.DictReader(f)
                rows = list(reader)
            print(f"✅ Read CSV with {encoding} encoding")
            break
        except UnicodeDecodeError:
            continue
    
    # Build hierarchy tree
    nodes_set = set()
    parent_map = {}
    
    for row in rows:
        path_parts = build_product_path(row)
        if not path_parts:
            continue
        
        # Build incremental paths
        for i in range(len(path_parts)):
            current_path = ' -> '.join(path_parts[:i+1])
            parent_path = ' -> '.join(path_parts[:i]) if i > 0 else None
            
            nodes_set.add(current_path)
            if current_path not in parent_map:
                parent_map[current_path] = parent_path
    
    print(f"📦 Found {len(nodes_set)} unique nodes")
    
    # Add a single root node
    org_structure = [{
        'id': 'root',
        'parentId': None,
        'name': 'COMPANY',
        'title': 'Company',
        'department': 'Corporate',
        'productRole': 'Root'
    }]
    
    # Build organization structure
    for node_path in sorted(nodes_set):
        parent_path = parent_map[node_path]
        
        # If no parent, attach to root
        if parent_path is None:
            parent_path = 'root'
        
        # Extract node name (last part of path)
        node_name = node_path.split(' -> ')[-1]
        
        # Determine level
        depth = node_path.count(' -> ')
        
        # Determine type and product level based on depth
        type_mapping = {
            0: 'Division',
            1: 'Business Unit',
            2: 'Department',
            3: 'Sub-Department',
            4: 'Product Group',
            5: 'Product Category',
            6: 'Product'
        }
        node_type = type_mapping.get(depth, 'Product')
        
        # Map depth to product level (L3-L8)
        product_level = f'L{depth + 3}' if depth <= 5 else 'L8'
        
        org_node = {
            'id': node_path,
            'parentId': parent_path,
            'name': node_name,
            'title': node_type,
            'department': node_path.split(' -> ')[0] if ' -> ' in node_path else node_name,
            'productRole': node_type,
            'productLevel': product_level
        }
        
        org_structure.append(org_node)
    
    # Create core data structure
    core_data = {
        'organizationStructure': org_structure,
        'metadata': {
            'lastUpdated': '2025-12-04T00:00:00Z',
            'nodeCount': len(org_structure),
            'source': 'CSV Product Hierarchy'
        }
    }
    
    # Write to file
    output_file = 'core_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(core_data, f, indent=2)
    
    print(f"\n🎉 Successfully created {output_file}")
    print(f"📊 Total nodes: {len(org_structure)}")
    
    # Show sample
    print(f"\n📝 Sample nodes:")
    for node in org_structure[:5]:
        print(f"  {node['name']} (ID: {node['id'][:50]}...)")
        print(f"    Parent: {node['parentId'][:50] if node['parentId'] else 'None'}...")

if __name__ == '__main__':
    main()
