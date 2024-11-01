import * as vscode from 'vscode';
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.convertRoutes', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("There is no editor open.");
            return;
        }
        const document = editor.document;
        const selection = editor.selection;
        let text: string;
        if (selection.isEmpty) {
            text = document.getText();
            if (!text) {
                vscode.window.showWarningMessage("There is no text in the editor to convert.");
                return;
            }
        } else {
            text = document.getText(selection);
        }
        const commands: string[] = text.split('\n').filter((line: string) => line.trim() !== '');
        const output = generateRoutes(commands);
        editor.edit((editBuilder: vscode.TextEditorEdit) => {
            const currentLine = selection.active.line;
            editBuilder.replace(new vscode.Range(currentLine, 0, currentLine + 1, 0), output);
            const nextLine = currentLine + 1;
            if (nextLine < document.lineCount && document.lineAt(nextLine).text.trim() !== '') {
                editBuilder.insert(new vscode.Position(nextLine + 1, 0), '\n');
            } else {
                editBuilder.insert(new vscode.Position(nextLine, 0), '\n');
            }
        });
    });
    context.subscriptions.push(disposable);
}
function generateRoutes(commands: string[]): string {
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
export function deactivate() {}