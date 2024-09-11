import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SelectBaseItemComponentProps } from "@kobalte/core/src/select/select-base.jsx";
import { SelectValueState } from "@kobalte/core/src/select/select-value.jsx";

export const connectStep = {
	title: "Connect",
	render: Connect,
	canGoNext() {
		return true;
	},
};

function Connect() {
	return (
		<div class="flex flex-col gap-4">
			<p>
				Connect your microcontroller with an USB cable to your computer
				or phone and select your board.
			</p>

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
