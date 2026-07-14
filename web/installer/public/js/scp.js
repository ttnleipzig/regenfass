// @ts-check

import initializeWasm from "./scp.mod.js";

/**
 * @readonly
 * @enum {0 | 1 | 2}
 */
export const LineType = {
	/** @type {0} */
	SET: 0,
	/** @type {1} */
	GET: 1,
	/** @type {2} */
	ACTION: 2,
};

/**
 * @typedef {Object} KLine
 * @property {typeof LineType.GET | typeof LineType.ACTION} type
 * @property {string} key
 */

/**
 * @typedef {Object} KVLine
 * @property {typeof LineType.SET} type
 * @property {string} key
 * @property {string} value
 */

/**
 * @typedef {KLine | KVLine} Line
 */

export default async function init() {
	/**
	 * @typedef {"i1" | "i8" | "i16" | "i32" | "i64" | "float" | "double"} DataType
	 */

	/**
	 * @typedef {number & { __dataType: "Pointer" }} Pointer
	 */
	const asPointer = (/** @type {number} */ ptr) =>
		/** @type {Pointer} */ (ptr);

	/**
	 * @typedef {Object} mod
	 * @property {(fn: string, returnType: string|null, parameters: ("number"|"string")[]) => any} cwrap
	 * @property {(size: number) => Pointer} _malloc
	 * @property {(ptr: Pointer) => void} _free
	 * @property {(ptr: Pointer, value: number, type: DataType | `${DataType}*`) => void} setValue
	 * @property {(ptr: Pointer, type: DataType | `${DataType}*`) => number} getValue
	 * @property {(ptr: Pointer) => string} AsciiToString
	 * @property {(str: string, ptr: Pointer) => void} stringToAscii
	 * @private
	 */

	/** @type {mod} */
	const mod = await initializeWasm();

	const scpSys = {
		/** @type {(raw: string) => Pointer} */
		line_parse: mod.cwrap("scp_line_parse", "number", ["string"]),
		/** @type {(ptr: Pointer) => void} */
		line_free: mod.cwrap("scp_line_free", null, ["number"]),
		/** @type {(ptr: Pointer) => string} */
		line_to_string: mod.cwrap("scp_line_to_string", "string", ["number"]),
	};

	return {
		/**
		 * @param {string} raw
		 * @returns {Line}
		 */
		parseLine(raw) {
			const ptr = scpSys.line_parse(raw);
			if (ptr === 0) {
				throw new Error("scp_line_parse: invalid line");
			}

			const type = mod.getValue(ptr, "i32");

			const keyPtr = mod.getValue(asPointer(ptr + 4), "i32*");
			const key = mod.AsciiToString(asPointer(keyPtr));

			/** @type {Line} */
			let line = null;
			if (type === LineType.SET) {
				const valuePtr = mod.getValue(asPointer(ptr + 8), "i32*");
				const value = mod.AsciiToString(asPointer(valuePtr));

				line = { type: LineType.SET, key, value };
			} else if (type === LineType.GET || type === LineType.ACTION) {
				line = { type, key };
			} else {
				throw new Error(`scp_line_parse: invalid line type ${type}`);
			}

			scpSys.line_free(ptr);

			return line;
		},
		/**
		 * @param {Line} line
		 * @returns {string}
		 */
		lineToString(line) {
			let ptr = mod._malloc(
				4 /* type */ +
					4 /* key ptr */ +
					(line.type === LineType.SET ? 4 /* value ptr */ : 0)
			);

			mod.setValue(ptr, line.type, "i32");

			const keyPtr = mod._malloc(line.key.length + 1);
			mod.stringToAscii(line.key, keyPtr);
			mod.setValue(asPointer(ptr + 4), keyPtr, "i32*");

			if (line.type === LineType.SET) {
				const valuePtr = mod._malloc(line.value.length + 1);
				mod.stringToAscii(line.value, valuePtr);
				mod.setValue(asPointer(ptr + 8), valuePtr, "i32*");
			}

			const str = scpSys.line_to_string(ptr);

			scpSys.line_free(ptr);

			return str;
		},
	};
}
