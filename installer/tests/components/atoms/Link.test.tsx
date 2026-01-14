import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import Link from "@/components/atoms/Link.tsx";

describe("Link", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders link with href", () => {
    render(() => <Link href="/test">Test Link</Link>);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("renders children content", () => {
    render(() => <Link href="/test">Test Link</Link>);
    expect(screen.getByText("Test Link")).toBeInTheDocument();
  });

  it("adds target and rel attributes for external links starting with http", () => {
    render(() => <Link href="http://example.com">External Link</Link>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("adds target and rel attributes for external links starting with https", () => {
    render(() => <Link href="https://example.com">External Link</Link>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not add target and rel for internal links", () => {
    render(() => <Link href="/internal">Internal Link</Link>);
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("does not add target and rel for relative paths", () => {
    render(() => <Link href="./relative">Relative Link</Link>);
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("applies correct styling classes", () => {
    const { container } = render(() => <Link href="/test">Styled Link</Link>);
    const link = container.querySelector("a");
    expect(link).toHaveClass("text-blue-600");
    expect(link).toHaveClass("hover:text-blue-800");
    expect(link).toHaveClass("underline");
  });

  it("handles different external link formats", () => {
    render(() => <Link href="http://test.com">Link</Link>);
    let link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    cleanup();
    
    render(() => <Link href="https://test.com">Link</Link>);
    link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("handles hash links as internal", () => {
    render(() => <Link href="#section">Hash Link</Link>);
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("handles mailto links as internal", () => {
    render(() => <Link href="mailto:test@example.com">Email Link</Link>);
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });
});
