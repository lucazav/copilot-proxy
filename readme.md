# Copilot Proxy

## Overview

Copilot Proxy is a Visual Studio Code extension that exposes the VS Code Language Model API via an Express server. This experimental extension is intended solely for research and prototyping purposes and should not be used in production environments.

**Disclaimer:**  
This extension is provided as an experiment only. It integrates the VS Code LM in a way that has been extensively explored in chats with the cline community. While these discussions have revealed both promising capabilities and notable risks, I am not recommending the use of the VS Code LM through external programs. Use this extension at your own risk.

## Features

- **Server Management:** Easily start and stop the Express server from within VS Code.
- **Customizable Port:** Configure the port the server uses through VS Code settings or via an interactive command.
- **Language Model Integration:** Relay chat-based requests and responses with support for both streaming and non-streaming modes.

## Installation

1. **Download the VSIX Package:**
   - Visit the [GitHub Releases](https://github.com/yourusername/copilot-proxy/releases) page.
   - Download the latest `.vsix` file.

2. **Install the Extension:**
   - Open Visual Studio Code.
   - Go to the Extensions view (`Ctrl+Shift+X` on Windows/Linux or `Cmd+Shift+X` on macOS).
   - Click on the three-dot menu (`...`) and choose **"Install from VSIX..."**.
   - Select the downloaded `.vsix` file.

3. **Reload VS Code:**
   - Accept the prompt to reload the window and activate the extension.

## Configuration

The extension provides a configuration setting to specify the port for the Express server:

- **Setting:** `copilotProxy.port`  
  **Default:** `3000`

You can change this setting in two ways:
- **Via Settings UI:** Open the VS Code Settings (`Ctrl+,` or `Cmd+,`) and search for "Copilot Proxy".
- **Via Command Palette:** Run the command **"Copilot Proxy: Configure Port"** to interactively set the port.

## Using the Extension

### Starting the Server

- Open the Command Palette and run **"Copilot Proxy - Start Server"**.
- The server will start on the configured port (default is `3000`), and a notification will confirm the port.

### Stopping the Server

- Open the Command Palette and run **"Copilot Proxy - Stop Server"** to shut down the server.

### Permission Prompt

On the initial request (e.g., when using Aider or other AI assistants), VS Code will prompt you to grant permission for the extension to interact with the VS Code Language Model API. Please grant permission to ensure proper operation.

## Future Enhancements

- **Screenshots & Visual Guides:** Screenshots and more detailed usage guides will be added in later updates.
- **Enhanced Configuration:** Based on user feedback, additional configuration options may be introduced.

## Contributing

Contributions, bug reports, and feature requests are welcome! Please submit issues or pull requests in the [GitHub repository](https://github.com/yourusername/copilot-proxy).

## License

This project is licensed under the ISC License.
