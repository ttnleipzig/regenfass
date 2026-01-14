import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/molecules/AlertDialog.tsx";

describe("AlertDialogHeader", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders header element", () => {
    const { container } = render(() => (
      <AlertDialogHeader>Header content</AlertDialogHeader>
    ));
    const header = container.querySelector("div");
    expect(header).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(() => <AlertDialogHeader>Header text</AlertDialogHeader>);
    expect(screen.getByText("Header text")).toBeInTheDocument();
  });

  it("merges custom classes", () => {
    const { container } = render(() => (
      <AlertDialogHeader class="custom-class">Header</AlertDialogHeader>
    ));
    const header = container.querySelector("div");
    expect(header).toHaveClass("custom-class");
  });

  it("applies correct styling classes", () => {
    const { container } = render(() => (
      <AlertDialogHeader>Header</AlertDialogHeader>
    ));
    const header = container.querySelector("div");
    expect(header).toHaveClass("flex", "flex-col", "space-y-2");
  });
});

describe("AlertDialogHeader", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders header element", () => {
    const { container } = render(() => (
      <AlertDialogHeader>Header content</AlertDialogHeader>
    ));
    const header = container.querySelector("div");
    expect(header).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(() => <AlertDialogHeader>Header text</AlertDialogHeader>);
    expect(screen.getByText("Header text")).toBeInTheDocument();
  });

  it("merges custom classes", () => {
    const { container } = render(() => (
      <AlertDialogHeader class="custom-class">Header</AlertDialogHeader>
    ));
    const header = container.querySelector("div");
    expect(header).toHaveClass("custom-class");
  });
});

describe("AlertDialogFooter", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders footer element", () => {
    const { container } = render(() => (
      <AlertDialogFooter>Footer content</AlertDialogFooter>
    ));
    const footer = container.querySelector("div");
    expect(footer).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(() => <AlertDialogFooter>Footer text</AlertDialogFooter>);
    expect(screen.getByText("Footer text")).toBeInTheDocument();
  });

  it("merges custom classes", () => {
    const { container } = render(() => (
      <AlertDialogFooter class="custom-class">Footer</AlertDialogFooter>
    ));
    const footer = container.querySelector("div");
    expect(footer).toHaveClass("custom-class");
  });

  it("applies correct styling classes", () => {
    const { container } = render(() => (
      <AlertDialogFooter>Footer</AlertDialogFooter>
    ));
    const footer = container.querySelector("div");
    expect(footer).toHaveClass("flex", "flex-col-reverse");
  });
});

describe("AlertDialogTitle", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders title element", () => {
    render(() => <AlertDialogTitle>Dialog Title</AlertDialogTitle>);
    expect(screen.getByText("Dialog Title")).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    const { container } = render(() => (
      <AlertDialogTitle>Title</AlertDialogTitle>
    ));
    const title = container.querySelector("h2");
    expect(title).toHaveClass("text-lg", "font-semibold");
  });

  it("merges custom classes", () => {
    const { container } = render(() => (
      <AlertDialogTitle class="custom-class">Title</AlertDialogTitle>
    ));
    const title = container.querySelector("h2");
    expect(title).toHaveClass("custom-class");
  });
});

describe("AlertDialogDescription", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders description element", () => {
    render(() => (
      <AlertDialogDescription>Dialog Description</AlertDialogDescription>
    ));
    expect(screen.getByText("Dialog Description")).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    const { container } = render(() => (
      <AlertDialogDescription>Description</AlertDialogDescription>
    ));
    const desc = container.querySelector("p");
    expect(desc).toHaveClass("text-sm", "text-muted-foreground");
  });

  it("merges custom classes", () => {
    const { container } = render(() => (
      <AlertDialogDescription class="custom-class">Description</AlertDialogDescription>
    ));
    const desc = container.querySelector("p");
    expect(desc).toHaveClass("custom-class");
  });
});

describe("AlertDialog composition", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders complete dialog structure", () => {
    render(() => (
      <AlertDialogHeader>
        <AlertDialogTitle>Title</AlertDialogTitle>
        <AlertDialogDescription>Description</AlertDialogDescription>
      </AlertDialogHeader>
    ));

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });
});
