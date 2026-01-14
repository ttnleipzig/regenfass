import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/molecules/Card.tsx";

describe("Card", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders card element", () => {
    const { container } = render(() => <Card>Card content</Card>);
    const card = container.querySelector("div");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("rounded-xl", "border", "bg-card");
  });

  it("renders children content", () => {
    render(() => <Card>Test content</Card>);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("merges custom classes", () => {
    const { container } = render(() => <Card class="custom-class">Content</Card>);
    const card = container.querySelector("div");
    expect(card).toHaveClass("custom-class");
  });
});

describe("CardHeader", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders header element", () => {
    const { container } = render(() => <CardHeader>Header content</CardHeader>);
    const header = container.querySelector("div");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("p-6");
  });

  it("renders children content", () => {
    render(() => <CardHeader>Header text</CardHeader>);
    expect(screen.getByText("Header text")).toBeInTheDocument();
  });

  it("merges custom classes", () => {
    const { container } = render(() => (
      <CardHeader class="custom-class">Header</CardHeader>
    ));
    const header = container.querySelector("div");
    expect(header).toHaveClass("custom-class");
  });
});

describe("CardTitle", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders as h1 element", () => {
    render(() => <CardTitle>Card Title</CardTitle>);
    const title = screen.getByText("Card Title");
    expect(title.tagName).toBe("H1");
  });

  it("applies correct styling classes", () => {
    const { container } = render(() => <CardTitle>Title</CardTitle>);
    const title = container.querySelector("h1");
    expect(title).toHaveClass("font-semibold");
  });

  it("merges custom classes", () => {
    const { container } = render(() => (
      <CardTitle class="custom-class">Title</CardTitle>
    ));
    const title = container.querySelector("h1");
    expect(title).toHaveClass("custom-class");
  });
});

describe("CardDescription", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders as h3 element", () => {
    render(() => <CardDescription>Card Description</CardDescription>);
    const desc = screen.getByText("Card Description");
    expect(desc.tagName).toBe("H3");
  });

  it("applies correct styling classes", () => {
    const { container } = render(() => <CardDescription>Description</CardDescription>);
    const desc = container.querySelector("h3");
    expect(desc).toHaveClass("text-sm", "text-muted-foreground");
  });

  it("merges custom classes", () => {
    const { container } = render(() => (
      <CardDescription class="custom-class">Description</CardDescription>
    ));
    const desc = container.querySelector("h3");
    expect(desc).toHaveClass("custom-class");
  });
});

describe("CardContent", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders content element", () => {
    const { container } = render(() => <CardContent>Content</CardContent>);
    const content = container.querySelector("div");
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("p-6", "pt-0");
  });

  it("renders children content", () => {
    render(() => <CardContent>Content text</CardContent>);
    expect(screen.getByText("Content text")).toBeInTheDocument();
  });

  it("merges custom classes", () => {
    const { container } = render(() => (
      <CardContent class="custom-class">Content</CardContent>
    ));
    const content = container.querySelector("div");
    expect(content).toHaveClass("custom-class");
  });
});

describe("CardFooter", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders footer element", () => {
    const { container } = render(() => <CardFooter>Footer</CardFooter>);
    const footer = container.querySelector("div");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass("p-6", "pt-0");
  });

  it("renders children content", () => {
    render(() => <CardFooter>Footer text</CardFooter>);
    expect(screen.getByText("Footer text")).toBeInTheDocument();
  });

  it("merges custom classes", () => {
    const { container } = render(() => (
      <CardFooter class="custom-class">Footer</CardFooter>
    ));
    const footer = container.querySelector("div");
    expect(footer).toHaveClass("custom-class");
  });
});

describe("Card composition", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders complete card structure", () => {
    render(() => (
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    ));

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});
