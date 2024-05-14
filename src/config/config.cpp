#include "config.h"
#include <LittleFS.h>

namespace Configuration
{
    Config Configurator::_config;

    void Configurator::setup()
    {
        if (!configExists())
        {
            Serial.println("No configuration found. Creating default configuration.");
        }
        else
        {
            Serial.println("Configuration found. Loading configuration.");
            loadConfig();
        }
    }

    bool Configurator::configExists()
    {
        return LittleFS.exists("config.scp");
    }

    Config Configurator::loadConfig()
    {
        Config config;

        File file = LittleFS.open("config.scp", "r");
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

            config.apply(l);
        }

        file.close();

        return config;
    }

    void Configurator::writeConfig()
    {
        File file = LittleFS.open("config.scp", "w");
        if (!file)
        {
            Serial.println("Failed to open configuration file.");
            return;
        }

        _config.write(file);

        file.close();
    }
}
