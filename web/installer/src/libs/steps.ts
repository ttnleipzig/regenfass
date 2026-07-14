import { configurationStep } from "@/components/molecules/steps/Configuration";
import { connectStep } from "@/components/molecules/steps/Connect";
import { finishStep } from "@/components/molecules/steps/Finish";
import { installStep } from "@/components/molecules/steps/Install";
import { JSX } from "solid-js";

export type Step = {
	title: string;
	render(): JSX.Element;
	canGoNext?(): boolean;
	preNext?(): Promise<void>;
};

export const steps: Step[] = [connectStep, installStep, configurationStep, finishStep];
