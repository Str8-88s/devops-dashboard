# ADR-004: Workload Identity Federation for GCP Authentication in CI/CD

## Status
Accepted

## Context
The GitHub Actions CI/CD pipeline needs to authenticate with Google Cloud Platform to push Docker images to Artifact Registry and deploy to Cloud Run. The standard approach is to create a GCP service account, export a JSON key, and store it as a GitHub Secret.

During setup, the GCP organization policy had `constraints/iam.disableServiceAccountKeyCreation` enforced, which blocked service account key creation entirely. An alternative authentication mechanism was required.

## Decision
Use Workload Identity Federation (WIF) to authenticate GitHub Actions with GCP. WIF allows GitHub Actions to prove its identity using a short-lived OIDC token issued by GitHub, which GCP exchanges for a short-lived GCP access token. No long-lived credentials are stored anywhere.

Setup required:
1. Creating a Workload Identity Pool and Provider in GCP linked to the GitHub OIDC issuer
2. Binding the pool to a GCP service account with the necessary IAM roles
3. Using `google-github-actions/auth` in the workflow with the pool and service account details

## Alternatives Considered

**Service account JSON key stored in GitHub Secrets** — blocked by org policy. Even without the policy constraint, this approach stores a long-lived credential that remains valid until manually rotated, creates a secret that must be managed and audited, and represents a significant blast radius if the secret is ever exposed.

**Manual deployment (no CI/CD)** — rejected. Automated deployment is a core requirement of the project and a portfolio signal.

## Consequences

- No long-lived credentials stored in GitHub Secrets or anywhere else
- Access tokens are scoped to the specific workflow run and expire automatically
- WIF setup is more involved than dropping a JSON key into a secret — requires IAM configuration in GCP that is easy to get wrong
- The approach is the current GCP-recommended best practice and demonstrates awareness of credential hygiene beyond the basics
- If the GCP org policy is ever relaxed, WIF remains the better approach regardless
