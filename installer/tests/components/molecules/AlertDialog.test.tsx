import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
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
    render(() => {
      const [open, setOpen] = createSignal(true);
      return (
        <AlertDialog open={open()} onOpenChange={setOpen}>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Dialog Title</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>
      );
    });
    expect(screen.getByText("Dialog Title")).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    render(() => {
      const [open, setOpen] = createSignal(true);
      return (
        <AlertDialog open={open()} onOpenChange={setOpen}>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Title</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>
      );
    });
    const title = screen.getByText("Title");
    expect(title).toHaveClass("text-lg", "font-semibold");
  });

  it("merges custom classes", () => {
    render(() => {
      const [open, setOpen] = createSignal(true);
      return (
        <AlertDialog open={open()} onOpenChange={setOpen}>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle class="custom-class">Title</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>
      );
    });
    const title = screen.getByText("Title");
    expect(title).toHaveClass("custom-class");
  });
});

describe("AlertDialogDescription", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders description element", () => {
    render(() => {
      const [open, setOpen] = createSignal(true);
      return (
        <AlertDialog open={open()} onOpenChange={setOpen}>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogDescription>Dialog Description</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      );
    });
    expect(screen.getByText("Dialog Description")).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    render(() => {
      const [open, setOpen] = createSignal(true);
      return (
        <AlertDialog open={open()} onOpenChange={setOpen}>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogDescription>Description</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      );
    });
    const desc = screen.getByText("Description");
    expect(desc).toHaveClass("text-sm", "text-muted-foreground");
  });

  it("merges custom classes", () => {
    render(() => {
      const [open, setOpen] = createSignal(true);
      return (
        <AlertDialog open={open()} onOpenChange={setOpen}>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogDescription class="custom-class">Description</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      );
    });
    const desc = screen.getByText("Description");
    expect(desc).toHaveClass("custom-class");
  });
});

describe("AlertDialog composition", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders complete dialog structure", () => {
    render(() => {
      const [open, setOpen] = createSignal(true);
      return (
        <AlertDialog open={open()} onOpenChange={setOpen}>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Title</AlertDialogTitle>
              <AlertDialogDescription>Description</AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      );
    });

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });
});
