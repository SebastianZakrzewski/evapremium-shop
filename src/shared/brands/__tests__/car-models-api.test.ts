import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchCarModelsBySlug } from "@/shared/brands/carModelsApi";

const createFetchMock = () =>
  vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    json: vi.fn().mockResolvedValue([]),
  });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchCarModelsBySlug", () => {
  it("requests canonical brand names for aliased slugs", async () => {
    const fetchMock = createFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    await fetchCarModelsBySlug("mercedes_benz");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/models?brand=Mercedes-Benz",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("falls back to humanized brand name when mapping missing", async () => {
    const fetchMock = createFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    await fetchCarModelsBySlug("unknown-brand");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/models?brand=Unknown%20Brand",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("skips fetch for empty slug", async () => {
    const fetchMock = createFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchCarModelsBySlug("");

    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});


