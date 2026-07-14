import type { Component } from "solid-js";
import { Spinner } from "./Spinner.tsx";
import "./SpinnerConfetti.css";

const SpinnerConfetti: Component = () => {
	return (
		<div class="flex items-center justify-center w-32 h-32">
			<div class="relative flex h-24 w-24 items-center justify-center">
				<Spinner
					size="lg"
					class="spinner-confetti__spinner relative z-10 text-primary"
				/>
				<div
					class="spinner-confetti__ring absolute inset-0"
					aria-hidden="true"
				>
					<div class="spinner-confetti__orbit spinner-confetti__orbit--1">
						<div class="spinner-confetti__shard bg-red-500" />
					</div>
					<div class="spinner-confetti__orbit spinner-confetti__orbit--2">
						<div class="spinner-confetti__shard bg-blue-500" />
					</div>
					<div class="spinner-confetti__orbit spinner-confetti__orbit--3">
						<div class="spinner-confetti__shard bg-green-500" />
					</div>
					<div class="spinner-confetti__orbit spinner-confetti__orbit--4">
						<div class="spinner-confetti__shard bg-yellow-500" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default SpinnerConfetti;
