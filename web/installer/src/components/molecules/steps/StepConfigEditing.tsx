import {
	IconClearAll,
	IconDeviceFloppy,
	IconFileExport,
	IconFileImport,
} from "@tabler/icons-solidjs";
import { copyTextToClipboard } from "@/libs/copyToClipboard.ts";
import {
	ConfigFileError,
	downloadConfigAsJson,
	readConfigFromFile,
} from "@/libs/downloadConfig.ts";
import { playErrorSound } from "@/libs/errorSound.ts";
import { BiRegularClipboard, BiRegularX } from "solid-icons/bi";
import { For, Show, createSignal, onCleanup } from "solid-js";
import {
	AlertDescription,
	AlertInline,
	AlertTitle,
	AppKeyHexField,
	Button,
	TextFieldRoot,
} from "@regenfass/brand";
import {
	OTPField,
	OTPFieldGroup,
	OTPFieldInput,
	OTPFieldSlot,
} from "@regenfass/brand";
import { useInstallerT } from "@/i18n/index.ts";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

type HexOtp16Field = "appEUI" | "devEUI";

function HexOtp16(props: {
	labelText: string;
	inputId: string;
	field: HexOtp16Field;
	value: string;
	onValueChange: (value: string) => void;
	showCopyButton?: boolean;
}) {
	const t = useInstallerT();
	const [copied, setCopied] = createSignal(false);
	let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

	const copyToClipboard = async () => {
		if (!props.value) return;
		const ok = await copyTextToClipboard(props.value.toUpperCase());
		if (!ok) {
			console.error(`Failed to copy ${props.labelText}`);
			return;
		}
		setCopied(true);
		clearTimeout(copiedTimeout);
		copiedTimeout = setTimeout(() => setCopied(false), 2000);
	};

	onCleanup(() => {
		clearTimeout(copiedTimeout);
	});

	const copyLabel = () =>
		copied()
			? t("configEditing.copied", { label: props.labelText })
			: t("configEditing.copyToClipboard", { label: props.labelText });

	return (
		<>
			<label
				class="block text-sm font-medium leading-none tracking-tight text-foreground"
				for={props.inputId}
			>
				<span class="font-mono text-xs uppercase text-muted-foreground">
					{props.labelText}
				</span>
			</label>
			<div class="mt-2 flex items-center gap-1.5">
				<OTPField
					class="gap-1.5"
					maxLength={16}
					value={props.value}
					onValueChange={props.onValueChange}
				>
					<OTPFieldInput
						id={props.inputId}
						name={props.field}
						pattern="^[0-9A-Fa-f]*$"
						autocomplete="off"
					/>
					<For each={[0, 2, 4, 6, 8, 10, 12, 14]}>
						{(pairStart) => (
							<OTPFieldGroup>
								<OTPFieldSlot index={pairStart} />
								<OTPFieldSlot index={pairStart + 1} />
							</OTPFieldGroup>
						)}
					</For>
				</OTPField>
				<Show when={props.showCopyButton}>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class="h-9 w-9 shrink-0 text-muted-foreground"
						disabled={!props.value}
						aria-label={copyLabel()}
						onClick={copyToClipboard}
					>
						<BiRegularClipboard aria-hidden={true} size={16} />
					</Button>
				</Show>
				<Show when={props.value}>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class="h-9 w-9 shrink-0 text-muted-foreground"
						aria-label={t("configEditing.clearField", {
							label: props.labelText,
						})}
						onClick={() => props.onValueChange("")}
					>
						<BiRegularX aria-hidden={true} size={16} />
					</Button>
				</Show>
			</div>
		</>
	);
}

export default function StepConfigEditing({ state, emitEvent }: StepProps) {
	const t = useInstallerT();
	const [importError, setImportError] = createSignal<string | null>(null);
	let fileInputRef: HTMLInputElement | undefined;

	const handleLoadFromFileClick = () => {
		setImportError(null);
		fileInputRef?.click();
	};

	const handleFileInputChange = async (event: Event) => {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		setImportError(null);
		try {
			const { config, configVersion } = await readConfigFromFile(file);
			emitEvent({
				type: "config.loadFromFile",
				config,
				...(configVersion != null ? { configVersion } : {}),
			});
		} catch (error) {
			playErrorSound();
			if (error instanceof ConfigFileError) {
				setImportError(error.message);
			} else {
				setImportError(t("configEditing.couldNotReadFile"));
			}
		} finally {
			input.value = "";
		}
	};

	return (
		<div class="rounded-xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50 dark:ring-border/80">
			<header class="mb-6 space-y-1.5 border-b border-border pb-5">
				<h2 class="text-base font-semibold leading-tight tracking-tight text-foreground">
					{t("configEditing.heading")}
				</h2>
				<p class="max-w-prose text-sm leading-relaxed text-muted-foreground">
					{t("configEditing.description")}
				</p>
			</header>

			<div class="space-y-6">
				{/* TODO: Autogenerate fields from ConfigV<T> objects */}
				<TextFieldRoot class="space-y-0">
					<HexOtp16
						labelText={t("configEditing.fieldAppEui")}
						inputId="appEUI-otp"
						field="appEUI"
						value={state.context.deviceInfo.config.appEUI}
						showCopyButton
						onValueChange={(value) =>
							emitEvent({
								type: "config.changeField",
								field: "appEUI",
								value,
							})
						}
					/>
				</TextFieldRoot>

				<TextFieldRoot class="space-y-0">
					<HexOtp16
						labelText={t("configEditing.fieldDevEui")}
						inputId="devEUI-otp"
						field="devEUI"
						value={state.context.deviceInfo.config.devEUI}
						showCopyButton
						onValueChange={(value) =>
							emitEvent({
								type: "config.changeField",
								field: "devEUI",
								value,
							})
						}
					/>
				</TextFieldRoot>

				<TextFieldRoot class="space-y-0">
					<label
						class="block text-sm font-medium leading-none tracking-tight text-foreground"
						for="appKey-input"
					>
						<span class="font-mono text-xs uppercase text-muted-foreground">
							{t("configEditing.fieldAppKey")}
						</span>
					</label>
					<div class="mt-2">
						<AppKeyHexField
							id="appKey-input"
							name="appKey"
							value={state.context.deviceInfo.config.appKey ?? ""}
							showCopyButton
							showResetButton
							onCanonicalChange={(next) => {
								if (next !== (state.context.deviceInfo.config.appKey ?? "")) {
									emitEvent({
										type: "config.changeField",
										field: "appKey",
										value: next,
									});
								}
							}}
						/>
					</div>
				</TextFieldRoot>
			</div>

			<Show when={importError()}>
				{(message) => (
					<AlertInline variant="destructive" class="mt-6">
						<AlertTitle>{t("configEditing.importErrorTitle")}</AlertTitle>
						<AlertDescription>{message()}</AlertDescription>
					</AlertInline>
				)}
			</Show>

			<input
				ref={fileInputRef}
				type="file"
				accept=".json,application/json"
				class="sr-only"
				aria-label={t("configEditing.loadFromFileAriaLabel")}
				onChange={handleFileInputChange}
			/>

			<footer class="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
				<div class="flex flex-wrap gap-2">
					<Button
						class="gap-1.5"
						variant="outline"
						size="sm"
						onClick={() => emitEvent({ type: "config.clear" })}
					>
						<IconClearAll aria-hidden={true} size={16} stroke="1.75" />
						{t("configEditing.clear")}
					</Button>
					<Button
						class="gap-1.5"
						variant="outline"
						size="sm"
						onClick={handleLoadFromFileClick}
					>
						<IconFileImport aria-hidden={true} size={16} stroke="1.75" />
						{t("configEditing.loadFromFile")}
					</Button>
					<Button
						class="gap-1.5"
						variant="outline"
						size="sm"
						onClick={() =>
							downloadConfigAsJson(
								state.context.deviceInfo.config,
								state.context.deviceInfo.configVersion,
							)
						}
					>
						<IconFileExport aria-hidden={true} size={16} stroke="1.75" />
						{t("configEditing.saveToFile")}
					</Button>
				</div>
				<Button
					class="gap-1.5 sm:min-w-[7rem]"
					onClick={() => emitEvent({ type: "config.next" })}
				>
					<IconDeviceFloppy aria-hidden={true} size={16} stroke="1.75" />
					{t("configEditing.saveToDevice")}
				</Button>
			</footer>
		</div>
	);
}
