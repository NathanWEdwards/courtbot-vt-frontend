module.exports = {
    "root": true,
    "extends": [
        "eslint:recommended",
        "plugin:@next/next/recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": ["@typescript-eslint"],
    "rules": {}
};