#include "../version.h"
#include "config.h"
#include <LittleFS.h>

namespace Configuration
{
    Config Configurator::_config;

    void Configurator::setup()
    {
        if (!LittleFS.begin(true))
        {
            Serial.println("Failed to mount file system.");
            return;
        }

        if (!configExists())
        {
            Serial.println("No configuration found. Creating default configuration.");
            writeConfig();
        }
        else
        {
            Serial.println("Configuration found. Loading configuration.");
        }

        _config = loadConfig();
    }

    bool Configurator::configExists()
    {
        return LittleFS.exists("/config.scp");
    }

    void Configurator::loop()
    {
        if (Serial.available())
        {
            auto inputLine = Serial.readStringUntil('\n');
            auto l = scp_line_parse(inputLine.c_str());
            if (l == nullptr)
            {
                const auto errorLine = scp_line_new(SCPLineType::SET, "error", "invalid input");
                Serial.println(scp_line_to_string(errorLine));
                return;
            }

            switch (l->type)
            {
            case GET:
            {
                if (strcmp(l->as.k, "version") == 0)
                {
                    const auto outputLine = scp_line_new(SCPLineType::SET, "version", REGENFASS_VERSION);
                    Serial.println(scp_line_to_string(outputLine));
                    return;
                }

                if (strcmp(l->as.k, "configVersion") == 0)
                {
                    const auto outputLine = scp_line_new(SCPLineType::SET, "configVersion", REGENFASS_CONFIG_VERSION);
                    Serial.println(scp_line_to_string(outputLine));
                    return;
                }

                auto outputLine = _config.applyGet(l);
                if (outputLine == nullptr)
                {
                    const auto errorLine = scp_line_new(SCPLineType::SET, "error", "invalid key");
                    Serial.println(scp_line_to_string(errorLine));
                }
                else
                {
                    Serial.println(scp_line_to_string(outputLine));
                }

                break;
            }

            case SET:
            {
                if (!_config.applySet(l))
                {
                    const auto errorLine = scp_line_new(SCPLineType::SET, "error", "invalid key");
                    Serial.println(scp_line_to_string(errorLine));
                }
                writeConfig();
                break;
            }

            case ACTION:
                // TODO: Implement actions
                break;
            }
        }
    }

    Config Configurator::loadConfig()
    {
        Config config;

        File file = LittleFS.open("/config.scp", "r");
        if (!file)
        {
            Serial.println("Failed to open configuration file.");
            return config;
        }

        while (file.available())
        {
            // split by line
            auto line = file.readStringUntil('\n');
            auto l = scp_line_parse(line.c_str());
            if (l == nullptr)
            {
                Serial.printf("Failed to parse line: %s", line);
                continue;
            }

            config.applySet(l);
        }

        file.close();

        return config;
    }

    void Configurator::writeConfig()
    {
        File file = LittleFS.open("/config.scp", "w");
        if (!file)
        {
            Serial.println("Failed to open configuration file.");
            return;
        }

        _config.write(file);

        file.close();
    }
}
