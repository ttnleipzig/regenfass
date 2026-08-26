resource "listmonk_template" "campaign" {
  name    = "Default campaign template"
  type    = "campaign"
  subject = ""
  body    = file("${path.module}/../web/templates/email/campaign.html")
}

resource "listmonk_template" "archive" {
  name    = "Default archive template"
  type    = "campaign"
  subject = ""
  body    = file("${path.module}/../web/templates/email/archive.html")
}

resource "listmonk_template" "transactional" {
  name    = "Sample transactional template"
  type    = "tx"
  subject = "regenfass Nachricht"
  body    = file("${path.module}/../web/templates/email/transactional.html")
}
