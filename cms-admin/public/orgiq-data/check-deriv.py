import csv

rows = list(csv.DictReader(open('demo_product_to_people - Copy(DATA_REFINED).csv', encoding='utf-8-sig', errors='ignore')))

deriv_rows = [r for r in rows if r.get('PE_L8', '').strip().upper() == 'DERIVATIVES UTILITY']

print(f'Found {len(deriv_rows)} rows for Derivatives Utility\n')
print('Unique people:')

seen = set()
for r in deriv_rows:
    if r['Employee_ID'] not in seen:
        print(f"  {r['Consultant']} (EID: {r['Employee_ID']})")
        print(f"    Role: {r['Role']}")
        print(f"    Consultant Manager: {r.get('Consultant Manager', 'N/A')}")
        print(f"    Regional Manager: {r.get('Regional Manager', 'N/A')}")
        print()
        seen.add(r['Employee_ID'])

print(f"\nTotal unique people: {len(seen)}")
