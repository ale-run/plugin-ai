"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (sort) => {
    if (typeof sort === 'object')
        return sort;
    return (sort &&
        sort.split(' ').reduce((o, key) => {
            if (!key)
                return o;
            key = key.trim();
            if (key.startsWith('-'))
                o[key.slice(1)] = 0;
            else
                o[key] = 1;
            return o;
        }, {}));
};
//# sourceMappingURL=string2projection.js.map