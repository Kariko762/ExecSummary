#!/usr/bin/env python3
"""
OrgIQ Data Converter
Converts organization_structure.json and people_structure.json 
to the format expected by OrgIQ (core_data.json and overlay-people.json)
"""

import json
from typing import Dict, List

def build_breadcrumb_map(org_structure: List[Dict]) -> Dict[str, str]:
    """
    Build a mapping from breadcrumb paths to node IDs.
    Breadcrumb format: "PARENT -> CHILD -> GRANDCHILD"
    """
    # First pass: build node lookup by ID
    nodes_by_id = {node['id']: node for node in org_structure}
    
    # Second pass: build breadcrumb for each node
    breadcrumb_to_id = {}
    
    def get_breadcrumb(node_id: str) -> str:
        """Recursively build breadcrumb path for a node"""
        node = nodes_by_id.get(node_id)
        if not node:
            return ""
        
        parts = [node['name']]
        current_id = node_id
        
        # Walk up the tree to root
        while nodes_by_id[current_id]['parentId']:
            parent_id = nodes_by_id[current_id]['parentId']
            if parent_id not in nodes_by_id:
                break
            parts.insert(0, nodes_by_id[parent_id]['name'])
            current_id = parent_id
        
        return " -> ".join(parts)
    
    # Build mapping for all nodes
    for node in org_structure:
        breadcrumb = get_breadcrumb(node['id'])
        breadcrumb_to_id[breadcrumb] = node['id']
        print(f"Mapped: {breadcrumb[:80]}... -> {node['id']}")
    
    return breadcrumb_to_id

def convert_people_structure(people_data: Dict, breadcrumb_map: Dict[str, str]) -> Dict:
    """
    Convert people_structure.json to overlay-people.json format.
    Maps breadcrumb nodeIds to actual node IDs.
    """
    overlay = {
        "overlayId": "people",
        "overlayName": "Team Members",
        "description": "People and managers assigned to each product/business unit",
        "lastUpdated": people_data.get("lastUpdated", ""),
        "visualizationConfig": {
            "title": "Team Members by Product",
            "icon": "Users",
            "primaryColor": "#8B5CF6",
            "secondaryColor": "#EC4899",
            "hotspotEnabled": True,
            "hotspotMetric": "headcount",
            "hotspotLabel": "Team Size",
            "hotspotRanges": [
                {"min": 0, "max": 50, "color": "#E0E7FF", "label": "Small (0-50)"},
                {"min": 51, "max": 150, "color": "#C7D2FE", "label": "Medium (51-150)"},
                {"min": 151, "max": 300, "color": "#A5B4FC", "label": "Large (151-300)"},
                {"min": 301, "max": 500, "color": "#818CF8", "label": "Very Large (301-500)"},
                {"min": 501, "max": 10000, "color": "#6366F1", "label": "Enterprise (500+)"}
            ],
            "aggregateMetrics": [
                {
                    "id": "totalHeadcount",
                    "label": "Total Headcount",
                    "field": "headcount",
                    "calculation": "sum",
                    "format": "number"
                },
                {
                    "id": "avgTeamSize",
                    "label": "Avg Team Size",
                    "field": "headcount",
                    "calculation": "average",
                    "format": "number"
                },
                {
                    "id": "totalProducts",
                    "label": "Products with Teams",
                    "field": "headcount",
                    "calculation": "count",
                    "format": "number"
                }
            ]
        },
        "nodeMetrics": []
    }
    
    # Convert each people group
    matched = 0
    unmatched = []
    
    for group in people_data.get("peopleStructure", []):
        breadcrumb_id = group.get("nodeId", "")
        
        # Try to find matching node ID - first try exact match
        node_id = breadcrumb_map.get(breadcrumb_id)
        
        # If no match, try prepending "COMPANY -> "
        if not node_id:
            full_breadcrumb = f"COMPANY -> {breadcrumb_id}"
            node_id = breadcrumb_map.get(full_breadcrumb)
        
        if not node_id:
            unmatched.append(breadcrumb_id[:100])
            continue
        
        matched += 1
        
        # Build node metrics
        node_metric = {
            "nodeId": node_id,
            "headcount": group.get("headcount", 0),
            "leader": group.get("leader"),
            "leaderTitle": group.get("leaderTitle"),
            "leaderEmail": group.get("leaderEmail"),
            "leaderPhone": group.get("leaderPhone"),
            "keyPeople": group.get("keyPeople", [])[:10]  # Limit to top 10 for performance
        }
        
        overlay["nodeMetrics"].append(node_metric)
    
    print(f"\nConversion Summary:")
    print(f"  Matched: {matched} groups")
    print(f"  Unmatched: {len(unmatched)} groups")
    
    if unmatched:
        print(f"\nFirst 5 unmatched breadcrumbs:")
        for bc in unmatched[:5]:
            print(f"  - {bc}")
    
    return overlay

def main():
    print("OrgIQ Data Converter")
    print("=" * 60)
    
    # Load organization structure
    print("\n1. Loading organization_structure.json...")
    with open('organization_structure.json', 'r', encoding='utf-8') as f:
        org_data = json.load(f)
    
    org_structure = org_data.get('organizationStructure', [])
    print(f"   Loaded {len(org_structure)} product nodes")
    
    # Load people structure
    print("\n2. Loading people_structure.json...")
    with open('people_structure.json', 'r', encoding='utf-8') as f:
        people_data = json.load(f)
    
    people_groups = people_data.get('peopleStructure', [])
    total_people = sum(g.get('headcount', 0) for g in people_groups)
    print(f"   Loaded {len(people_groups)} people groups")
    print(f"   Total headcount: {total_people:,}")
    
    # Build breadcrumb mapping
    print("\n3. Building breadcrumb-to-ID mapping...")
    breadcrumb_map = build_breadcrumb_map(org_structure)
    print(f"   Created {len(breadcrumb_map)} breadcrumb mappings")
    
    # Create core_data.json
    print("\n4. Creating core_data.json...")
    core_data = {
        "productId": org_data.get("productId"),
        "productName": org_data.get("productName"),
        "description": org_data.get("description"),
        "lastUpdated": org_data.get("lastUpdated"),
        "organizationStructure": org_structure
    }
    
    with open('core_data.json', 'w', encoding='utf-8') as f:
        json.dump(core_data, f, indent=2, ensure_ascii=False)
    print(f"   ✓ Wrote core_data.json ({len(org_structure)} nodes)")
    
    # Create overlay-people.json
    print("\n5. Creating overlay-people.json...")
    people_overlay = convert_people_structure(people_data, breadcrumb_map)
    
    with open('overlay-people.json', 'w', encoding='utf-8') as f:
        json.dump(people_overlay, f, indent=2, ensure_ascii=False)
    print(f"   ✓ Wrote overlay-people.json ({len(people_overlay['nodeMetrics'])} metrics)")
    
    print("\n" + "=" * 60)
    print("✓ Conversion complete!")
    print("\nNext steps:")
    print("1. Review core_data.json - should have 243 product nodes")
    print("2. Review overlay-people.json - should have team assignments")
    print("3. Update OrgIQ.tsx to load 'overlay-people.json'")
    print("4. Test in browser: http://localhost:5173 → OrgIQ")

if __name__ == "__main__":
    main()
