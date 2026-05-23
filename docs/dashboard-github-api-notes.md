## Pending Enhancement: GitHub API Integration

**Direction:** GitHub REST API integration as the first dashboard enhancement
**Auth:** Personal access token (stored as environment variable in Cloud Run)
**Approach:** Use existing Redis caching and Express route patterns — slot into established architecture
**Demo data:** Point at own repo (`Str8-88s/devops-dashboard`) for live data
**Scope:** Start with one endpoint, build from there
**Why:** Free API, no new infrastructure required, always-live demo data from real repo activity
