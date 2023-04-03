import { KStore } from "../src/store";

test("store", () => {
  const store = new KStore({});
  store.set("foo", "bar");
  expect(store.get("foo")).toBe("bar");

  store.set({
    key: "foo",
    value: "bar2",
  });
  expect(store.get("foo")).toBe("bar2");
});
