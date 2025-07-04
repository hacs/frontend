import { describe, it, expect } from "vitest";
import { markdownWithRepositoryContext } from "../src/tools/markdown.js";
import type { RepositoryInfo } from "../src/data/repository.js";

const mockRepository: RepositoryInfo = {
  id: "123",
  full_name: "awesome/repo",
  default_branch: "main",
  available_version: "v1.0.0",
} as RepositoryInfo;

describe("markdownWithRepositoryContext", () => {
  it("should convert GitHub issue references to links", () => {
    const input = "See issue #123 for details";
    const result = markdownWithRepositoryContext(input, mockRepository);
    expect(result).toBe("See issue [#123](https://github.com/awesome/repo/issues/123) for details");
  });

  it("should NOT convert CSS color codes", () => {
    const input = "Set color: #123456 in your CSS";
    const result = markdownWithRepositoryContext(input, mockRepository);
    expect(result).toBe("Set color: #123456 in your CSS");
  });

  it("should NOT convert CSS shorthand colors", () => {
    const input = "Use background:#123; border:#abc;";
    const result = markdownWithRepositoryContext(input, mockRepository);
    expect(result).toBe("Use background:#123; border:#abc;");
  });

  it("should handle mixed scenarios correctly", () => {
    const input = "Fix issue #42 but keep color:#333 and border:#456 styles intact";
    const result = markdownWithRepositoryContext(input, mockRepository);
    expect(result).toBe(
      "Fix issue [#42](https://github.com/awesome/repo/issues/42) but keep color:#333 and border:#456 styles intact",
    );
  });

  it("should handle duplicate patterns correctly", () => {
    const input = "Issue #123 was fixed. Later, set color: #123 in CSS. Then see #456.";
    const result = markdownWithRepositoryContext(input, mockRepository);
    expect(result).toBe(
      "Issue [#123](https://github.com/awesome/repo/issues/123) was fixed. Later, set color: #123 in CSS. Then see [#456](https://github.com/awesome/repo/issues/456).",
    );
  });

  it("should convert legitimate issue numbers but not hex colors", () => {
    const input = "Issue #123 was fixed, but color: #456789 remains unchanged";
    const result = markdownWithRepositoryContext(input, mockRepository);
    expect(result).toBe(
      "Issue [#123](https://github.com/awesome/repo/issues/123) was fixed, but color: #456789 remains unchanged",
    );
  });

  it("should work without repository context", () => {
    const input = "Some text with #123 reference";
    const result = markdownWithRepositoryContext(input);
    expect(result).toBe("Some text with #123 reference");
  });

  it("should NOT convert CSS hex colors in code examples", () => {
    const input = "Example CSS: div { color:#ff0000; background:#123456; }";
    const result = markdownWithRepositoryContext(input, mockRepository);
    expect(result).toBe("Example CSS: div { color:#ff0000; background:#123456; }");
  });

  it("should handle repository/issue references correctly", () => {
    const input = "Check out awesome/other-repo#456 for more info";
    const result = markdownWithRepositoryContext(input, mockRepository);
    expect(result).toBe(
      "Check out [awesome/other-repo#456](https://github.com/awesome/other-repo/issues/456) for more info",
    );
  });

  it("should handle issue numbers with 8 and 9 (non-hex digits)", () => {
    const input = "See issues #789 and #98 for details";
    const result = markdownWithRepositoryContext(input, mockRepository);
    expect(result).toBe(
      "See issues [#789](https://github.com/awesome/repo/issues/789) and [#98](https://github.com/awesome/repo/issues/98) for details",
    );
  });

  it("should NOT convert 6-digit hex colors in CSS context", () => {
    const input = "Apply color:#ffffff and background-color:#000000 styles";
    const result = markdownWithRepositoryContext(input, mockRepository);
    expect(result).toBe("Apply color:#ffffff and background-color:#000000 styles");
  });

  it("should convert valid issue numbers that contain non-hex digits", () => {
    const input = "Fixed in #987 and resolved in #1289";
    const result = markdownWithRepositoryContext(input, mockRepository);
    expect(result).toBe(
      "Fixed in [#987](https://github.com/awesome/repo/issues/987) and resolved in [#1289](https://github.com/awesome/repo/issues/1289)",
    );
  });

  it("should handle mixed CSS and issue references in same text", () => {
    const input = "Issue #789 fixed. Use border:#123; and see #890 too";
    const result = markdownWithRepositoryContext(input, mockRepository);
    expect(result).toBe(
      "Issue [#789](https://github.com/awesome/repo/issues/789) fixed. Use border:#123; and see [#890](https://github.com/awesome/repo/issues/890) too",
    );
  });
  it("should handle large text efficiently", () => {
    // Create a large string with mixed content to test performance
    const parts: string[] = [];
    for (let i = 0; i < 25_000; i++) {
      parts.push(`Issue #${i + 1} was fixed. Use color:#${String(i).padStart(3, "0")}; in CSS.`);
    }
    const input = parts.join(" ");

    const start = performance.now();
    const result = markdownWithRepositoryContext(input, mockRepository);
    const end = performance.now();

    // Should complete in reasonable time (< 100ms for this test)
    expect(end - start).toBeLessThan(100);

    // Should have converted all issue references
    expect(result).toContain("[#1](https://github.com/awesome/repo/issues/1)");
    expect(result).toContain("[#25000](https://github.com/awesome/repo/issues/25000)");

    // Should not have converted CSS colors
    expect(result).toContain("color:#001;");
    expect(result).toContain("color:#099;");
  });
});
