import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import { FileUploader } from "@/components/forms/FileUploader.tsx";

describe("FileUploader", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders file input", () => {
		const { container } = render(() => <FileUploader />);
		const input = container.querySelector('input[type="file"]');
		expect(input).toBeInTheDocument();
	});

	it("renders with label", () => {
		render(() => <FileUploader label="Upload File" />);
		expect(screen.getByText("Upload File")).toBeInTheDocument();
	});

	it("shows required indicator when required is true", () => {
		render(() => <FileUploader label="Upload File" required />);
		expect(screen.getByText("*")).toBeInTheDocument();
	});

	it("displays error message", () => {
		const errorMessage = "File is required";
		render(() => (
			<FileUploader label="Upload File" error={errorMessage} />
		));
		const error = screen.getByText(errorMessage);
		expect(error).toBeInTheDocument();
		expect(error).toHaveAttribute("role", "alert");
	});

	it("displays helper text", () => {
		const helperText = "Select a file to upload";
		render(() => (
			<FileUploader label="Upload File" helperText={helperText} />
		));
		expect(screen.getByText(helperText)).toBeInTheDocument();
	});

	it("renders select button", () => {
		render(() => <FileUploader label="Upload File" />);
		expect(screen.getByText("Datei auswählen")).toBeInTheDocument();
	});

	it("calls onFileSelect when file is selected", () => {
		const handleFileSelect = vi.fn();
		const { container } = render(() => (
			<FileUploader label="Upload File" onFileSelect={handleFileSelect} />
		));
		const input = container.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		const file = new File(["content"], "test.txt", { type: "text/plain" });
		const fileList = {
			0: file,
			length: 1,
			item: (index: number) => (index === 0 ? file : null),
		} as FileList;

		Object.defineProperty(input, "files", {
			value: fileList,
			writable: false,
		});

		fireEvent.change(input);
		expect(handleFileSelect).toHaveBeenCalled();
	});

	it("displays selected files", () => {
		const { container } = render(() => (
			<FileUploader label="Upload File" />
		));
		const input = container.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		const file = new File(["content"], "test.txt", { type: "text/plain" });
		const fileList = {
			0: file,
			length: 1,
			item: (index: number) => (index === 0 ? file : null),
		} as FileList;

		Object.defineProperty(input, "files", {
			value: fileList,
			writable: false,
		});

		fireEvent.change(input);
		expect(screen.getByText("Ausgewählte Dateien:")).toBeInTheDocument();
		expect(screen.getByText(/test\.txt/)).toBeInTheDocument();
	});

	it("shows delete button when files are selected", () => {
		const { container } = render(() => (
			<FileUploader label="Upload File" />
		));
		const input = container.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		const file = new File(["content"], "test.txt", { type: "text/plain" });
		const fileList = {
			0: file,
			length: 1,
			item: (index: number) => (index === 0 ? file : null),
		} as FileList;

		Object.defineProperty(input, "files", {
			value: fileList,
			writable: false,
		});

		fireEvent.change(input);
		expect(screen.getByText("Löschen")).toBeInTheDocument();
	});

	it("clears files when delete button is clicked", () => {
		const handleFileSelect = vi.fn();
		const { container } = render(() => (
			<FileUploader label="Upload File" onFileSelect={handleFileSelect} />
		));
		const input = container.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		const file = new File(["content"], "test.txt", { type: "text/plain" });
		const fileList = {
			0: file,
			length: 1,
			item: (index: number) => (index === 0 ? file : null),
		} as FileList;

		Object.defineProperty(input, "files", {
			value: fileList,
			writable: false,
		});

		fireEvent.change(input);
		const deleteButton = screen.getByText("Löschen");
		fireEvent.click(deleteButton);
		expect(handleFileSelect).toHaveBeenCalledWith(null);
	});

	it("applies custom class", () => {
		const { container } = render(() => (
			<FileUploader label="Upload File" class="custom-class" />
		));
		const wrapper = container.querySelector("div.space-y-3");
		expect(wrapper).toHaveClass("custom-class");
	});

	it("supports multiple file selection", () => {
		const { container } = render(() => (
			<FileUploader label="Upload File" multiple />
		));
		const input = container.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		expect(input).toHaveAttribute("multiple");
	});

	it("supports accept attribute", () => {
		const { container } = render(() => (
			<FileUploader label="Upload File" accept="image/*" />
		));
		const input = container.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		expect(input).toHaveAttribute("accept", "image/*");
	});
});
