import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SelectBaseItemComponentProps } from "@kobalte/core/src/select/select-base.jsx";
import { SelectValueState } from "@kobalte/core/src/select/select-value.jsx";
import Status from "@/components/molecules/Status";

export const connectStep = {
	title: "Connect",
	render: Connect,
	canGoNext() {
		return true;
	},
};

const statusChecks = [
	{
		title: "Connection",
	},
	{
		title: "Port",
	},
	{
		title: "Readable",
	},
    	{
		title: "Writable",
	},
	{
		title: "Executable",
	},
	{
		title: "Flashable",
	},
]

function Connect() {
	return (
		<div class="flex flex-col gap-4">
			<p>
				Connect your microcontroller with an USB cable to your computer
				or phone and select your board.
			</p>
			<ol class="ml-4 text-gray-700 list-inside dark:text-gray-400">
				<li class="flex items-center gap-3"><span class="text-4xl text-sky-500">❶</span> <span>Connect
						your
						microcontroller with an USB cable to your computer.</span></li>
				<li class="flex items-center gap-3"><span class="text-4xl text-sky-500">❷</span> <span>Select
						the
						microcontroller type from the drop down.</span></li>
				<li class="flex items-center gap-3"><span class="text-4xl text-sky-500">❸</span> <span>Click the
						install button.</span></li>
			</ol>
			<For each={statusChecks} >
			  {(item) => <Status title={item.title} />}
			</For>

			<Select
				class="mx-auto"
				options={[
					// ["heltec-lora32", "Heltec LoRa32"],
					// ["generic-esp32", "Generic ESP32"],
					"Heltec LoRa32",
					"Generic ESP32",
				]}
				placeholder="Select a board..."
				itemComponent={(
					props: SelectBaseItemComponentProps<[string, string]>
				) => (
					<SelectItem
						item={props.item}
						// value={props.item.rawValue[0]}
					>
						{/* {props.item.rawValue[1]} */}
						{props.item.rawValue}
					</SelectItem>
				)}
			>
				<SelectTrigger class="w-[180px]">
					<SelectValue<[string, string]>>
						{(state: SelectValueState<[string, string]>) =>
							state.selectedOption()
						}
					</SelectValue>
				</SelectTrigger>

				<SelectContent />
			</Select>
		</div>
	);
}
