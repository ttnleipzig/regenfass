import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  getFormComponent, 
  getStateDisplayName, 
  getStateDescription, 
  hasCustomForm,
  stateToFormMap 
} from "../src/installer/stateToFormMap";
import { InstallerStateNames } from "../src/installer/types";

describe("State to Form Mapping Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("stateToFormMap", () => {
    it("contains all required installer states", () => {
      const expectedStates: InstallerStateNames[] = [
        "Start_CheckingWebSerialSupport",
        "Start_FetchUpstreamVersions", 
        "Start_WaitingForUser",
        "Connect_Connecting",
        "Connect_ReadingVersion",
        "Install_WaitingForInstallationMethodChoice",
        "Install_Installing",
        "Install_Updating",
        "Install_MigratingConfiguration",
        "Config_LoadingConfiguration",
        "Config_Editing",
        "Config_WritingConfiguration",
        "Finish_ShowingNextSteps",
        "Finish_ShowingError"
      ];

      expectedStates.forEach(state => {
        expect(stateToFormMap).toHaveProperty(state);
        expect(stateToFormMap[state]).toBeDefined();
      });
    });

    it("maps states to valid component functions", () => {
      Object.entries(stateToFormMap).forEach(([state, component]) => {
        expect(typeof component).toBe("function");
      });
    });
  });

  describe("getFormComponent", () => {
    it("returns the correct component for valid states", () => {
      const testStates: InstallerStateNames[] = [
        "Start_WaitingForUser",
        "Config_Editing",
        "Finish_ShowingNextSteps"
      ];

      testStates.forEach(state => {
        const component = getFormComponent(state);
        expect(component).toBe(stateToFormMap[state]);
      });
    });

    it("returns LoadingComponent for invalid states", () => {
      const invalidState = "InvalidState" as InstallerStateNames;
      const component = getFormComponent(invalidState);
      
      // Should return the default LoadingComponent
      expect(typeof component).toBe("function");
    });

    it("returns consistent components for the same state", () => {
      const state: InstallerStateNames = "Start_WaitingForUser";
      const component1 = getFormComponent(state);
      const component2 = getFormComponent(state);
      
      expect(component1).toBe(component2);
    });
  });

  describe("hasCustomForm", () => {
    it("returns true for states with custom forms", () => {
      const customFormStates: InstallerStateNames[] = [
        "Start_WaitingForUser",
        "Connect_Connecting",
        "Install_WaitingForInstallationMethodChoice",
        "Config_Editing",
        "Finish_ShowingNextSteps",
        "Finish_ShowingError"
      ];

      customFormStates.forEach(state => {
        expect(hasCustomForm(state)).toBe(true);
      });
    });

    it("returns false for states with generic loading/progress forms", () => {
      const genericFormStates: InstallerStateNames[] = [
        "Start_CheckingWebSerialSupport",
        "Start_FetchUpstreamVersions",
        "Connect_ReadingVersion",
        "Install_Installing",
        "Install_Updating", 
        "Install_MigratingConfiguration",
        "Config_LoadingConfiguration",
        "Config_WritingConfiguration"
      ];

      genericFormStates.forEach(state => {
        expect(hasCustomForm(state)).toBe(false);
      });
    });
  });

  describe("getStateDisplayName", () => {
    it("returns German display names for all states", () => {
      const expectedDisplayNames = {
        "Start_CheckingWebSerialSupport": "Browser-Kompatibilität prüfen",
        "Start_FetchUpstreamVersions": "Firmware-Versionen laden",
        "Start_WaitingForUser": "Installation starten",
        "Connect_Connecting": "Gerät verbinden",
        "Connect_ReadingVersion": "Firmware-Version lesen",
        "Install_WaitingForInstallationMethodChoice": "Installationsmethode wählen",
        "Install_Installing": "Firmware installieren",
        "Install_Updating": "Firmware aktualisieren",
        "Install_MigratingConfiguration": "Konfiguration migrieren",
        "Config_LoadingConfiguration": "Konfiguration laden",
        "Config_Editing": "Konfiguration bearbeiten",
        "Config_WritingConfiguration": "Konfiguration speichern",
        "Finish_ShowingNextSteps": "Installation abgeschlossen",
        "Finish_ShowingError": "Fehler aufgetreten"
      };

      Object.entries(expectedDisplayNames).forEach(([state, expectedName]) => {
        const displayName = getStateDisplayName(state as InstallerStateNames);
        expect(displayName).toBe(expectedName);
      });
    });

    it("returns state name as fallback for unknown states", () => {
      const unknownState = "UnknownState" as InstallerStateNames;
      const displayName = getStateDisplayName(unknownState);
      expect(displayName).toBe(unknownState);
    });

    it("returns non-empty strings for all valid states", () => {
      Object.keys(stateToFormMap).forEach(state => {
        const displayName = getStateDisplayName(state as InstallerStateNames);
        expect(displayName).toBeTruthy();
        expect(typeof displayName).toBe("string");
        expect(displayName.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getStateDescription", () => {
    it("returns German descriptions for all states", () => {
      const descriptions = {
        "Start_CheckingWebSerialSupport": "Überprüfung der Browser-Kompatibilität für Web Serial API",
        "Start_FetchUpstreamVersions": "Laden der verfügbaren Firmware-Versionen von GitHub",
        "Start_WaitingForUser": "Warten auf Benutzer-Bestätigung zum Start der Installation",
        "Connect_Connecting": "Verbindung mit dem Mikrocontroller über Serial/Bluetooth",
        "Connect_ReadingVersion": "Lesen der aktuellen Firmware-Version vom Gerät",
        "Install_WaitingForInstallationMethodChoice": "Benutzer wählt zwischen Install und Update",
        "Install_Installing": "Installation neuer Firmware auf blankem Gerät",
        "Install_Updating": "Aktualisierung bestehender Firmware",
        "Install_MigratingConfiguration": "Migration der Konfiguration zwischen Firmware-Versionen",
        "Config_LoadingConfiguration": "Laden der aktuellen Konfiguration vom Gerät",
        "Config_Editing": "Bearbeitung der LoRaWAN-Konfiguration",
        "Config_WritingConfiguration": "Schreiben der Konfiguration auf das Gerät",
        "Finish_ShowingNextSteps": "Anzeige der nächsten Schritte nach erfolgreicher Installation",
        "Finish_ShowingError": "Anzeige von Fehlern und Lösungsvorschlägen"
      };

      Object.entries(descriptions).forEach(([state, expectedDescription]) => {
        const description = getStateDescription(state as InstallerStateNames);
        expect(description).toBe(expectedDescription);
      });
    });

    it("returns empty string for unknown states", () => {
      const unknownState = "UnknownState" as InstallerStateNames;
      const description = getStateDescription(unknownState);
      expect(description).toBe("");
    });

    it("returns meaningful descriptions for all valid states", () => {
      Object.keys(stateToFormMap).forEach(state => {
        const description = getStateDescription(state as InstallerStateNames);
        expect(typeof description).toBe("string");
        // All descriptions should be meaningful (not empty for known states)
        expect(description.length).toBeGreaterThan(10);
      });
    });
  });

  describe("State Categories", () => {
    it("correctly categorizes start states", () => {
      const startStates = Object.keys(stateToFormMap).filter(state => 
        state.startsWith("Start_")
      );
      
      expect(startStates).toEqual([
        "Start_CheckingWebSerialSupport",
        "Start_FetchUpstreamVersions", 
        "Start_WaitingForUser"
      ]);

      startStates.forEach(state => {
        const displayName = getStateDisplayName(state as InstallerStateNames);
        expect(displayName).toBeTruthy();
      });
    });

    it("correctly categorizes connect states", () => {
      const connectStates = Object.keys(stateToFormMap).filter(state => 
        state.startsWith("Connect_")
      );
      
      expect(connectStates).toEqual([
        "Connect_Connecting",
        "Connect_ReadingVersion"
      ]);
    });

    it("correctly categorizes install states", () => {
      const installStates = Object.keys(stateToFormMap).filter(state => 
        state.startsWith("Install_")
      );
      
      expect(installStates).toEqual([
        "Install_WaitingForInstallationMethodChoice",
        "Install_Installing",
        "Install_Updating",
        "Install_MigratingConfiguration"
      ]);
    });

    it("correctly categorizes config states", () => {
      const configStates = Object.keys(stateToFormMap).filter(state => 
        state.startsWith("Config_")
      );
      
      expect(configStates).toEqual([
        "Config_LoadingConfiguration",
        "Config_Editing",
        "Config_WritingConfiguration"
      ]);
    });

    it("correctly categorizes finish states", () => {
      const finishStates = Object.keys(stateToFormMap).filter(state => 
        state.startsWith("Finish_")
      );
      
      expect(finishStates).toEqual([
        "Finish_ShowingNextSteps",
        "Finish_ShowingError"
      ]);
    });
  });
});