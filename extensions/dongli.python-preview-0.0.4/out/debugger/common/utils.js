'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const untildify = require("untildify");
const path = require("path");
const child_process = require("child_process");
exports.IS_WINDOWS = /^win/.test(process.platform);
/**
 * 获取python可执行文件.
 *
 * @param {string} pythonPath
 * @returns {string}
 */
function getPythonExecutable(pythonPath) {
    pythonPath = untildify(pythonPath);
    if (pythonPath === 'python' ||
        pythonPath.indexOf(path.sep) === -1 ||
        path.basename(pythonPath) === path.dirname(pythonPath)) {
        return pythonPath;
    }
    if (isValidPythonPath(pythonPath)) {
        return pythonPath;
    }
    const knownPythonExecutables = ['python', 'python3.7', 'python3.6', 'python3.5', 'python3', 'python2.7', 'python2'];
    for (let executableName of knownPythonExecutables) {
        // Suffix with 'python' for linux and 'osx', and 'python.exe' for 'windows'.
        if (exports.IS_WINDOWS) {
            executableName = `${executableName}.exe`;
            if (isValidPythonPath(path.join(pythonPath, executableName))) {
                return path.join(pythonPath, executableName);
            }
            if (isValidPythonPath(path.join(pythonPath, 'scripts', executableName))) {
                return path.join(pythonPath, 'scripts', executableName);
            }
        }
        else {
            if (isValidPythonPath(path.join(pythonPath, executableName))) {
                return path.join(pythonPath, executableName);
            }
            if (isValidPythonPath(path.join(pythonPath, 'bin', executableName))) {
                return path.join(pythonPath, executableName);
            }
        }
    }
    return pythonPath;
}
exports.getPythonExecutable = getPythonExecutable;
/**
 * python可执行文件路径是否合法.
 *
 * @param {string} pythonPath
 * @returns {boolean}
 */
function isValidPythonPath(pythonPath) {
    try {
        const output = child_process.execFileSync(pythonPath, ['-c', 'print(1234)'], { encoding: 'utf8' });
        output.startsWith('1234');
    }
    catch (e) {
        return false;
    }
}
//# sourceMappingURL=utils.js.map