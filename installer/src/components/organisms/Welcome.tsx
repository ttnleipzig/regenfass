export default function Welcome() {
	return (
		<p>
			This project is about a smart water tank. It measures the water
			level and sends the data to a server. The server can be used to
			control the water pump. The pump can be controlled via a web
			interface or via a telegram bot. It uses a HC-SR04 ultrasonic sensor
			to measure the water level. The data is sent to{" "}
			<span class="text-transparent bg-gradient-to-br from-sky-500 to-cyan-400 bg-clip-text">
				The Things Network
			</span>{" "}
			via a{" "}
			<span class="text-transparent bg-gradient-to-br from-sky-500 to-cyan-400 bg-clip-text">
				LoRaWAN
			</span>{" "}
			gateway.
		</p>
	);
}
