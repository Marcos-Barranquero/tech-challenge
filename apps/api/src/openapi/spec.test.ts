import { describe, expect, it } from "vitest";
import { getOpenApiDocument } from "./spec.js";
import { API_PREFIX, API_VERSION, OPENAPI_SPEC_VERSION } from "./version.js";

describe("OpenAPI spec", () => {
  it("is versioned and includes documented routes", () => {
    const doc = getOpenApiDocument("http://localhost:4000");

    expect(doc.openapi).toBe("3.0.3");
    expect(doc.info.version).toBe(OPENAPI_SPEC_VERSION);
    expect(doc.paths).toBeDefined();
    expect(doc.paths?.[`${API_PREFIX}/pokemon`]).toBeDefined();
    expect(doc.paths?.[`${API_PREFIX}/pokemon/{id}`]).toBeDefined();
    expect(doc.paths?.[`${API_PREFIX}/pokemon/search/evolutions`]).toBeDefined();
    expect(doc.paths?.[`${API_PREFIX}/pokemon/meta`]).toBeDefined();
  });

  it("exposes server URL in generated document", () => {
    const doc = getOpenApiDocument("https://api.example.com");
    expect(doc.servers?.[0]?.url).toBe("https://api.example.com");
    expect(API_VERSION).toBe("v1");
  });
});

