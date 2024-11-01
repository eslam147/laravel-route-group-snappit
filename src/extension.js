"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.convertRoutes', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("There is no editor open.");
            return;
        }
        const document = editor.document;
        const selection = editor.selection;
        let text;
        if (selection.isEmpty) {
            text = document.getText();
            if (!text) {
                vscode.window.showWarningMessage("There is no text in the editor to convert.");
                return;
            }
        }
        else {
            text = document.getText(selection);
        }
        const commands = text.split('\n').filter((line) => line.trim() !== '');
        const output = generateRoutes(commands);
        editor.edit((editBuilder) => {
            const currentLine = selection.active.line;
            editBuilder.replace(new vscode.Range(currentLine, 0, currentLine + 1, 0), output);
            const nextLine = currentLine + 1;
            if (nextLine < document.lineCount && document.lineAt(nextLine).text.trim() !== '') {
                editBuilder.insert(new vscode.Position(nextLine + 1, 0), '\n');
            }
            else {
                editBuilder.insert(new vscode.Position(nextLine, 0), '\n');
            }
        });
    });
    context.subscriptions.push(disposable);
}
function generateRoutes(commands) {
    let output = '';
    commands.forEach(command => {
        const parts = command.match(/(\w+)\('(\w+)','(\w+)'\)/);
        if (parts) {
            const type = parts[1];
            const prefix = parts[2];
            const controller = parts[3];
            switch (type) {
                case 'routegroup':
                    output += `Route::group(['prefix' => '${prefix}', 'controller' => [${controller}Controller::class], 'as' => '${prefix}.'], function () {\n`;
                    output += `    Route::get('/', 'index')->name('${prefix}.index');\n`;
                    output += `    Route::get('/create', 'create')->name('${prefix}.create');\n`;
                    output += `    Route::post('/store', 'store')->name('${prefix}.store');\n`;
                    output += `    Route::get('/edit/{id}', 'edit')->name('${prefix}.edit');\n`;
                    output += `    Route::put('/update/{id}', 'update')->name('${prefix}.update');\n`;
                    output += `    Route::delete('/{id}', 'destroy')->name('${prefix}.destroy');\n`;
                    output += `});\n\n`;
                    break;
                case 'routebasic':
                    output += `Route::group(['prefix' => '${prefix}'], function () {\n`;
                    output += `    Route::get('/', [${controller}Controller::class, 'index'])->name('${prefix}.index');\n`;
                    output += `    Route::get('/create', [${controller}Controller::class, 'create'])->name('${prefix}.create');\n`;
                    output += `    Route::post('/store', [${controller}Controller::class, 'store'])->name('${prefix}.store');\n`;
                    output += `    Route::get('/edit/{id}', [${controller}Controller::class, 'edit'])->name('${prefix}.edit');\n`;
                    output += `    Route::put('/update/{id}', [${controller}Controller::class, 'update'])->name('${prefix}.update');\n`;
                    output += `    Route::delete('/{id}', [${controller}Controller::class, 'destroy'])->name('${prefix}.destroy');\n`;
                    output += `});\n\n`;
                    break;
                case 'routecontroller':
                    output += `Route::group(['prefix' => '${prefix}'], function () {\n`;
                    output += `    Route::get('/', '${controller}@index')->name('${prefix}.index');\n`;
                    output += `    Route::get('/create', '${controller}@create')->name('${prefix}.create');\n`;
                    output += `    Route::post('/store', '${controller}@store')->name('${prefix}.store');\n`;
                    output += `    Route::get('/edit/{id}', '${controller}@edit')->name('${prefix}.edit');\n`;
                    output += `    Route::put('/update/{id}', '${controller}@update')->name('${prefix}.update');\n`;
                    output += `    Route::delete('/{id}', '${controller}@destroy')->name('${prefix}.destroy');\n`;
                    output += `});\n\n`;
                    break;
            }
        }
    });
    return output;
}
function deactivate() { }
