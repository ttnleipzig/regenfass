# Listmonk infrastructure

This directory manages the three versioned email templates used by the
self-hosted Listmonk instance at `news.regenfass.eu`.

## Managed resources

| Terraform resource | Listmonk template | Live ID |
| --- | --- | ---: |
| `listmonk_template.campaign` | Regenfass Newsletter (DE/EN) | 1 |
| `listmonk_template.archive` | Regenfass Archive (DE/EN) | 2 |
| `listmonk_template.transactional` | Regenfass Transactional (DE/EN) | 3 |

The resource bodies are loaded from `../web/templates/email/`. Each template
contains German and English branches selected by
`.Subscriber.Attribs.language`; keep those repository copies synchronized with
the active Listmonk templates.

## Provider limitation

The selected `Muravlev/listmonk` provider currently exposes only the
`listmonk_template` resource. Lists, campaigns, global settings, users, roles,
subscribers, memberships, delivery history, analytics, and bounces are not
managed by this Terraform configuration. Lists and campaigns remain managed
through the Listmonk UI or its API.

## Setup

Use a local ignored variables file or environment-backed Terraform variables;
never commit credentials:

```sh
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars locally
terraform init
terraform validate
```

For CI, provide `TF_VAR_listmonk_username` and `TF_VAR_listmonk_token` instead
of creating a variables file.

## Import the existing templates

The live resources must be imported once into the local or remote Terraform
state. Import does not create duplicate templates:

```sh
terraform import listmonk_template.campaign 1
terraform import listmonk_template.archive 2
terraform import listmonk_template.transactional 3
terraform plan
```

Review the plan before applying. A clean state should show no changes when the
repository copies and live templates are synchronized. Terraform state can
contain provider-managed metadata and must be stored securely; use a protected
remote backend for shared or CI usage.

## Checks

```sh
terraform fmt -check
terraform validate
terraform plan
```
