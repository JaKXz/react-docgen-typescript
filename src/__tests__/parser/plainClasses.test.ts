import { describe, expect, it } from "vitest";
import { parse } from "../../parser";
import { fixturePath } from "../testUtils";

describe.only("parser > integration tests for plain classes", () => {
  it.only("parses a plain class", () => {
    const result = parse(fixturePath("plain/class"));

    expect(result).toEqual([
      {
        displayName: "Calculator",
        description: "Calculator!",
        methods: [{}],
      },
    ]);
  });
});
