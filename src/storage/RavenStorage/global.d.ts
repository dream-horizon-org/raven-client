declare global {
  var __RavenStorageProxy: {
    getAllKeys(storeId: string): Array<string>

    initialize(
      storeId: string,
      encryptionKey: string,
      isMultiProcess: boolean,
    ): void
    removeAll(storeId: string): void
    removeKey(storeId: string, key: string): void

    setString(storeId: string, key: string, value: string): void
    getString(storeId: string, key: string, defaultValue: string): string

    setBoolean(storeId: string, key: string, value: boolean): void
    getBoolean(storeId: string, key: string, defaultValue: boolean): boolean

    setNumber(storeId: string, key: string, value: string): void
    getNumber(storeId: string, key: string, defaultValue: string): string

    containsKey(storeId: string, key: string)
  }
}

export {}
