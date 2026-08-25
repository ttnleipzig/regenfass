import {
	AlertDescription,
	AlertInline,
	AlertTitle,
	Button,
	Spinner,
} from "@regenfass/brand";
import IconClipboard from "lucide-solid/icons/clipboard";
import IconCloudUpload from "lucide-solid/icons/cloud-upload";
import IconExternalLink from "lucide-solid/icons/external-link";
import { Show, createSignal, onCleanup } from "solid-js";
import { useInstallerT } from "@/i18n/index.ts";
import { ApiError, getDeviceInfo, registerDevice } from "@/libs/api.ts";
import { cn } from "@/libs/cn.ts";
import { copyTextToClipboard } from "@/libs/copyToClipboard.ts";
import { addDeviceToken } from "@/libs/subscriptions.ts";

const DEV_EUI_PATTERN = /^[0-9A-Fa-f]{16}$/;

type Enrollment = { readWrite: string; readOnly: string };

/** One token with a copy button; tokens are the only way back to a device. */
function TokenRow(props: { label: string; token: string }) {
	const t = useInstallerT();
	const [copied, setCopied] = createSignal(false);
	let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

	const copy = async () => {
		if (!(await copyTextToClipboard(props.token))) {
			console.error(`Failed to copy ${props.label}`);
			return;
		}
		setCopied(true);
		clearTimeout(copiedTimeout);
		copiedTimeout = setTimeout(() => setCopied(false), 2000);
	};

	onCleanup(() => {
		clearTimeout(copiedTimeout);
	});

	return (
		<div class="space-y-1">
			<span class="font-mono text-xs uppercase text-muted-foreground">
				{props.label}
			</span>
			<div class="flex items-center gap-1.5">
				<code class="min-w-0 flex-1 truncate rounded-md border border-border/70 bg-muted/50 px-2 py-1.5 font-mono text-xs">
					{props.token}
				</code>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class="h-9 w-9 shrink-0 text-muted-foreground"
					aria-label={
						copied()
							? t("finishShowingNextSteps.cloud.tokenCopied", {
									label: props.label,
								})
							: t("finishShowingNextSteps.cloud.copyToken", {
									label: props.label,
								})
					}
					onClick={copy}
				>
					<IconClipboard aria-hidden={true} size={16} />
				</Button>
			</div>
		</div>
	);
}

/**
 * Enrolls the freshly configured device in the Regenfass Cloud. The backend only
 * stores uplinks for devices it already knows, so enrolling is what makes the
 * device's measurements show up on the dashboard. The read-write token is stored
 * as a local subscription so the dashboard picks the device up right away.
 */
export default function CloudEnrollment(props: { devEUI?: string }) {
	const t = useInstallerT();

	const devEUI = () => (props.devEUI ?? "").trim().toUpperCase();
	const canEnroll = () => DEV_EUI_PATTERN.test(devEUI());

	const [busy, setBusy] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);
	const [enrollment, setEnrollment] = createSignal<Enrollment | null>(null);

	const enroll = async () => {
		if (busy() || !canEnroll()) return;
		setError(null);
		setBusy(true);
		try {
			const created = await registerDevice(devEUI());

			// The register response carries no device id, but the dashboard needs
			// one to map a device back to its token (renaming, history, removal).
			// A failed lookup is not worth losing the enrollment over — subscribe
			// without the mapping and let the dashboard fill it in later.
			let deviceID: string | undefined;
			try {
				deviceID = (await getDeviceInfo(created.read_write_token)).device_id;
			} catch (err) {
				console.error("Could not resolve enrolled device", err);
			}
			addDeviceToken(created.read_write_token, deviceID);

			setEnrollment({
				readWrite: created.read_write_token,
				readOnly: created.read_only_token,
			});
		} catch (err) {
			if (err instanceof ApiError && err.status === 409) {
				setError(t("finishShowingNextSteps.cloud.alreadyEnrolled"));
			} else {
				setError(
					t("finishShowingNextSteps.cloud.failed", {
						message: err instanceof Error ? err.message : String(err),
					}),
				);
			}
		} finally {
			setBusy(false);
		}
	};

	return (
		<AlertInline
			class={cn(
				"[&:has(svg)]:px-6 sm:[&:has(svg)]:px-7",
				"border-border/70 bg-card/80 shadow-sm dark:bg-card/75",
			)}
		>
			<div class="flex gap-4 sm:items-start">
				<div class="relative flex size-12 shrink-0 items-center justify-center">
					<div
						class={cn(
							"relative z-10 flex size-12 items-center justify-center rounded-full",
							"bg-muted/80 ring-1 ring-border/60",
						)}
					>
						<IconCloudUpload
							class="text-foreground/70"
							size={24}
							strokeWidth={2}
							aria-hidden="true"
						/>
					</div>
				</div>
				<div class="min-w-0 flex-1 space-y-3 pt-0.5">
					<div class="space-y-1.5">
						<AlertTitle class="text-base font-semibold leading-snug tracking-tight text-foreground">
							<Show
								when={enrollment()}
								fallback={t("finishShowingNextSteps.cloud.title")}
							>
								{t("finishShowingNextSteps.cloud.enrolledTitle")}
							</Show>
						</AlertTitle>
						<AlertDescription class="text-sm leading-relaxed text-muted-foreground">
							<Show
								when={enrollment()}
								fallback={t("finishShowingNextSteps.cloud.body")}
							>
								{t("finishShowingNextSteps.cloud.enrolledBody")}
							</Show>
						</AlertDescription>
						<Show when={!enrollment() && !canEnroll()}>
							<AlertDescription class="text-sm leading-relaxed text-muted-foreground">
								{t("finishShowingNextSteps.cloud.missingDevEui")}
							</AlertDescription>
						</Show>
					</div>

					{/* The surrounding AlertInline is already a live region, so the
					    message is announced without a nested role="alert". */}
					<Show when={error()}>
						{(message) => (
							<p class="text-sm leading-relaxed text-destructive">{message()}</p>
						)}
					</Show>

					<Show
						when={enrollment()}
						fallback={
							<Button
								type="button"
								class="w-full sm:w-auto"
								disabled={!canEnroll() || busy()}
								onClick={enroll}
							>
								<Show when={busy()}>
									<Spinner size="sm" class="mr-2" />
								</Show>
								{busy()
									? t("finishShowingNextSteps.cloud.enrolling")
									: error()
										? t("finishShowingNextSteps.cloud.retry")
										: t("finishShowingNextSteps.cloud.enroll")}
							</Button>
						}
					>
						{(tokens) => (
							<div class="space-y-3">
								<TokenRow
									label={t("finishShowingNextSteps.cloud.readWriteToken")}
									token={tokens().readWrite}
								/>
								<TokenRow
									label={t("finishShowingNextSteps.cloud.readOnlyToken")}
									token={tokens().readOnly}
								/>
								<Button
									as="a"
									href="/"
									class="w-full sm:w-auto"
								>
									{t("finishShowingNextSteps.cloud.openDashboard")}
									<IconExternalLink
										class="ml-2"
										size={16}
										aria-hidden="true"
									/>
								</Button>
							</div>
						)}
					</Show>
				</div>
			</div>
		</AlertInline>
	);
}
