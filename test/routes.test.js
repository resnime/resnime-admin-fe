import test from "node:test";
import assert from "node:assert/strict";
import {
  getActiveMode,
  getBulkReviewItem,
} from "../src/utils/routes.js";

test("getActiveMode derives the active mode from the current path", () => {
  assert.equal(getActiveMode("/bulk"), "bulk");
  assert.equal(getActiveMode("/bulk/52991/review"), "bulk");
  assert.equal(getActiveMode("/manual"), "manual");
  assert.equal(getActiveMode("/anything"), "manual");
});

test("getBulkReviewItem matches MAL IDs with string comparison", () => {
  const items = [{ id: 52991 }, { id: "21" }];

  assert.deepEqual(getBulkReviewItem(items, "52991"), { id: 52991 });
  assert.deepEqual(getBulkReviewItem(items, 21), { id: "21" });
  assert.equal(getBulkReviewItem(items, "404"), null);
});
