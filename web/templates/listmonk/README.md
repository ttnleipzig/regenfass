# Listmonk static templates

The files in `email-templates/` are overrides for Listmonk system emails. They
are kept in the repository because Listmonk's system templates are loaded from
the deployment's `--static-dir`, not managed in the admin template screen.

To deploy them, copy the complete Listmonk `static/` directory for the pinned
Listmonk version and overlay these files at
`static/email-templates/`. Start Listmonk with that directory as `--static-dir`.

The opt-in templates use `Subscriber.Attribs.language` and fall back to German.
Keep the live files and these repository copies synchronized whenever either
side changes.
