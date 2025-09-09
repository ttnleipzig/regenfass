# Troubleshooting Guide

## Common Issues and Solutions

This guide covers common problems you might encounter when developing or using the Regenfass Installer, along with their solutions.

## Browser Compatibility Issues

### Web Serial API Not Supported

**Symptoms:**
- Error message: "Ihr Browser unterstützt die Web Serial API nicht"
- `navigator.serial` is undefined
- Cannot connect to devices

**Causes:**
- Using unsupported browser (Firefox, Safari)
- Browser version too old
- Site not served over HTTPS

**Solutions:**

1. **Use Supported Browser:**
   ```bash
   Supported browsers:
   - Chrome 89+
   - Edge 89+ 
   - Opera 76+
   ```

2. **Update Browser:**
   - Check browser version: `chrome://version/`
   - Update to latest version
   - Restart browser after update

3. **Serve Over HTTPS:**
   ```bash
   # Development with HTTPS
   pnpm dev --https
   
   # Or use localhost (also allowed)
   http://localhost:5173
   ```

4. **Check Feature Detection:**
   ```javascript
   // Test in browser console
   console.log('Serial API support:', 'serial' in navigator);
   console.log('Secure context:', window.isSecureContext);
   ```

### Permission Denied Errors

**Symptoms:**
- "Zugriff auf den Serial Port wurde verweigert"
- Port selection dialog doesn't appear
- Connection fails immediately

**Solutions:**

1. **Reset Site Permissions:**
   - Chrome: Settings → Privacy and Security → Site Settings → Additional content settings → Serial ports
   - Clear permissions for your site
   - Reload page and try again

2. **Check Site Settings:**
   - Ensure serial port access is not blocked
   - Allow permissions when prompted
   - Site must be in "Allow" list

3. **Browser Flags (Development):**
   ```
   chrome://flags/#enable-web-serial
   Ensure this is enabled
   ```

## Device Connection Issues

### Device Not Found

**Symptoms:**
- Empty device list in selection dialog
- "Kein kompatibles Gerät gefunden"
- Connection timeout

**Diagnostics:**

1. **Check Physical Connection:**
   ```bash
   # Linux: List USB devices
   lsusb
   
   # macOS: System Information → USB
   # Windows: Device Manager → Ports (COM & LPT)
   ```

2. **Verify Driver Installation:**
   - ESP32: CP210x or CH340 drivers
   - ESP8266: CH340 or FTDI drivers
   - Download from manufacturer website

3. **Test with Other Software:**
   ```bash
   # Arduino IDE
   # PlatformIO
   # esptool.py
   python -m esptool chip_id
   ```

**Solutions:**

1. **Install Correct Drivers:**
   ```bash
   # ESP32 (CP210x)
   https://www.silabs.com/products/development-tools/software/usb-to-uart-bridge-vcp-drivers
   
   # ESP8266 (CH340)
   https://sparks.gogo.co.nz/ch340.html
   ```

2. **Check USB Cable:**
   - Use data cable (not power-only)
   - Try different USB port
   - Test cable with other devices

3. **Reset Device:**
   - Unplug and reconnect
   - Hold reset button while connecting
   - Try different baud rates

### Connection Timeout

**Symptoms:**
- Connection starts but times out
- "Verbindung nicht möglich"
- Device disconnects during process

**Solutions:**

1. **Check Baud Rate:**
   ```javascript
   // Common baud rates to try
   const baudRates = [115200, 9600, 57600, 38400];
   ```

2. **Close Competing Software:**
   - Arduino IDE Serial Monitor
   - PlatformIO Serial Monitor
   - Other terminal programs

3. **Restart Browser:**
   - Close all tabs
   - Restart browser completely
   - Try connection again

4. **Check System Resources:**
   ```bash
   # Check if port is in use
   # Linux
   sudo lsof /dev/ttyUSB0
   
   # macOS
   sudo lsof /dev/cu.SLAB_USBtoUART
   ```

## Firmware Installation Issues

### Upload Fails

**Symptoms:**
- Installation starts but fails midway
- "Firmware-Installation fehlgeschlagen"
- Device becomes unresponsive

**Solutions:**

1. **Put Device in Boot Mode:**
   ```
   ESP32:
   1. Hold BOOT button
   2. Press and release RESET
   3. Release BOOT button
   
   ESP8266:
   1. Hold FLASH button
   2. Press and release RESET
   3. Release FLASH button
   ```

2. **Check Power Supply:**
   - Use powered USB hub if needed
   - Ensure stable power during flashing
   - Try different USB port

3. **Verify Firmware File:**
   - Check file integrity
   - Download firmware again
   - Verify file size matches expected

### Verification Errors

**Symptoms:**
- Upload completes but verification fails
- "Firmware-Verifikation fehlgeschlagen"
- Device doesn't boot after flash

**Solutions:**

1. **Retry Installation:**
   - Clear device flash completely
   - Try slower baud rate
   - Use shorter USB cable

2. **Check Flash Size:**
   ```javascript
   // Verify device flash size matches firmware
   const deviceInfo = await esptool.readDeviceInfo();
   console.log('Flash size:', deviceInfo.flashSize);
   ```

3. **Factory Reset:**
   - Erase entire flash
   - Reinstall firmware from scratch
   - Reconfigure device

## Configuration Issues

### Invalid LoRaWAN Parameters

**Symptoms:**
- "AppEUI muss 16 Hexadezimalzeichen lang sein"
- Configuration validation errors
- Unable to save configuration

**Solutions:**

1. **Check Parameter Format:**
   ```javascript
   // Valid formats
   AppEUI: "0000000000000000" (16 hex chars)
   AppKey: "00000000000000000000000000000000" (32 hex chars)
   DevEUI: "0000000000000000" (16 hex chars)
   
   // Invalid examples
   AppEUI: "0000000000000000 " (trailing space)
   AppKey: "0000000000000000000000000000000G" (invalid hex)
   DevEUI: "000000000000000" (too short)
   ```

2. **Use Copy-Paste:**
   - Copy parameters directly from LoRaWAN provider
   - Avoid manual typing
   - Check for hidden characters

3. **Validate Externally:**
   ```bash
   # Online hex validator
   # Check with LoRaWAN provider
   # Verify against device documentation
   ```

### Configuration Import Fails

**Symptoms:**
- "Ungültige Konfigurationsdatei"
- JSON parsing errors
- File upload rejected

**Solutions:**

1. **Check JSON Format:**
   ```json
   {
     "appEUI": "0000000000000000",
     "appKey": "00000000000000000000000000000000",
     "devEUI": "0000000000000000",
     "firmwareVersion": "1.0.0"
   }
   ```

2. **Validate JSON:**
   ```bash
   # Use online JSON validator
   # Check for trailing commas
   # Verify all quotes are straight quotes
   ```

3. **File Size Limits:**
   - Keep configuration files under 1MB
   - Remove unnecessary fields
   - Use minimal formatting

## Network and API Issues

### GitHub API Rate Limiting

**Symptoms:**
- "API rate limit exceeded"
- Cannot fetch firmware versions
- 403 Forbidden errors

**Solutions:**

1. **Wait for Reset:**
   ```javascript
   // Check rate limit status
   fetch('https://api.github.com/rate_limit')
     .then(r => r.json())
     .then(data => console.log(data));
   ```

2. **Use Authentication (Development):**
   ```bash
   # Create GitHub personal access token
   # Add to environment variables
   VITE_GITHUB_TOKEN=your_token_here
   ```

3. **Cache Results:**
   - Firmware versions are cached locally
   - Clear browser cache if stale
   - Refresh page to retry

### Network Connectivity

**Symptoms:**
- Cannot load firmware versions
- Network errors in console
- Offline mode not working

**Solutions:**

1. **Check Internet Connection:**
   ```bash
   # Test GitHub API access
   curl https://api.github.com/repos/ttnleipzig/regenfass/releases
   ```

2. **Firewall/Proxy Issues:**
   - Check corporate firewall settings
   - Verify GitHub API is accessible
   - Try from different network

3. **DNS Issues:**
   ```bash
   # Test DNS resolution
   nslookup api.github.com
   ```

## Development Issues

### Build Errors

**Symptoms:**
- TypeScript compilation errors
- Vite build failures
- Module resolution errors

**Solutions:**

1. **Clear Cache:**
   ```bash
   # Clear all caches
   rm -rf node_modules/.vite
   rm -rf node_modules/.cache
   pnpm install
   ```

2. **Check Node Version:**
   ```bash
   # Verify Node.js version
   node --version  # Should be 18+
   
   # Update if needed
   nvm install 18
   nvm use 18
   ```

3. **Fix Import Paths:**
   ```typescript
   // Use absolute imports
   import { TextInput } from "@/components/forms/TextInput";
   
   // Instead of relative
   import { TextInput } from "../../components/forms/TextInput";
   ```

### Test Failures

**Symptoms:**
- Tests pass locally but fail in CI
- Flaky test results
- Mock-related errors

**Solutions:**

1. **Check Test Environment:**
   ```bash
   # Ensure consistent Node version
   # Check environment variables
   # Verify test setup files
   ```

2. **Fix Async Issues:**
   ```typescript
   // Use waitFor for async operations
   await waitFor(() => {
     expect(screen.getByText("Expected text")).toBeInTheDocument();
   });
   
   // Instead of immediate assertion
   expect(screen.getByText("Expected text")).toBeInTheDocument();
   ```

3. **Mock Cleanup:**
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
     cleanup(); // Clean up DOM
   });
   ```

### Hot Reload Issues

**Symptoms:**
- Changes not reflected in browser
- Full page reloads instead of HMR
- Console warnings about HMR

**Solutions:**

1. **Check File Extensions:**
   ```typescript
   // Use .tsx for JSX files
   // Use .ts for TypeScript only
   // Avoid mixing extensions
   ```

2. **Restart Dev Server:**
   ```bash
   # Kill dev server
   Ctrl+C
   
   # Restart
   pnpm dev
   ```

3. **Clear Browser Cache:**
   ```bash
   # Hard refresh
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (macOS)
   ```

## Performance Issues

### Slow Installation Process

**Symptoms:**
- Firmware upload takes very long
- Browser becomes unresponsive
- Memory usage increases

**Solutions:**

1. **Reduce Baud Rate:**
   ```javascript
   // Try slower speeds for stability
   const baudRates = [115200, 57600, 38400, 9600];
   ```

2. **Close Other Applications:**
   - Close unnecessary browser tabs
   - Exit memory-intensive applications
   - Free up system resources

3. **Use Shorter USB Cable:**
   - Cables over 3m can cause issues
   - Use high-quality shielded cables
   - Avoid USB hubs when possible

### High Memory Usage

**Symptoms:**
- Browser tab crashes
- System becomes slow
- Out of memory errors

**Solutions:**

1. **Restart Browser:**
   ```bash
   # Close all tabs
   # Restart browser completely
   # Monitor memory usage
   ```

2. **Check for Memory Leaks:**
   ```javascript
   // Monitor in DevTools
   // Performance tab → Memory
   // Look for growing heap usage
   ```

3. **Update Browser:**
   - Use latest browser version
   - Enable hardware acceleration
   - Clear browser data if needed

## Security Issues

### Content Security Policy

**Symptoms:**
- CSP violation errors in console
- Resources blocked from loading
- Serial API blocked

**Solutions:**

1. **Update CSP Headers:**
   ```html
   <!-- Allow serial API -->
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; connect-src 'self' https://api.github.com">
   ```

2. **Check Server Configuration:**
   - Verify CSP headers
   - Allow necessary domains
   - Test in incognito mode

### HTTPS Requirements

**Symptoms:**
- Serial API not available over HTTP
- Security warnings in browser
- Features disabled

**Solutions:**

1. **Use HTTPS in Production:**
   ```nginx
   # Nginx configuration
   server {
     listen 443 ssl;
     ssl_certificate /path/to/cert.pem;
     ssl_certificate_key /path/to/key.pem;
   }
   ```

2. **Development HTTPS:**
   ```bash
   # Use mkcert for local HTTPS
   mkcert localhost
   pnpm dev --https --cert localhost.pem --key localhost-key.pem
   ```

## Getting Additional Help

### Diagnostic Information

When reporting issues, include:

1. **Browser Information:**
   ```javascript
   console.log('User Agent:', navigator.userAgent);
   console.log('Serial Support:', 'serial' in navigator);
   console.log('Secure Context:', window.isSecureContext);
   ```

2. **Device Information:**
   ```bash
   # Operating System and version
   # USB device IDs (lsusb output)
   # Driver versions
   ```

3. **Error Details:**
   - Complete error messages
   - Browser console output
   - Network tab information
   - Steps to reproduce

### Debug Mode

Enable debug mode for additional logging:

```javascript
// Add to browser console
localStorage.setItem('debug', 'regenfass:*');
```

### Log Collection

```javascript
// Collect relevant logs
const logs = {
  userAgent: navigator.userAgent,
  serialSupport: 'serial' in navigator,
  errors: [], // Copy from console
  performance: performance.getEntriesByType('navigation')
};

console.log('Debug info:', JSON.stringify(logs, null, 2));
```

### Support Channels

1. **GitHub Issues**: https://github.com/ttnleipzig/regenfass/issues
2. **Documentation**: Check docs/ directory
3. **Community Forum**: For user discussions
4. **Technical Support**: For critical issues

### Before Contacting Support

1. Check this troubleshooting guide
2. Search existing GitHub issues
3. Try in incognito/private browsing mode
4. Test with different browser if possible
5. Gather diagnostic information listed above