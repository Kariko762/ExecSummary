# Change Request CR-001: Organizations Dashboard Integration

**Change ID:** CR-001  
**Title:** Integrate Organizations Dashboard into Metadata-Driven Template System  
**Requested By:** Product Team  
**Date Created:** November 8, 2025  
**Target Date:** November 15, 2025  
**Status:** Pending Approval

---

## Change Description

### Summary
Convert the Organizations (Performance Dashboard) feature from a custom TypeScript component with hardcoded interfaces to the metadata-driven template system, enabling CMS editing capabilities and consistent rendering across the platform.

### Business Justification
- **CMS Integration:** Enable non-technical users to create and edit organization dashboards through the CMS interface
- **Consistency:** Align Organizations with the unified template architecture used for Executive Summaries
- **Scalability:** Support dynamic organization creation without code changes
- **Maintenance:** Reduce technical debt by eliminating duplicate rendering logic
- **Quick Win:** Simplest of the three feature integrations (0.5-1 day effort)

### Current State
- 4 organization JSON files using custom schema (`banking-na.json`, `payments.json`, `int-banking.json`, `capital-markets.json`)
- Custom `Organization` TypeScript interface with fixed structure
- Expression syntax using `{{}}` delimiters (incompatible with platform standard)
- Standalone `OrganizationDashboard.tsx` and `OrganizationModal.tsx` components
- No CMS editing capability

### Desired State
- Organizations stored as metadata-driven templates compatible with Template Builder
- Expression syntax converted to platform standard `[[]]` delimiters
- Editable through existing CMS EditorModalV2 interface
- Rendered using shared RenderFactory components
- Seamless integration with navigation and routing system

---

## Implementation Plan

### Phase 1: Template Creation (2 hours)
**Timeline:** Day 1, Hours 1-2

1. Create organization template file: `cms-admin/src/templates/organization-template-v1.json`
2. Define metadata structure with `_type` fields:
   - `_keyHighlights_type: "list"`
   - `_strategicProjects_type: "nestedCards"`
   - `_supportActivities_type: "nestedCards"`
   - `_demoInsights_type: "nestedCards"`
3. Add `_fields` schemas for each nested card type
4. Configure `_columnSpan` for responsive layout
5. Test template loads in Template Builder

**Dependencies:** None  
**Resources:** 1 Frontend Developer

### Phase 2: Expression Syntax Converter (2 hours)
**Timeline:** Day 1, Hours 3-4

1. Create utility function `convertOrganizationExpressions()`
2. Map expression conversions:
   - `{{badge:success}}` → `[[badge]]success[[/badge]]`
   - `{{trend:up}}` → `[[trend]]↑[[/trend]]`
   - `{{metric:43|engagements|users}}` → `[[metric]]43[[/metric]]`
   - `{{delta:12}}` → `[[delta]]+12[[/delta]]`
   - `{{bold:text}}` → `[[bold]]text[[/bold]]`
   - `{{highlight:text}}` → `[[highlight]]text[[/highlight]]`
   - `{{currency:890000}}` → `[[currency]]$890,000[[/currency]]`
   - `{{percent:40}}` → `[[percent]]40%[[/percent]]`
   - `{{icon:award}}` → `[[icon]]award[[/icon]]`
3. Add unit tests for converter
4. Validate against all 4 organization files

**Dependencies:** None  
**Resources:** 1 Frontend Developer

### Phase 3: Data Migration (2 hours)
**Timeline:** Day 1, Hours 5-6

1. Run converter script on all 4 organization JSON files
2. Add metadata fields to converted files:
   - `_keyHighlights_type`, `_strategicProjects_type`, etc.
   - `_enabled_*` flags (all true)
   - `_completed_*` flags (all false)
   - `_columnSpan` values
3. Move converted files to `cms-admin/src/templates/organizations/`
4. Create backup of original files in `src/data/organizations-archive/`
5. Validate JSON structure with schema validator

**Dependencies:** Phase 2 completion  
**Resources:** 1 Frontend Developer

### Phase 4: Component Integration (2 hours)
**Timeline:** Day 2, Hours 1-2

1. Update navigation to use template-based organization routes
2. Create `OrganizationTemplateView.tsx` component using EditorModalV2 pattern
3. Update `organizations-loader.ts` to load from templates directory
4. Add organization category to Template Builder dropdown
5. Test rendering with RenderFactory

**Dependencies:** Phase 3 completion  
**Resources:** 1 Frontend Developer

### Phase 5: Testing & Validation (2 hours)
**Timeline:** Day 2, Hours 3-4

1. Verify all 4 organizations render correctly
2. Test CMS editing for all field types
3. Validate expression rendering (badges, trends, metrics, etc.)
4. Test responsive layout across breakpoints
5. Verify navigation and modal behavior
6. Performance testing (load time, rendering speed)

**Dependencies:** Phase 4 completion  
**Resources:** 1 Frontend Developer, 1 QA Tester

---

## Platforms/Systems Impacted

### Frontend Application
- **Path:** `src/components/OrganizationDashboard.tsx`
- **Impact:** Component refactored or deprecated
- **Change Type:** Code modification

### CMS Admin Interface
- **Path:** `cms-admin/src/templates/`
- **Impact:** New organization templates added
- **Change Type:** New files

### Data Storage
- **Original:** `src/data/organizations/*.json`
- **New:** `cms-admin/src/templates/organizations/*.json`
- **Change Type:** File migration

### Navigation/Routing
- **Path:** `src/App.tsx` or routing configuration
- **Impact:** Update organization routes
- **Change Type:** Configuration change

### Shared Libraries
- **Path:** `src/renderers/RenderFactory.tsx`
- **Impact:** May need new render types for organization-specific elements
- **Change Type:** Enhancement (if needed)

---

## Potential Risks

### Technical Risks

**Risk 1: Expression Syntax Conversion Errors**
- **Likelihood:** Medium
- **Impact:** High
- **Description:** Automated conversion may miss edge cases or nested expressions
- **Mitigation:** 
  - Comprehensive unit tests covering all expression patterns
  - Manual review of all converted files
  - Keep original files as backup
  - Staged rollout with visual comparison

**Risk 2: Performance Degradation**
- **Likelihood:** Low
- **Impact:** Medium
- **Description:** Metadata parsing may be slower than hardcoded interfaces
- **Mitigation:**
  - Performance benchmarking before/after
  - Implement memoization for repeated renders
  - Monitor Core Web Vitals
  - Optimize RenderFactory if needed

**Risk 3: Missing Render Types**
- **Likelihood:** Low
- **Impact:** Medium
- **Description:** Organization data may use patterns not yet in RenderFactory
- **Mitigation:**
  - Comprehensive audit of all organization fields
  - Create custom renderers before migration
  - Fallback to default renderer for unknown types

### Operational Risks

**Risk 4: User Confusion During Transition**
- **Likelihood:** Medium
- **Impact:** Low
- **Description:** Users may be confused by new editing interface
- **Mitigation:**
  - Create user documentation
  - Provide training session
  - Maintain legacy view temporarily
  - Communication plan to stakeholders

**Risk 5: Data Loss During Migration**
- **Likelihood:** Low
- **Impact:** Critical
- **Description:** Conversion script could corrupt or lose organization data
- **Mitigation:**
  - Complete backup before migration
  - Version control commit before changes
  - Validation checksums
  - Rollback plan ready

---

## Rollback Plan

### Immediate Rollback (< 5 minutes)
1. Git revert to commit before migration: `git revert HEAD`
2. Restart development servers
3. Verify original files are serving correctly

### Partial Rollback (5-15 minutes)
1. Restore original organization files from backup:
   ```bash
   cp -r src/data/organizations-archive/* src/data/organizations/
   ```
2. Revert routing changes in `App.tsx`
3. Re-enable original `OrganizationDashboard.tsx` component
4. Clear browser cache
5. Test all 4 organizations load correctly

### Full Rollback (15-30 minutes)
1. Check out previous stable branch:
   ```bash
   git checkout feature/api-backend-cms
   git reset --hard <commit-hash-before-change>
   ```
2. Reinstall dependencies: `npm install`
3. Restart all services
4. Run smoke tests
5. Notify stakeholders of rollback

### Data Recovery
- **Backup Location:** `src/data/organizations-archive/`
- **Git History:** All original files tracked in version control
- **Backup Verification:** MD5 checksums stored in `plans/backups/organizations-checksums.txt`

---

## Change Type Classification

**Type:** Normal Change

**Justification:**
- Not a standard change (requires development work)
- Not an emergency (no production issues or security vulnerabilities)
- Scheduled development during normal sprint cycle
- Impacts non-critical feature with existing workaround (legacy components)
- Requires testing and validation before deployment

---

## Priority & Impact Assessment

### Priority: Medium-High
- **Business Value:** High - Enables CMS editing of organizations
- **Urgency:** Medium - Not blocking other work, but early win for template system
- **Effort:** Low - 0.5-1 day implementation
- **Risk:** Low - Simple feature with good rollback options

### Impact Analysis

**User Impact: Low**
- End users see identical visual output
- No workflow changes for consumers
- Only CMS editors benefit from new interface

**Business Impact: Medium-High**
- Enables faster organization dashboard creation
- Reduces dependency on developers for content updates
- Proves template system viability for other features

**Technical Impact: Low**
- Limited code changes
- No database modifications
- No infrastructure changes
- Minimal dependencies

**Urgency Level: 2/5**
- Can be scheduled in normal sprint
- Good foundation for more complex migrations (ExecutiveIQ, Initiatives)

---

## Testing & Validation Plan

### Pre-Deployment Testing

**Unit Tests**
- Expression converter function tests
  - All 9 expression types (`{{badge}}`, `{{trend}}`, etc.)
  - Nested expressions
  - Edge cases (empty strings, special characters)
  - Target: 100% code coverage

**Integration Tests**
- Template loading from new directory
- RenderFactory rendering all organization sections
- CMS editing interface (EditorModalV2)
- Navigation and routing
- Target: All critical paths covered

**Visual Regression Testing**
- Screenshot comparison before/after migration
- All 4 organizations tested
- Desktop and mobile breakpoints
- Light and dark mode themes

**Performance Testing**
- Initial load time < 2 seconds
- Time to interactive < 3 seconds
- No memory leaks during navigation
- Lighthouse score > 90

### Validation Criteria

**Functional Validation**
- ✅ All 4 organizations render without errors
- ✅ All expression types display correctly
- ✅ CMS editing saves changes properly
- ✅ Navigation and modals function identically
- ✅ Responsive layout works on all breakpoints

**Data Validation**
- ✅ No data loss during migration
- ✅ All fields present in converted files
- ✅ Expression syntax correctly converted
- ✅ Metadata fields properly added

**Performance Validation**
- ✅ Load time within 10% of baseline
- ✅ No console errors or warnings
- ✅ Memory usage stable

### Post-Deployment Testing

**Smoke Tests** (15 minutes)
1. Load each of 4 organizations
2. Verify key highlights display
3. Test strategic projects section
4. Verify support activities render
5. Check demo insights widget

**User Acceptance Testing** (1 hour)
1. CMS editor creates new organization
2. Edit existing organization fields
3. Test all expression types in editor
4. Verify preview matches production render
5. Save and publish changes

**Monitoring** (48 hours)
- Error rate in application logs
- Page load times (Real User Monitoring)
- User feedback via support channels

---

## Approvals & Stakeholders

### Required Approvals

| Role | Name | Approval Type | Status | Date |
|------|------|---------------|--------|------|
| Technical Lead | TBD | Technical Review | Pending | - |
| Product Owner | TBD | Business Approval | Pending | - |
| QA Lead | TBD | Test Plan Approval | Pending | - |

### Stakeholders

**Primary Stakeholders**
- **CMS Content Editors** - Will use new editing interface
- **Demo Services Team** - Content owners for organization dashboards
- **Frontend Development Team** - Implements and maintains changes

**Secondary Stakeholders**
- **End Users** - View organization dashboards (no change expected)
- **Sales Leadership** - Consumes organization performance data

### Communication Plan

**Pre-Implementation** (3 days before)
- Email to CMS editors announcing change
- Demo session showing new editing interface
- Documentation published to internal wiki

**During Implementation**
- Slack notifications during deployment window
- Status updates in #engineering channel

**Post-Implementation** (1 day after)
- Success announcement to stakeholders
- Known issues documented
- Feedback collection survey sent

---

## Schedule/Window

### Proposed Implementation Window
**Date:** November 15, 2025 (Friday)  
**Time:** 10:00 AM - 2:00 PM EST  
**Duration:** 4 hours (8 hours work, scheduled over 2 days)

### Detailed Schedule

**Day 1: November 14, 2025 (Thursday)**
- 9:00 AM - 11:00 AM: Phase 1 (Template Creation)
- 11:00 AM - 1:00 PM: Phase 2 (Expression Converter)
- 2:00 PM - 4:00 PM: Phase 3 (Data Migration)

**Day 2: November 15, 2025 (Friday)**
- 9:00 AM - 11:00 AM: Phase 4 (Component Integration)
- 11:00 AM - 1:00 PM: Phase 5 (Testing & Validation)
- 2:00 PM - 3:00 PM: Deployment & Smoke Tests
- 3:00 PM - 4:00 PM: Buffer for issues

### Business Considerations
- **Low Usage Period:** Friday morning, minimal impact on users
- **Support Coverage:** Full development team available
- **Rollback Window:** 4 hours before EOD Friday
- **No Conflicts:** No other major releases scheduled

---

## Resources Required

### Personnel

**Frontend Developer (Lead)** - 8 hours
- Template creation
- Expression converter development
- Component integration
- Primary implementer

**Frontend Developer (Support)** - 2 hours
- Code review
- Pair programming for complex sections
- Backup for rollback

**QA Tester** - 3 hours
- Test plan execution
- Visual regression testing
- User acceptance testing
- Bug reporting

**Product Owner** - 1 hour
- Requirements validation
- UAT participation
- Approval sign-off

### Tools & Software

**Development Tools**
- VS Code with ESLint, Prettier
- Node.js 18+ / npm
- Git version control
- Chrome DevTools

**Testing Tools**
- Jest (unit testing)
- React Testing Library
- Percy or Chromatic (visual regression)
- Lighthouse (performance)

**Deployment Tools**
- GitHub (version control)
- Vite build system
- npm scripts

### Third-Party Support
None required - internal implementation only

---

## Monitoring & Post-Implementation Review

### Success Metrics

**Technical Metrics**
- **Zero Critical Bugs:** No P0/P1 bugs within 48 hours
- **Performance:** Load time within 10% of baseline
- **Error Rate:** < 0.1% error rate in logs
- **Code Quality:** No new linting errors, 100% test coverage on converter

**Business Metrics**
- **Adoption:** 100% of CMS editors can successfully edit organizations
- **Efficiency:** 50% reduction in time to create new organization dashboard
- **User Satisfaction:** > 4/5 rating from CMS editors on new interface

### Monitoring Plan

**Immediate (0-24 hours)**
- Real-time error monitoring in application logs
- Performance metrics (Core Web Vitals)
- User feedback via Slack/email
- Manual smoke tests every 4 hours

**Short-term (1-7 days)**
- Daily error rate reports
- User adoption tracking (CMS edits performed)
- Performance trending
- Bug ticket volume

**Long-term (7-30 days)**
- Monthly metrics dashboard
- User satisfaction survey
- Technical debt assessment
- Lessons learned documentation

### Post-Implementation Review

**Review Meeting:** November 22, 2025 (1 week after deployment)

**Agenda:**
1. Metrics review (technical and business)
2. Issues encountered and resolution
3. User feedback summary
4. Lessons learned
5. Recommendations for ExecutiveIQ and Initiatives migrations

**Deliverables:**
- Post-implementation report
- Updated documentation
- Metrics dashboard
- Recommendations for next integration phase

### Issue Tracking

**Bug Severity Levels:**
- **P0 (Critical):** Feature broken, immediate rollback consideration
- **P1 (High):** Major functionality impaired, fix within 24 hours
- **P2 (Medium):** Minor issues, fix within 1 week
- **P3 (Low):** Nice-to-have improvements, backlog

**Escalation Path:**
1. Developer identifies issue → creates ticket
2. QA validates → assigns severity
3. P0/P1 → immediate Slack notification to tech lead
4. Tech lead evaluates rollback need
5. Fix or rollback decision within 1 hour for P0

---

## Appendices

### Appendix A: Expression Syntax Mapping

| Organization Syntax | Platform Syntax | Example |
|---------------------|-----------------|---------|
| `{{badge:success}}` | `[[badge]]success[[/badge]]` | Success badge |
| `{{trend:up}}` | `[[trend]]↑[[/trend]]` | Upward trend |
| `{{metric:43\|label\|unit}}` | `[[metric]]43[[/metric]]` | Numeric metric |
| `{{delta:12}}` | `[[delta]]+12[[/delta]]` | Change indicator |
| `{{bold:text}}` | `[[bold]]text[[/bold]]` | Bold text |
| `{{highlight:text}}` | `[[highlight]]text[[/highlight]]` | Highlighted text |
| `{{currency:890000}}` | `[[currency]]$890,000[[/currency]]` | Currency value |
| `{{percent:40}}` | `[[percent]]40%[[/percent]]` | Percentage |
| `{{icon:award}}` | `[[icon]]award[[/icon]]` | Icon display |

### Appendix B: File Structure Changes

**Before:**
```
src/data/organizations/
  ├── banking-na.json
  ├── payments.json
  ├── int-banking.json
  └── capital-markets.json
```

**After:**
```
cms-admin/src/templates/organizations/
  ├── banking-na.json (with metadata)
  ├── payments.json (with metadata)
  ├── int-banking.json (with metadata)
  └── capital-markets.json (with metadata)

src/data/organizations-archive/ (backup)
  ├── banking-na.json (original)
  ├── payments.json (original)
  ├── int-banking.json (original)
  └── capital-markets.json (original)
```

### Appendix C: Dependencies

**No External Dependencies**
- Uses existing RenderFactory
- Uses existing Template Builder
- Uses existing EditorModalV2
- No new npm packages required

---

**Document Version:** 1.0  
**Last Updated:** November 8, 2025  
**Next Review:** November 22, 2025
