const fs = require("fs");
const { builtinModules } = require("module");
const path = require("path");
const { logger } = require("../common");
const { formatDate } = require("./date-utils");

function createFileContainer(filePath) {
    const dirToCreate = path.dirname(filePath);
    fs.mkdirSync(dirToCreate, { recursive: true });
}

function saveFile(filePath, content) {
    createFileContainer(filePath);
    try {
        fs.writeFileSync(filePath, content);
    } catch (ex) {
        logger.error(`Error saving file ${filePath}`, ex)
        throw ex
    }
}

function getDefaultFileName() {
    return `deliveries-${formatDate(new Date())}.json`;
}

module.exports = { saveFile, getDefaultFileName }