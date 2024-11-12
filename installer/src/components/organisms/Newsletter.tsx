export default function Newsletter() {
	return (
		<aside id="newsletter" class="max-w-screen-lg px-3 py-6 mx-auto">
			<div class="flex flex-col items-center justify-between gap-6 sm:flex-row">
				<div class="sm:w-7/12">
					<h2 class="text-3xl font-bold">
						Subscribe to the
						<span class="text-transparent bg-gradient-to-br from-sky-500 to-cyan-400 bg-clip-text">
							update newsletters
						</span>
					</h2>
					<p class="mt-3 dark:text-gray-300">
						If you would like to be informed about software updates,
						you can subscribe to this newsletter.
					</p>
				</div>
				<div class="w-full sm:w-5/12">
					<form
						id="form-newsletter"
						class="flex px-4 py-2 bg-white rounded-full dark:bg-slate-800 focus-within:ring-2 focus-within:ring-cyan-600 hover:ring-2 hover:ring-cyan-600"
					>
						<input
							type="email"
							class="w-full appearance-none dark:bg-slate-800 focus:outline-none"
							placeholder="your@email-address.iot"
						/>
						<button
							id="button-newsletter"
							class="px-3 py-1 ml-2 text-sm font-semibold rounded-full text-sky-100 shrink-0 bg-gradient-to-br from-sky-500 to-cyan-400 hover:from-sky-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
							type="submit"
						>
							Subscribe
						</button>
					</form>
				</div>
			</div>
		</aside>
	);
}
