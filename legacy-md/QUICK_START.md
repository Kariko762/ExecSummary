# 🚀 Quick Reference: Adding Executive Summaries

## Your Workflow

### 1️⃣ On Your Laptop
```bash
# Copy the template
cp TEMPLATE_SUMMARY.json week-nov-07-2024.json

# Edit in your favorite editor
# Fill in all the data from your weekly update
```

### 2️⃣ Via SFTP
```bash
# Connect to your offline server
sftp user@your-server

# Navigate to the summaries folder
cd /path/to/ExecSummary/src/data/summaries/

# Upload your file
put week-nov-07-2024.json

# Disconnect
exit
```

### 3️⃣ On the Server
```bash
# SSH into server
ssh user@your-server

# Navigate to project
cd /path/to/ExecSummary

# Rebuild
npm run build

# Done! New summary appears automatically
```

---

## JSON Checklist

Before uploading, ensure:
- [ ] `id` is unique (no duplicates)
- [ ] `date` is in YYYY-MM-DD format
- [ ] Numbers don't have commas (1230000 not 1,230,000)
- [ ] All quotes are properly escaped
- [ ] File validates at jsonlint.com
- [ ] Filename matches `id` field

---

## Where Files Go

```
Your Laptop:
  TEMPLATE_SUMMARY.json  (keep this as your master template)
  week-nov-07-2024.json  (your new summary)

Server (via SFTP):
  /src/data/summaries/week-nov-07-2024.json
  /src/data/summaries/week-oct-31-2024.json
  /src/data/summaries/q4-2024.json
  ... etc
```

---

## Timeline Auto-Updates

The system:
✅ Automatically finds all .json files in `src/data/summaries/`
✅ Loads them at build time
✅ Sorts by date (newest first)
✅ Displays in the timeline
✅ No code changes needed!

---

## Need Help?

📖 See `TEMPLATE_README.md` for detailed field guide
📄 Check `src/data/summaries/week-oct-31-2024.json` for a complete example
🌐 Validate JSON at: https://jsonlint.com
