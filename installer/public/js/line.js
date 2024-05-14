/**
 * Enum for Line types.
 * @readonly
 * @enum {number}
 */
export const Type = {
    SET: 0,     // '<KEY>=<VALUE>\n'
    GET: 1,     // '<KEY>?\n'
    ACTION: 2   // '<KEY>!\n'
};


/**
 * Class representing a Line.
 */
export class Line {
    /**
     * Create a Line.
     * @param {Type} type - The type of the Line.
     * @param {Array<string>|string} data - The data of the Line.
     */
    constructor(type, data) {
        this.type = type;
        if (Array.isArray(data)) {
            this.data = { kv: data };
        } else {
            this.data = { k: data };
        }
    }

    /**
     * Parse a string to create a Line object.
     * @param {string} stream - The input string.
     * @returns {Line|null} The parsed Line object or null if the string is invalid.
     */
    static parse(stream) {
        const firstEquals = stream.indexOf('=');
        const lastChar = stream.charAt(stream.length - 1);
        const isQuestionMark = lastChar === '?';
        const isExclamationMark = lastChar === '!';

        if (firstEquals !== -1) {
            const key = stream.slice(0, firstEquals);
            const value = stream.slice(firstEquals + 1);
            return new Line(Type.SET, [key, value]);
        } else if (isQuestionMark) {
            const key = stream.slice(0, stream.length - 1);
            return new Line(Type.GET, key);
        } else if (isExclamationMark) {
            const key = stream.slice(0, stream.length - 1);
            return new Line(Type.ACTION, key);
        }

        return null;
    }

    /**
     * Convert the Line object to a string.
     * @returns {string} The string representation of the Line.
     */
    toString() {
        switch (this.type) {
            case Type.SET:
                return `${this.data.kv[0]}=${this.data.kv[1]}`;
            case Type.GET:
                return `${this.data.k}?`;
            case Type.ACTION:
                return `${this.data.k}!`;
            default:
                return "error=invalid line";
        }
    }
}
