import { Headline } from "@/components/atoms/Headline.tsx";
import { Button } from "@/components/atoms/Button.tsx";
import {
	TextFieldRoot,
	TextFieldInput,
} from "@/components/forms/TextField.tsx";
import { cn } from "@/libs/cn.ts";

export default function Newsletter() {
	return (
		<aside id="newsletter" class="max-w-screen-lg px-3 py-6 mx-auto">
			<div class="flex flex-col items-center justify-between gap-6 sm:flex-row">
				<div class="sm:w-7/12">
					<Headline as="h2">
						Subscribe to the
						<span class="text-transparent bg-gradient-to-br from-sky-500 to-cyan-400 bg-clip-text">
							update newsletters
						</span>
					</Headline>
					<p class="mt-3 text-muted-foreground">
						If you would like to be informed about software updates,
						you can subscribe to this newsletter.
					</p>
				</div>
				<div class="w-full sm:w-5/12">
					<form
						id="form-newsletter"
						class={cn(
							"flex px-4 py-2 bg-background rounded-full",
							"focus-within:ring-2 focus-within:ring-ring",
							"hover:ring-2 hover:ring-ring/50",
							"border border-input"
						)}
					>
						<TextFieldRoot class="flex-1">
							<TextFieldInput
								type="email"
								class="w-full appearance-none bg-transparent focus:outline-none border-0"
								placeholder="your@email-address.iot"
							/>
						</TextFieldRoot>
						<Button
							id="button-newsletter"
							class="px-3 py-1 ml-2 text-sm font-semibold rounded-full shrink-0 bg-gradient-to-br from-sky-500 to-cyan-400 hover:from-sky-700 hover:to-cyan-600 text-white"
							type="submit"
						>
							Subscribe
						</Button>
					</form>
				</div>
			</div>
		</aside>
	);
}
