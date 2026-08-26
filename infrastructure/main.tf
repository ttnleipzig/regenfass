resource "listmonk_template" "campaign" {
  name    = "Regenfass Newsletter (DE/EN)"
  type    = "campaign"
  subject = "Default campaign template"
  body    = file("${path.module}/../web/templates/email/campaign.html")
}

resource "listmonk_template" "archive" {
  name    = "Regenfass Archive (DE/EN)"
  type    = "campaign"
  subject = "Default archive template"
  body    = file("${path.module}/../web/templates/email/archive.html")
}

resource "listmonk_template" "transactional" {
  name    = "Regenfass Transactional (DE/EN)"
  type    = "tx"
  subject = "regenfass Nachricht"
  body    = file("${path.module}/../web/templates/email/transactional.html")
}
