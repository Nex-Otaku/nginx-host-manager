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


module.exports = {

    getFilesWithRegex: getFilesWithRegex,

    getFilesWithPattern: getFilesWithPattern,

    getCurrentDirectory: getCurrentDirectory,

    directoryExists: directoryExists,

    getTempDirectoryPath: getTempDirectoryPath,

    getTempFilePath: getTempFilePath,

    deleteFile: deleteFile
};