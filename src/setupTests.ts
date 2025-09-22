import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with testing-library matchers
expect.extend(matchers as any)

// Any additional global test setup can be added here.
// Provide a simple localStorage shim for the test environment
if (typeof (globalThis as any).localStorage === 'undefined') {
	const storage: Record<string, string> = {}
	;(globalThis as any).localStorage = {
		getItem(key: string) { return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null },
		setItem(key: string, value: string) { storage[key] = String(value) },
		removeItem(key: string) { delete storage[key] },
		clear() { for (const k of Object.keys(storage)) delete storage[k] }
	}
}

// PointerEvent/polyfill is provided by the test environment (jsdom) normally,
// but ensure addEventListener options are available for pointer capture calls.
