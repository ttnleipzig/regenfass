#include "config.h"
#include <LittleFS.h>

namespace Configuration
{
    static std::optional<Line> read(Stream &stream)
    {
        std::string line;
        if (!readLine(stream, line))
        {
            return std::nullopt;
        }

        if (line.find('=') != std::string::npos)
        {
            auto key = line.substr(0, line.find('='));
            auto value = line.substr(line.find('=') + 1);
            return Line{Type::SET, std::make_pair(key, value)};
        }
        else if (line.find('?') != std::string::npos)
        {
            auto key = line.substr(0, line.find('?'));
            return Line{Type::GET, key};
        }
        else if (line.find('!') != std::string::npos)
        {
            auto key = line.substr(0, line.find('!'));
            return Line{Type::ACTION, key};
        }

        return std::nullopt;
    }

    void Configurator::setup()
    {
        if (!configExists())
        {
            Serial.println("Config file not found.");
            // 1. Blink LED

            // 2. Open Serial Port and listen to configurations

            // 3. Save configurations to file

            return;
        }

        Serial.println("Config file found.");
        // 1. Read configurations from file
        auto fd = LittleFS.open("/config.scp", "r");
        T::Configurator::startReading(fd);
        fd.close();

        // 2. Set LoRaWAN credentials to global variables
    }

    bool Configurator::configExists()
    {
        if (!LittleFS.begin())
        {
            Serial.println("LittleFS could not be initialised.");
            return false;
        }

        return LittleFS.exists("/config.scp"));
    };

    void Configurator::startReading(Stream &stream)
    {
        while (stream.available())
        {
            // 1. Parse line and set LoRaWAN credentials
            auto kv = Config::parseLine(stream);
            if (!kv.has_value())
            {
                Serial.print(Line{Line::Type::SET, std::make_pair("error", "Invalid configuration file")});
                Serial.print(Line{Line::Type::ACTION, "report_error"});
                continue;
            }

            auto [key, value] = kv.value();
        }
    }
}
