/**
 * КРИТИЧНО: Синхронная инициализация полифиллов
 * Должна происходить ДО любых импортов Solana
 */

// Убеждаемся что мы в браузере
if (typeof window !== 'undefined') {
  // 1. Global
  if (!(globalThis as any).global) {
    (globalThis as any).global = globalThis;
  }

  // 2. Process
  if (!(globalThis as any).process) {
    (globalThis as any).process = { 
      env: {},
      version: 'v16.0.0',
      versions: {},
      nextTick: (fn: Function) => setTimeout(fn, 0)
    };
  }

  // 3. Buffer - критически важен для Solana
  if (!(globalThis as any).Buffer) {
    // Временная синхронная заглушка
    (globalThis as any).Buffer = {
      from: (data: any, _encoding?: string) => {
        if (typeof data === 'string') {
          return new TextEncoder().encode(data);
        }
        return new Uint8Array(data);
      },
      alloc: (size: number) => new Uint8Array(size),
      allocUnsafe: (size: number) => new Uint8Array(size),
      isBuffer: (obj: any) => obj instanceof Uint8Array,
      concat: (list: Uint8Array[]) => {
        const totalLength = list.reduce((acc, arr) => acc + arr.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const arr of list) {
          result.set(arr, offset);
          offset += arr.length;
        }
        return result;
      }
    };

    // Асинхронная загрузка полного Buffer полифилла
    import('buffer').then(({ Buffer }) => {
      (globalThis as any).Buffer = Buffer;
      console.log('✅ Full Buffer polyfill loaded');
    }).catch((err) => {
      console.warn('⚠️ Could not load full Buffer polyfill:', err);
    });
  }

  // 4. Crypto - нужен для некоторых wallet адаптеров
  if (!(globalThis as any).crypto && window.crypto) {
    (globalThis as any).crypto = window.crypto;
  }

  console.log('✅ Synchronous polyfills initialized');
}

// Экспортируем пустой объект чтобы сделать это модулем
export {};
