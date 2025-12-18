export class RavenStorage {
  readonly #storeId: string
  readonly #nativeModule = global.__RavenStorageProxy

  constructor(
    storeId: string,
    encryptionKey: string,
    multiprocess: boolean = false,
  ) {
    this.#storeId = storeId
    this.#nativeModule.initialize(storeId, encryptionKey, multiprocess ?? false)
  }

  getAllKeys(): Array<string> {
    return this.#nativeModule.getAllKeys(this.#storeId)
  }

  removeAll() {
    this.#nativeModule.removeAll(this.#storeId)
  }

  remove(key: string) {
    this.#nativeModule.removeKey(this.#storeId, key)
  }

  setString(key: string, value: string) {
    this.#nativeModule.setString(this.#storeId, key, value)
  }

  getString(key: string, defaultValue: string): string {
    return this.#nativeModule.getString(this.#storeId, key, defaultValue)
  }

  setBoolean(key: string, value: boolean) {
    this.#nativeModule.setBoolean(this.#storeId, key, value)
  }

  getBoolean(key: string, defaultValue: boolean): boolean {
    return this.#nativeModule.getBoolean(this.#storeId, key, defaultValue)
  }

  setNumber(key: string, value: number) {
    this.#nativeModule.setNumber(this.#storeId, key, value.toString())
  }

  getNumber(key: string, defaultValue: number): number {
    return Number(
      this.#nativeModule.getNumber(this.#storeId, key, defaultValue.toString()),
    )
  }

  contains(key: string): boolean {
    return this.#nativeModule.containsKey(this.#storeId, key)
  }
}
