/**
 * Local Storage API VS Code Extension
 * Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi
 * License: MIT
 */

const vscode = require('vscode');

function activate(context) {
    console.log('Local Storage API extension is now active!');

    // Register commands
    let openInspector = vscode.commands.registerCommand('localStorageAPI.openInspector', function () {
        vscode.window.showInformationMessage('Local Storage API Inspector opened!');
        createInspectorPanel();
    });

    let clearStorage = vscode.commands.registerCommand('localStorageAPI.clearStorage', async function () {
        const confirm = await vscode.window.showWarningMessage(
            'Are you sure you want to clear all storage?',
            'Yes', 'No'
        );
        if (confirm === 'Yes') {
            vscode.window.showInformationMessage('Storage cleared!');
        }
    });

    let exportStorage = vscode.commands.registerCommand('localStorageAPI.exportStorage', async function () {
        const uri = await vscode.window.showSaveDialog({
            filters: { 'JSON': ['json'] },
            defaultUri: vscode.Uri.file('storage-export.json')
        });
        if (uri) {
            vscode.window.showInformationMessage(`Storage exported to ${uri.fsPath}`);
        }
    });

    let generateSnapshot = vscode.commands.registerCommand('localStorageAPI.generateSnapshot', function () {
        vscode.window.showInputBox({
            prompt: 'Enter snapshot name'
        }).then(name => {
            if (name) {
                vscode.window.showInformationMessage(`Snapshot "${name}" created!`);
            }
        });
    });

    let compareSnapshots = vscode.commands.registerCommand('localStorageAPI.compareSnapshots', function () {
        vscode.window.showQuickPick(['snapshot1', 'snapshot2'], {
            placeHolder: 'Select first snapshot'
        }).then(snapshot1 => {
            if (snapshot1) {
                vscode.window.showQuickPick(['snapshot1', 'snapshot2'], {
                    placeHolder: 'Select second snapshot'
                }).then(snapshot2 => {
                    if (snapshot2) {
                        vscode.window.showInformationMessage(`Comparing ${snapshot1} vs ${snapshot2}`);
                        createDiffPanel(snapshot1, snapshot2);
                    }
                });
            }
        });
    });

    let migrateDatabase = vscode.commands.registerCommand('localStorageAPI.migrateDatabase', function () {
        vscode.window.showInformationMessage('Database migration started...');
    });

    let showMetrics = vscode.commands.registerCommand('localStorageAPI.showMetrics', function () {
        vscode.window.showInformationMessage('Showing storage metrics...');
        createMetricsPanel();
    });

    // Register tree data provider for sidebar
    const storageProvider = new StorageTreeProvider();
    vscode.window.registerTreeDataProvider('storageExplorer', storageProvider);

    // Register webview providers
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('storageInspector', new StorageInspectorProvider()),
        vscode.window.registerWebviewViewProvider('storageMetrics', new StorageMetricsProvider())
    );

    context.subscriptions.push(
        openInspector, clearStorage, exportStorage,
        generateSnapshot, compareSnapshots, migrateDatabase, showMetrics
    );
}

function deactivate() {}

class StorageTreeProvider {
    getTreeItem(element) {
        return element;
    }

    getChildren(element) {
        if (!element) {
            // Root level
            return [
                new StorageItem('IndexedDB', 'IndexedDB databases', vscode.TreeItemCollapsibleState.Collapsed),
                new StorageItem('LocalStorage', 'LocalStorage items', vscode.TreeItemCollapsibleState.Collapsed),
                new StorageItem('Memory', 'In-memory cache', vscode.TreeItemCollapsibleState.Collapsed)
            ];
        }
        // Return child items based on element
        return [];
    }
}

class StorageItem extends vscode.TreeItem {
    constructor(label, tooltip, collapsibleState) {
        super(label, collapsibleState);
        this.tooltip = tooltip;
        this.contextValue = 'storageItem';
    }
}

class StorageInspectorProvider {
    resolveWebviewView(webviewView) {
        webviewView.webview.html = getInspectorHtml();
    }
}

class StorageMetricsProvider {
    resolveWebviewView(webviewView) {
        webviewView.webview.html = getMetricsHtml();
    }
}

function createInspectorPanel() {
    const panel = vscode.window.createWebviewPanel(
        'storageInspector',
        'Storage Inspector',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );
    panel.webview.html = getInspectorHtml();
}

function createDiffPanel(snapshot1, snapshot2) {
    const panel = vscode.window.createWebviewPanel(
        'snapshotDiff',
        `Diff: ${snapshot1} vs ${snapshot2}`,
        vscode.ViewColumn.One,
        { enableScripts: true }
    );
    panel.webview.html = getDiffHtml(snapshot1, snapshot2);
}

function createMetricsPanel() {
    const panel = vscode.window.createWebviewPanel(
        'storageMetrics',
        'Storage Metrics',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );
    panel.webview.html = getMetricsHtml();
}

function getInspectorHtml() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Storage Inspector</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .storage-tree { border: 1px solid #ccc; padding: 10px; margin: 10px 0; }
            .item { margin: 5px 0; padding: 5px; border-left: 3px solid #007acc; }
            .metrics { background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 4px; }
            .controls { margin: 10px 0; }
            button { margin: 0 5px; padding: 5px 10px; }
        </style>
    </head>
    <body>
        <h1>🗄️ Local Storage API Inspector</h1>

        <div class="metrics">
            <h3>Quick Stats</h3>
            <p>Keys: <span id="keyCount">-</span></p>
            <p>Size: <span id="size">-</span></p>
            <p>Layer: <span id="layer">-</span></p>
        </div>

        <div class="controls">
            <button onclick="refresh()">Refresh</button>
            <button onclick="clearStorage()">Clear All</button>
            <button onclick="exportData()">Export</button>
        </div>

        <div class="storage-tree">
            <h3>Storage Tree</h3>
            <div id="tree">Loading...</div>
        </div>

        <script>
            const vscode = acquireVsCodeApi();

            function refresh() {
                vscode.postMessage({ type: 'refresh' });
            }

            function clearStorage() {
                if (confirm('Are you sure you want to clear all storage?')) {
                    vscode.postMessage({ type: 'clear' });
                }
            }

            function exportData() {
                vscode.postMessage({ type: 'export' });
            }

            // Handle messages from extension
            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.type) {
                    case 'update':
                        updateDisplay(message.data);
                        break;
                }
            });

            function updateDisplay(data) {
                document.getElementById('keyCount').textContent = data.keyCount || 0;
                document.getElementById('size').textContent = data.size || '0 B';
                document.getElementById('layer').textContent = data.layer || 'Unknown';
                document.getElementById('tree').innerHTML = data.treeHtml || 'No data';
            }
        </script>
    </body>
    </html>
    `;
}

function getMetricsHtml() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Storage Metrics</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .metric { display: flex; justify-content: space-between; padding: 8px; margin: 5px 0; background: #f8f9fa; border-radius: 4px; }
            .chart { height: 200px; background: #f0f0f0; margin: 20px 0; border-radius: 4px; display: flex; align-items: end; justify-content: space-around; }
            .bar { background: #007acc; min-width: 30px; border-radius: 4px 4px 0 0; transition: height 0.3s; }
            .controls { margin: 10px 0; }
            button { margin: 0 5px; padding: 5px 10px; }
        </style>
    </head>
    <body>
        <h1>📊 Storage Metrics</h1>

        <div class="controls">
            <button onclick="refresh()">Refresh</button>
            <button onclick="reset()">Reset Metrics</button>
        </div>

        <div id="metrics">
            <div class="metric"><span>Reads:</span><span id="reads">-</span></div>
            <div class="metric"><span>Writes:</span><span id="writes">-</span></div>
            <div class="metric"><span>Deletes:</span><span id="deletes">-</span></div>
            <div class="metric"><span>Avg Read Latency:</span><span id="readLatency">-</span></div>
            <div class="metric"><span>Avg Write Latency:</span><span id="writeLatency">-</span></div>
            <div class="metric"><span>Errors:</span><span id="errors">-</span></div>
        </div>

        <div class="chart" id="performanceChart">
            <div class="bar" style="height: 20%" title="Reads"></div>
            <div class="bar" style="height: 15%" title="Writes"></div>
            <div class="bar" style="height: 5%" title="Deletes"></div>
        </div>

        <script>
            const vscode = acquireVsCodeApi();

            function refresh() {
                vscode.postMessage({ type: 'refresh' });
            }

            function reset() {
                vscode.postMessage({ type: 'reset' });
            }

            window.addEventListener('message', event => {
                const message = event.data;
                if (message.type === 'update') {
                    updateMetrics(message.data);
                }
            });

            function updateMetrics(data) {
                document.getElementById('reads').textContent = data.reads || 0;
                document.getElementById('writes').textContent = data.writes || 0;
                document.getElementById('deletes').textContent = data.deletes || 0;
                document.getElementById('readLatency').textContent = (data.avgReadLatency || 0).toFixed(2) + 'ms';
                document.getElementById('writeLatency').textContent = (data.avgWriteLatency || 0).toFixed(2) + 'ms';
                document.getElementById('errors').textContent = data.errors?.length || 0;
            }
        </script>
    </body>
    </html>
    `;
}

function getDiffHtml(snapshot1, snapshot2) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Snapshot Diff</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .diff-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 4px; }
            .added { color: green; background: #e8f5e8; padding: 2px 4px; border-radius: 2px; }
            .removed { color: red; background: #ffe8e8; padding: 2px 4px; border-radius: 2px; }
            .changed { color: orange; background: #fff3e0; padding: 2px 4px; border-radius: 2px; }
            .item { margin: 5px 0; padding: 5px; }
            .summary { font-weight: bold; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <h1>🔄 Snapshot Comparison</h1>
        <h2>${snapshot1} vs ${snapshot2}</h2>

        <div class="diff-section">
            <div class="summary added">Added Keys: <span id="added-count">0</span></div>
            <div id="added">Loading...</div>
        </div>

        <div class="diff-section">
            <div class="summary removed">Removed Keys: <span id="removed-count">0</span></div>
            <div id="removed">Loading...</div>
        </div>

        <div class="diff-section">
            <div class="summary changed">Changed Keys: <span id="changed-count">0</span></div>
            <div id="changed">Loading...</div>
        </div>

        <script>
            const vscode = acquireVsCodeApi();

            window.addEventListener('message', event => {
                const message = event.data;
                if (message.type === 'update') {
                    updateDiff(message.data);
                }
            });

            function updateDiff(data) {
                updateSection('added', data.added || []);
                updateSection('removed', data.removed || []);
                updateSection('changed', data.changed || []);
            }

            function updateSection(type, items) {
                const container = document.getElementById(type);
                const count = document.getElementById(type + '-count');

                count.textContent = items.length;
                container.innerHTML = items.length ?
                    items.map(item => \`<div class="item ${type}">${item}</div>\`).join('') :
                    'No changes';
            }
        </script>
    </body>
    </html>
    `;
}

module.exports = {
    activate,
    deactivate
};