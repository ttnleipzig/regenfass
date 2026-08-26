# Regenfass email templates

These files are the versioned source for the email templates configured in the
self-hosted listmonk instance at `news.regenfass.eu`.

| File | listmonk template |
| --- | --- |
| `campaign.html` | Default campaign template (ID 1) |
| `archive.html` | Default archive template (ID 2) |
| `transactional.html` | Sample transactional template (ID 3) |

The templates are standalone HTML because listmonk stores each template as a
complete document. Keep the listmonk template placeholders intact when editing
or importing them.

Campaign content can branch on `{{ .Subscriber.Attribs.language }}`. English is
selected only for the exact value `en`; missing or unknown values fall back to
German. System-email overrides are kept separately in `../listmonk/email-templates/`
because Listmonk loads those from its configured static directory.
