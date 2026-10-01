import { countGroups, readListMeta } from "./use-settings-category-counts";

describe("settings category counts", () => {
  it("reads pagination.total from the admin list envelope", () => {
    const meta = readListMeta({
      data: {
        data: {
          items: [{ id: 1 }],
          pagination: { total: 24, last_page: 3, per_page: 1 },
        },
      },
    });

    expect(meta.total).toBe(24);
    expect(meta.lastPage).toBe(3);
    expect(meta.items).toHaveLength(1);
  });

  it("reads a Laravel paginator total", () => {
    const meta = readListMeta({
      data: {
        data: {
          data: [{ id: 1 }, { id: 2 }],
          total: 8,
          last_page: 1,
          current_page: 1,
        },
      },
    });

    expect(meta.total).toBe(8);
    expect(meta.items).toHaveLength(2);
  });

  it("counts each record once when housing and commercial return the same rows", () => {
    const rows = Array.from({ length: 10 }, (_, index) => ({ id: index + 1 }));

    expect(
      countGroups([
        { items: rows, total: 10 },
        { items: rows, total: 10 },
      ])
    ).toBe(10);
  });

  it("adds housing and commercial when the records are different", () => {
    expect(
      countGroups([
        { items: [{ id: 1 }, { id: 2 }], total: 2 },
        { items: [{ id: 3 }], total: 1 },
      ])
    ).toBe(3);
  });

  it("uses the reported total when the first page is shorter than the full list", () => {
    expect(countGroups([{ items: [{ id: 1 }], total: 37 }])).toBe(37);
  });
});
