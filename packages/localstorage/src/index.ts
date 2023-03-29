import { Adapter, GetStoreItemStruct, SetStoreItemStruct, StoreConfig } from "vstore";

interface StoreItem {
  value: unknown;
  ttl: number;
  expireAt: number;
}
// 缓存过期检查间隔时间
const CHECK_TIME = 1000;
// 缓存前缀 用来识别是否是vstore缓存
const PREFIX = "vstore:";
export default class Localstorage implements Adapter {
  // 静态属性，用来实现单例模式
  static _instance: Localstorage;

  private prefix = PREFIX;
  constructor(private config: StoreConfig) {
    // 实现单例模式
    if (Localstorage._instance) {
      return Localstorage._instance;
    }
    Localstorage._instance = this;
    // 启用定时器，定时检查过期缓存
    setInterval(() => {
      this.expireCheck();
    }, CHECK_TIME);
  }
  /**
   * 设置缓存
   *
   * @template T
   * @param {SetStoreItemStruct<T>} option
   * @return {*}  {T}
   * @memberof Localstorage
   */
  set<T = unknown>(option: SetStoreItemStruct<T>): T {
    const { namespace = this.config.namespace, key, value, ttl = this.config.ttl } = option;
    const storeKey = this.getStoreKey(`${namespace}:${key}`);
    localStorage.setItem(
      storeKey,
      JSON.stringify({
        value,
        ttl,
        expireAt: ttl ? Date.now() + ttl : 0,
      })
    );
    return value;
  }
  /**
   * 读取缓存
   *
   * @template T
   * @param {GetStoreItemStruct<T>} option
   * @return {*}  {T}
   * @memberof Localstorage
   */
  get<T = unknown>(option: GetStoreItemStruct<T>): T {
    const { namespace = this.config.namespace, key, defaultValue } = option;
    const storeKey = this.getStoreKey(`${namespace}:${key}`);
    const localStr = localStorage.getItem(storeKey);
    if (!localStr) {
      return defaultValue;
    }
    const item: StoreItem = JSON.parse(localStr);
    if (item.expireAt > 0 && item.expireAt < Date.now()) {
      // 缓存过期
      localStorage.removeItem(storeKey);
      return defaultValue;
    }
    return (item.value as T) ?? defaultValue;
  }
  /**
   * 清除缓存
   *
   * @param {string} [namespace] 指定需要清除的命名空间
   * @memberof Localstorage
   */
  clear(namespace?: string) {
    const prefix = this.getStoreKey(`${namespace}:`);
    for (let key in localStorage) {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    }
  }
  /**
   * 刷新缓存过期时间
   *
   * @param {string} namespace 命名空间
   * @param {string} key 缓存key
   * @param {number} [ttl=5 * 60 * 1000] 过期时间，单位毫秒
   * @memberof Localstorage
   */
  refresh(namespace: string, key: string, ttl: number = 5 * 60 * 1000) {
    const storeKey = this.getStoreKey(`${namespace}:${key}`);
    const localStr = localStorage.getItem(storeKey);
    if (localStr) {
      const item: StoreItem = JSON.parse(localStr);
      item.expireAt = Date.now() + ttl;
      localStorage.setItem(storeKey, JSON.stringify(item));
    }
  }
  /**
   * 检查过期缓存
   *
   * @memberof Localstorage
   */
  private expireCheck() {
    const now = Date.now();
    for (let key in localStorage) {
      if (key.startsWith(this.prefix)) {
        const str = localStorage.getItem(key);
        if (str) {
          const item: StoreItem = JSON.parse(str);
          if (item.expireAt > 0 && item.expireAt < now) {
            // 缓存过期
            localStorage.removeItem(key);
          }
        }
      }
    }
  }
  /**
   * 获取缓存key
   *
   * @private
   * @param {string} key
   * @return {*}  {string}
   * @memberof Localstorage
   */
  private getStoreKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}
