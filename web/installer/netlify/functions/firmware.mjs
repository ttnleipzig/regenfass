/**
 * Streams public release ZIPs through the installer origin, following GitHub redirects.
 * @param {Request} request
 */
export default async function handler(request) {
	const params = new URL(request.url).searchParams;
	const version = params.get("version");
	const environment = params.get("environment");
	if (
		!version ||
		!/^[a-zA-Z0-9._-]+$/.test(version) ||
		!environment ||
		!/^[a-zA-Z0-9_-]+$/.test(environment)
	) {
		return new Response("Invalid firmware version or environment", {
			status: 400,
		});
	}
	const tag = encodeURIComponent(version);
	const asset = `regenfass-${tag}-${encodeURIComponent(environment)}.zip`;
	try {
		const upstream = await fetch(
			`https://github.com/ttnleipzig/regenfass/releases/download/${tag}/${asset}`,
			{ redirect: "follow" },
		);
		if (!upstream.ok) {
			return new Response("Firmware download failed", {
				status: upstream.status,
			});
		}
		return new Response(upstream.body, {
			headers: { "Content-Type": "application/zip" },
		});
	} catch {
		return new Response("Firmware download failed", { status: 502 });
	}
}
