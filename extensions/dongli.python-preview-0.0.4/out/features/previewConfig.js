"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
var ReloadType;
(function (ReloadType) {
    ReloadType[ReloadType["ReloadStyle"] = 1] = "ReloadStyle";
    ReloadType[ReloadType["ReloadContent"] = 2] = "ReloadContent";
    ReloadType[ReloadType["ReloadTrace"] = 3] = "ReloadTrace";
})(ReloadType || (ReloadType = {}));
class StyleConfiguration {
    constructor(pythonConfig) {
        this.fontFamily = pythonConfig.get('fontFamliy', undefined);
        this.fontSize = Math.max(16, +pythonConfig.get('fontSize', NaN));
        this.langDisplayFF = pythonConfig.get('langDisplay.fontFamily', undefined);
        this.langDisplayFS = Math.max(14, +pythonConfig.get('langDisplay.fontSize', NaN));
        this.codeFF = pythonConfig.get('code.fontFamily', undefined);
        this.codeFS = Math.max(15, +pythonConfig.get('code.fontSize', NaN));
        this.codeLH = Math.max(1, +pythonConfig.get('code.lineHeight', NaN));
        this.legendFF = pythonConfig.get('legend.fontFamily', undefined);
        this.legendFS = Math.max(12, +pythonConfig.get('legend.fontSize', NaN));
        this.codeFooterDocsFF = pythonConfig.get('codeFooterDocs.fontFamily', undefined);
        this.codeFooterDocsFS = Math.max(12, +pythonConfig.get('codeFooterDocs.fontSize', NaN));
        this.printOutputDocsFF = pythonConfig.get('printOutputDocs.fontFamily', undefined);
        this.printOutputDocsFS = Math.max(12, +pythonConfig.get('printOutputDocs.fontSize', NaN));
        this.pyStdoutFF = pythonConfig.get('progOutputs.fontFamily', undefined);
        this.pyStdoutFs = Math.max(14, +pythonConfig.get('progOutputs.fontSize', NaN));
        this.stackAndHeapHeaderFF = pythonConfig.get('stackAndHeapHeader.fontFamily', undefined);
        this.stackAndHeapHeaderFS = Math.max(14, +pythonConfig.get('stackAndHeapHeader.fontSize', NaN));
        this.stackFrameFF = pythonConfig.get('stackFrame.fontFamily', undefined);
        this.stackFrameFS = Math.max(14, +pythonConfig.get('stackFrame.fontSize', NaN));
        this.retValFS = Math.max(12, +pythonConfig.get('retVal.fontSize', NaN));
        this.stackFrameHeaderFF = pythonConfig.get('stackFrameHeder.fontFamily', undefined);
        ;
        this.stackFrameHeaderFS = Math.max(14, +pythonConfig.get('stackFrameHeader.fontSize', NaN));
        this.heapObjectFF = pythonConfig.get('heapObject.fontFamily', undefined);
        this.heapObjectFS = Math.max(14, +pythonConfig.get('heapObject.fontSize', NaN));
        this.typeLabelFF = pythonConfig.get('typeLabel.fontFamily', undefined);
        this.typeLabelFS = Math.max(12, +pythonConfig.get('typeLabel.fontSize', NaN));
        this.light_highlightedArrow_color = pythonConfig.get('light.highlightedArrow.color');
        this.light_highlightedStackFrame_bgColor = pythonConfig.get('light.highlightedStackFrame.bgColor');
        this.light_list_tuple_setTbl_bgColor = pythonConfig.get('light.list-tuple-setTbl.bgColor');
        this.light_dict_class_instKey_bgColor = pythonConfig.get('light.dict-class-instKey.bgColor');
        this.light_dict_class_instVal_bgColor = pythonConfig.get('light.dict-class-instVal.bgColor');
        this.dark_highlightedArrow_color = pythonConfig.get('dark.highlightedArrow.color');
        this.dark_highlightedStackFrame_bgColor = pythonConfig.get('dark.highlightedStackFrame.bgColor');
        this.dark_list_tuple_setTbl_bgColor = pythonConfig.get('dark.list-tuple-setTbl.bgColor');
        this.dark_dict_class_instKey_bgColor = pythonConfig.get('dark.dict-class-instKey.bgColor');
        this.dark_dict_class_instVal_bgColor = pythonConfig.get('dark.dict-class-instVal.bgColor');
        this.highContrast_highlightedArrow_color = pythonConfig.get('high-contrast.highlightedArrow.color');
        this.highContrast_highlightedStackFrame_bgColor = pythonConfig.get('high-contrast.highlightedStackFrame.bgColor');
        this.highContrast_list_tuple_setTbl_bgColor = pythonConfig.get('high-contrast.list-tuple-setTbl.bgColor');
        this.highContrast_dict_class_instKey_bgColor = pythonConfig.get('high-contrast.dict-class-instKey.bgColor');
        this.highContrast_dict_class_instVal_bgColor = pythonConfig.get('high-contrast.dict-class-instVal.bgColor');
        this.styles = pythonConfig.get('styles', []);
    }
    equals(otherConfig) {
        for (let key in this) {
            if (this.hasOwnProperty(key) && key !== 'styles' && this[key] !== otherConfig[key]) {
                return false;
            }
        }
        if (this.styles.length !== otherConfig.styles.length) {
            return false;
        }
        for (let i = 0; i < this.styles.length; ++i) {
            if (this.styles[i] !== otherConfig.styles[i]) {
                return false;
            }
        }
        return true;
    }
}
class ContentConfiguration {
    constructor(pythonConfig) {
        this.disableHeapNesting = !!pythonConfig.get('disableHeapNesting', false);
        this.textualMemoryLabels = !!pythonConfig.get('textualMemoryLabels', false);
        this.compactFuncLabels = !!pythonConfig.get('compactFuncLabels', false);
        this.showAllFrameLabels = !!pythonConfig.get('showAllFrameLabels', false);
        this.hideCode = !!pythonConfig.get('hideCode', false);
        this.codAndNavWidth = Math.max(510, +pythonConfig.get('codAndNavWidth', 510));
    }
    equals(otherConfig) {
        for (let key in this) {
            if (this.hasOwnProperty(key) && this[key] !== otherConfig[key]) {
                return false;
            }
        }
        return true;
    }
}
class TraceConfiguration {
    constructor(pythonConfig) {
        this.cumulativeMode = !!pythonConfig.get('cumulativeMode', false);
        this.allowAllModules = !!pythonConfig.get('allowAllModules', true);
        this.maxExecutedLines = Math.max(1000, +pythonConfig.get('maxExecutedLines', 1000));
    }
    equals(otherConfig) {
        for (let key in this) {
            if (this.hasOwnProperty(key) && this[key] !== otherConfig[key]) {
                return false;
            }
        }
        return true;
    }
}
class PythonPreviewConfiguration {
    static getForResource(resouce) {
        return new PythonPreviewConfiguration(resouce);
    }
    constructor(resource) {
        const pythonConfig = vscode.workspace.getConfiguration('pythonPreview', resource);
        this.styleConfig = new StyleConfiguration(pythonConfig);
        this.contentConfig = new ContentConfiguration(pythonConfig);
        this.traceConfig = new TraceConfiguration(pythonConfig);
    }
    equals(otherConfig) {
        if (!this.styleConfig.equals(otherConfig.styleConfig))
            return false;
        if (!this.contentConfig.equals(otherConfig.contentConfig))
            return false;
        if (!this.traceConfig.equals(otherConfig.traceConfig))
            return false;
        return true;
    }
}
exports.PythonPreviewConfiguration = PythonPreviewConfiguration;
class PythonPreviewConfigurationManager {
    constructor() {
        this._previewConfigurationsForWorkspaces = new Map();
    }
    loadAndCacheConfiguration(resource) {
        const config = PythonPreviewConfiguration.getForResource(resource);
        this._previewConfigurationsForWorkspaces.set(this.getKey(resource), config);
        return config;
    }
    getConfigCacheForResource(resource) {
        let config = this._previewConfigurationsForWorkspaces.get(this.getKey(resource));
        if (!config) {
            config = PythonPreviewConfiguration.getForResource(resource);
            this._previewConfigurationsForWorkspaces.set(this.getKey(resource), config);
        }
        return config;
    }
    hasConfigurationChanged(resource) {
        const key = this.getKey(resource);
        const currentConfig = this._previewConfigurationsForWorkspaces.get(key);
        const newConfig = PythonPreviewConfiguration.getForResource(resource);
        return !(currentConfig && currentConfig.equals(newConfig));
    }
    getKey(resource) {
        const folder = vscode.workspace.getWorkspaceFolder(resource);
        return folder ? folder.uri.toString() : '';
    }
}
exports.PythonPreviewConfigurationManager = PythonPreviewConfigurationManager;
//# sourceMappingURL=previewConfig.js.map