# Listmonk mit Terraform verwalten

Die versionierten Listmonk-E-Mail-Templates werden unter `infrastructure/`
mit Terraform verwaltet. Als Provider wird
[`Muravlev/listmonk`](https://github.com/Muravlev/terraform-provider-listmonk)
verwendet.

## Zuständigkeit

Terraform verwaltet ausschließlich diese drei HTML-Templates:

| Terraform-Ressource | Listmonk-Template | Live-ID |
| --- | --- | ---: |
| `listmonk_template.campaign` | Regenfass Newsletter (DE/EN) | 1 |
| `listmonk_template.archive` | Regenfass Archive (DE/EN) | 2 |
| `listmonk_template.transactional` | Regenfass Transactional (DE/EN) | 3 |

Die HTML-Quellen liegen unter `web/templates/email/`. Die Templates enthalten
deutsche und englische Zweige und wählen die Sprache über
`.Subscriber.Attribs.language`.

Listen, Kampagnen, Subscriber, Mitgliedschaften, globale Einstellungen,
Benutzer, Rollen, Versandhistorien, Analytics und Bounces werden nicht durch
diesen Provider verwaltet. Diese Bereiche bleiben in Listmonk beziehungsweise
bei den bestehenden API-/Deployment-Prozessen.

## Lokales Setup

Terraform benötigt einen Listmonk-Benutzernamen und ein API-Token. Zugangsdaten
dürfen nicht committed werden.

```sh
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars lokal ausfüllen
terraform init
terraform validate
```

Alternativ können CI-Systeme die Variablen als `TF_VAR_listmonk_username` und
`TF_VAR_listmonk_token` setzen. Die Datei `terraform.tfvars`, State-Dateien
und `.terraform/` sind über `.gitignore` ausgeschlossen. Der Terraform-State
kann trotzdem vertrauliche Provider-Daten enthalten und muss geschützt werden.

## Bestehende Templates importieren

Die bestehenden Templates werden einmalig importiert. Dadurch entstehen keine
Duplikate:

```sh
terraform import listmonk_template.campaign 1
terraform import listmonk_template.archive 2
terraform import listmonk_template.transactional 3
terraform plan
```

Vor jedem Apply den Plan prüfen. Erwartete Änderungen sind ausschließlich
bewusste Änderungen an Namen oder HTML-Inhalten der drei Templates.

## Änderungen veröffentlichen

1. HTML-Datei unter `web/templates/email/` ändern.
2. `terraform fmt -check`, `terraform validate` und `terraform plan` ausführen.
3. Den Plan prüfen und mit `terraform apply` bestätigen.
4. Die Listmonk-Vorschau für Kampagnen- und Transaktionsmails kontrollieren.

Bei Änderungen über die Listmonk-Oberfläche muss die passende Datei im
Repository im selben Change aktualisiert werden. So bleiben Live-Templates
und Repository-Kopien synchron.

## Checks

```sh
terraform fmt -check
terraform validate
terraform plan
git diff --check
```

Für produktive oder gemeinsam genutzte Workflows sollte der State in einem
geschützten Remote-Backend liegen. Das lokale Setup richtet bewusst kein
Backend und keine zusätzliche Terraform-Bridge für Listmonk-Listen oder
Kampagnen ein.
