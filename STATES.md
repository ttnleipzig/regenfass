# XState States Analyse - Regenfass Installer

## State-Übersicht

### 1. Start_CheckingWebSerialSupport

- **Zweck**: Prüft ob Web Serial API unterstützt wird
- **Eingabefelder**: Keine
- **Events**: Automatisch → `Start_FetchUpstreamVersions` (bei Support) oder `Finish_ShowingError` (ohne Support)
- **Aktionen**: Automatische Browser-Kompatibilitätsprüfung

### 2. Start_FetchUpstreamVersions

- **Zweck**: Lädt verfügbare Firmware-Versionen von GitHub
- **Eingabefelder**: Keine
- **Events**: Automatisch → `Start_WaitingForUser` (bei Erfolg) oder `Finish_ShowingError` (bei Fehler)
- **Aktionen**: HTTP-Request zu GitHub Releases

### 3. Start_WaitingForUser

- **Zweck**: Wartet auf Benutzer-Bestätigung zum Start
- **Eingabefelder**:
  - `confirmStart: boolean` (Pflicht)
- **Events**:
  - `start.next` → `Connect_Connecting`
- **Aktionen**: Benutzer-Interaktion erforderlich

### 4. Connect_Connecting

- **Zweck**: Verbindet mit dem Mikrocontroller über Serial/Bluetooth
- **Eingabefelder**:
  - `deviceType: "heltec-lora32" | "generic-esp32"` (Pflicht)
  - `portSelection: SerialPort` (automatisch)
- **Events**:
  - Automatisch → `Connect_ReadingVersion` (bei Erfolg) oder `Finish_ShowingError` (bei Fehler)
- **Aktionen**: Serial Port öffnen, SCPReader initialisieren

### 5. Connect_ReadingVersion

- **Zweck**: Liest aktuelle Firmware-Version vom Gerät
- **Eingabefelder**: Keine
- **Events**: Automatisch → `Install_WaitingForInstallationMethodChoice` (bei Erfolg) oder `Finish_ShowingError` (bei Fehler)
- **Aktionen**: SCP-Kommunikation zum Lesen der Version

### 6. Install_WaitingForInstallationMethodChoice

- **Zweck**: Benutzer wählt zwischen Install/Update
- **Eingabefelder**:
  - `installationMethod: "install" | "update"` (Pflicht)
  - `firmwareVersion: string` (aus Dropdown, Pflicht)
- **Events**:
  - `install.install` → `Install_Installing`
  - `install.update` → `Install_Updating`
- **Aktionen**: Benutzer-Entscheidung erforderlich

### 7. Install_Installing

- **Zweck**: Installiert neue Firmware auf blankem Gerät
- **Eingabefelder**: Keine
- **Events**: Automatisch → `Config_LoadingConfiguration` (bei Erfolg) oder `Finish_ShowingError` (bei Fehler)
- **Aktionen**: Firmware-Flash über SCP, Progress-Events

### 8. Install_Updating

- **Zweck**: Aktualisiert bestehende Firmware
- **Eingabefelder**: Keine
- **Events**: Automatisch → `Install_MigratingConfiguration` (bei Erfolg) oder `Finish_ShowingError` (bei Fehler)
- **Aktionen**: Firmware-Flash über SCP, Progress-Events

### 9. Install_MigratingConfiguration

- **Zweck**: Migriert Konfiguration zwischen Firmware-Versionen
- **Eingabefelder**: Keine
- **Events**: Automatisch → `Config_LoadingConfiguration` (bei Erfolg) oder `Finish_ShowingError` (bei Fehler)
- **Aktionen**: Konfigurations-Migration

### 10. Config_LoadingConfiguration

- **Zweck**: Lädt aktuelle Konfiguration vom Gerät
- **Eingabefelder**: Keine
- **Events**: Automatisch → `Config_Editing` (bei Erfolg) oder `Finish_ShowingError` (bei Fehler)
- **Aktionen**: SCP-Kommunikation zum Lesen der Konfiguration

### 11. Config_Editing

- **Zweck**: Bearbeitet LoRaWAN-Konfiguration
- **Eingabefelder**:
  - `appEUI: string` (Pflicht, 16 Zeichen Hex)
  - `appKey: string` (Pflicht, 32 Zeichen Hex)
  - `devEUI: string` (Pflicht, 16 Zeichen Hex)
  - `firmwareVersion: string` (readonly)
  - `configVersion: string` (readonly)
- **Events**:
  - `config.changeField` → Bleibt im State
  - `config.clear` → Bleibt im State
  - `config.loadFromFile` → Bleibt im State
  - `config.saveToFile` → Bleibt im State
  - `config.next` → `Config_WritingConfiguration`
- **Aktionen**: Formular-Validierung, Datei-Import/Export

### 12. Config_WritingConfiguration

- **Zweck**: Schreibt Konfiguration auf das Gerät
- **Eingabefelder**: Keine
- **Events**: Automatisch → `Finish_ShowingNextSteps` (bei Erfolg) oder `Finish_ShowingError` (bei Fehler)
- **Aktionen**: SCP-Kommunikation zum Schreiben der Konfiguration

### 13. Finish_ShowingNextSteps

- **Zweck**: Zeigt Erfolg und nächste Schritte
- **Eingabefelder**: Keine
- **Events**: Final State
- **Aktionen**: Erfolgs-Anzeige, Weiterleitung zu Cloud-Setup

### 14. Finish_ShowingError

- **Zweck**: Zeigt Fehler an
- **Eingabefelder**: Keine
- **Events**: Final State
- **Aktionen**: Fehler-Anzeige, Retry-Optionen

## Kontext-Felder (Context)

```typescript
type InstallerContext = {
  upstreamVersions: string[];
  error: Error | null;
  connection: [SerialPort, SCPReader] | null;
  configuration: Config | null;
  firmwareVersion: string | null;
}
```

## Config-Schema

```typescript
type Config = {
  firmwareVersion: string;
  configVersion: string;
  appEUI: string;
  appKey: string;
  devEUI: string;
}
```
