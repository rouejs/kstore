import { VStore } from "../src/store";

test("store", () => {
  const store = new VStore({});
  store.set("foo", "bar");
  expect(store.get("foo")).toBe("bar");

  store.set({
    key: "foo",
    value: "bar2",
  });
  expect(store.get("foo")).toBe("bar2");
});
