module.exports = {
    outputDir: "dist/web",
    assetsDir: "assets",
    devServer: {
        proxy: "http://localhost:9900"
    },
    configureWebpack: {
        externals: {
            vue: "Vue",
            axios: "axios",
            "element-plus": "ElementPlus",
            "cronstrue/i18n": "cronstrue",
            "crypto-js/sha256": "CryptoJS.SHA256",
            "core-js": "corejs",
        }
    },
}