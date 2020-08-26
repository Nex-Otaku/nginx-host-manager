const fs = require('fs');
const path = require('path');

const os = require('os');

const getCurrentDirectory = () => {
    return process.cwd();
};

const getTempDirectoryName = () => {
    return 'nginx-host-manager';
};

const getTempDirectoryPath = () => {
    const tempRoot = os.tmpdir();
    const dirName = getTempDirectoryName();
    const tempDirectoryPath = path.join(tempRoot, dirName);

    if (!directoryExists(tempDirectoryPath)) {
        fs.mkdirSync(tempDirectoryPath);
    }

    return tempDirectoryPath;
};

const getTempFilePath = (fileName) => {
    return path.join(getTempDirectoryPath(), fileName);
};

const fileExists = (filePath) => {
    return fs.existsSync(filePath);
};

const directoryExists = (filePath) => {
    return fs.existsSync(filePath);
};

const getFilesWithRegex = (path, regex) => {
    let dirCont = fs.readdirSync(path);

    return dirCont.filter( function( elm ) {return elm.match(regex);});
};

const getFilesWithPattern = (path, pattern) => {
    let regex = new RegExp(pattern, 'ig');

    return getFilesWithRegex(path, regex);
};

const deleteFile = (filePath) => {
    return fs.unlinkSync(filePath);
};

const readFile = (filePath) => {
    return fs.readFileSync(filePath, 'utf8');
};

const writeFile = (filePath, content) => {
    fs.writeFileSync(filePath, content);
};

const renameFile = (from, to) => {
    fs.renameSync(from, to);
};

module.exports = {

    getFilesWithRegex: getFilesWithRegex,

    getFilesWithPattern: getFilesWithPattern,

    getCurrentDirectory: getCurrentDirectory,

    fileExists: fileExists,

    directoryExists: directoryExists,

    getTempDirectoryPath: getTempDirectoryPath,

    getTempFilePath: getTempFilePath,

    deleteFile: deleteFile,

    readFile: readFile,

    writeFile: writeFile,

    renameFile: renameFile
};