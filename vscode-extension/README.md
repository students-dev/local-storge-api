# Local Storage API VS Code Extension

**Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi**

A comprehensive VS Code extension for debugging, inspecting, and managing Local Storage API applications.

## Features

### Storage Explorer
- **Tree View**: Hierarchical view of all storage layers
- **Real-time Updates**: Live synchronization with storage changes
- **Layer Inspection**: IndexedDB, LocalStorage, and memory layers
- **Search & Filter**: Find specific keys and data patterns

### Inspector Panel
- **Data Visualization**: Formatted display of complex objects
- **Type Analysis**: Data type distribution and statistics
- **Metadata View**: Creation/update times, versions, TTL
- **Interactive Editing**: Modify values directly in the IDE

### Metrics Dashboard
- **Performance Monitoring**: Read/write latency and throughput
- **Storage Usage**: Per-layer capacity utilization
- **Error Tracking**: Failed operations and error rates
- **Real-time Charts**: Live performance graphs

### Snapshot Management
- **Create Snapshots**: Save current storage state
- **Load Snapshots**: Restore previous states
- **Compare Snapshots**: Side-by-side diff viewer
- **Snapshot History**: Timeline of all saved states

### Diff Viewer
- **Visual Comparison**: Side-by-side state comparison
- **Change Highlighting**: Added, removed, and modified items
- **Merge Tools**: Conflict resolution helpers
- **Export Diffs**: Save comparison results

## Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Local Storage API"
4. Click Install

### From Source (Development)
1. Clone the Local Storage API repository
2. Navigate to `vscode-extension/` directory
3. Run `npm install`
4. Press F5 to launch extension development host

## Usage

### Basic Inspection
1. Open a project using Local Storage API
2. Open Storage Explorer in the sidebar
3. Click on storage items to inspect their values
4. Use the search box to filter items

### Performance Monitoring
1. Run `Local Storage API: Show Metrics`
2. View operation counts and latency charts
3. Monitor storage usage over time
4. Identify performance bottlenecks

### Debugging Storage Issues
1. Create a snapshot before making changes
2. Perform operations that might cause issues
3. Compare current state with the snapshot
4. Use the diff viewer to identify changes

### Migration Management
1. Open the migration panel
2. View pending migrations
3. Run migrations individually or in batch
4. Monitor migration progress and errors

## Commands

### Core Commands
- `Local Storage API: Open Inspector` - Open main inspection panel
- `Local Storage API: Clear Storage` - Clear all storage data
- `Local Storage API: Export Storage` - Export data to file
- `Local Storage API: Import Storage` - Import data from file

### Advanced Commands
- `Local Storage API: Generate Snapshot` - Create storage snapshot
- `Local Storage API: Compare Snapshots` - Compare two snapshots
- `Local Storage API: Migrate Database` - Run database migrations
- `Local Storage API: Show Metrics` - Display performance metrics
- `Local Storage API: Run Benchmark` - Execute performance tests
- `Local Storage API: Open REPL` - Launch storage REPL terminal

### Development Commands
- `Local Storage API: Toggle Debug Mode` - Enable/disable debug logging
- `Local Storage API: Reset Metrics` - Clear performance metrics
- `Local Storage API: Export Logs` - Save debug logs to file

## Configuration

### Extension Settings
Access via `Preferences: Open Settings (UI)` > Extensions > Local Storage API

- **Auto Refresh**: Automatically refresh views on storage changes
- **Max Items Display**: Limit items shown in tree view
- **Theme**: Light/dark theme for panels
- **Debug Level**: Logging verbosity
- **Snapshot Auto-save**: Automatically create snapshots

### Workspace Settings
Project-specific configuration in `.vscode/settings.json`:

```json
{
  "localStorageAPI": {
    "namespace": "myapp",
    "profile": "max-compression",
    "debug": true,
    "autoRefresh": true
  }
}
```

## Panels and Views

### Storage Inspector Panel
Main inspection interface with multiple tabs:

- **Overview**: Summary statistics and quick actions
- **Data**: Detailed data browser with filtering
- **Metrics**: Performance charts and analytics
- **Snapshots**: Snapshot management interface
- **Migrations**: Migration status and controls

### Metrics Panel
Dedicated performance monitoring:

- **Real-time Charts**: Live updating graphs
- **Historical Data**: Past performance trends
- **Alerts**: Performance threshold notifications
- **Export**: Save metrics data for analysis

### Diff Panel
Side-by-side comparison interface:

- **File Comparison**: Traditional diff view
- **Tree Comparison**: Hierarchical structure diff
- **Value Comparison**: Detailed value changes
- **Merge Tools**: Conflict resolution helpers

## Keyboard Shortcuts

- `Ctrl+Shift+S` - Generate snapshot
- `Ctrl+Shift+M` - Show metrics
- `Ctrl+Shift+I` - Open inspector
- `Ctrl+Shift+C` - Clear storage (with confirmation)

## REPL Terminal

Interactive storage console for advanced operations:

```javascript
// Access storage API
> storage.save('test', { data: 'value' })

// Query operations
> storage.query().filter(v => v.price > 100).execute()

// Direct layer access
> storage.layers[0].get('key')

// Performance testing
> storage.benchmark(1000)
```

## Troubleshooting

### Extension Not Loading
- Ensure Local Storage API is installed in the project
- Check VS Code version compatibility (1.60+)
- Reload VS Code window

### Storage Not Visible
- Verify storage operations are called
- Check namespace configuration
- Ensure browser has storage permissions
- Try refreshing the extension views

### Performance Issues
- Disable auto-refresh for large datasets
- Increase display limits in settings
- Use filtering to reduce displayed items
- Clear old snapshots to free memory

### Connection Issues
- Check if webview is properly initialized
- Verify content security policy allows extension
- Try restarting VS Code

## Development

### Building the Extension
```bash
cd vscode-extension
npm install
npm run compile
```

### Testing the Extension
1. Press F5 to launch debug session
2. In new window, open test project
3. Use extension features
4. Check debug console for errors

### Publishing
1. Update version in `package.json`
2. Run `vsce package` to create .vsix file
3. Upload to VS Code Marketplace

## API Integration

The extension communicates with your application through:

- **Webview Messaging**: Bidirectional communication
- **Content Scripts**: Injected into web pages
- **Background Scripts**: Persistent storage monitoring

### Custom Integration
```javascript
// In your application
if (window.vscode) {
  // VS Code environment detected
  window.vscode.postMessage({
    type: 'storage-update',
    data: { key: 'example', value: 'data' }
  });
}
```

## Security Considerations

- Extension only accesses storage through official API
- No direct file system access
- Content security policy enforced
- User confirmation for destructive operations

## Contributing

1. Report issues on GitHub
2. Submit feature requests
3. Contribute code via pull requests
4. Test with different storage scenarios

## License

MIT License - see LICENSE file for details.

## Support

- **Documentation**: Full user guide and API reference
- **Issues**: GitHub issue tracker
- **Discussions**: GitHub discussions for questions
- **Updates**: Follow repository for new releases