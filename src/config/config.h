#pragma once

#include <string>
#include <Arduino.h>

namespace Configuration
{
    struct Line
    {
        enum class Type
        {
            // `<KEY>=<VALUE>\n`
            SET,
            // `<KEY>?\n`
            GET,
            // `<KEY>!\n`
            ACTION
        } type;

        union
        {
            std::pair<std::string, std::string> set;
            std::string get;
            std::string action;
        } data;

        static std::optional<Line> parse(Stream &stream);

        std::string toString()
        {
            switch (type)
            {
            case Type::SET:
                return data.set.first + "=" + data.set.second + "\n";
            case Type::GET:
                return data.get + "?\n";
            case Type::ACTION:
                return data.action + "!\n";
            }
        }

        static bool validate(Line line)
        {
            switch (line->type)
            {
            case Line::Type::SET:
                return validateSet(line->data.set.first, line->data.set.second);
            case Line::Type::GET:
                return !line->data.get.empty();
            case Line::Type::ACTION:
                return !line->data.action.empty();
            }
        }

    private:
        static bool validateSet(std::string key, std::string value)
        {
            if (key.find('=') != std::string::npos || key.find('\n') != std::string::npos || key.find('?') != std::string::npos || key.find('!') != std::string::npos)
            {
                return false;
            }

            return false;
        }
    }

    struct Config
    {
        std::string appEui;
        std::string appKey;
        std::string devEui;

        void apply(Line line)
        {
            switch (line->type)
            {
            case Line::Type::SET:
                if (line->data.set.first == "appEui")
                {
                    config.appEui = line->data.set.second;
                }
                else if (line->data.set.first == "appKey")
                {
                    config.appKey = line->data.set.second;
                }
                else if (line->data.set.first == "devEui")
                {
                    config.devEui = line->data.set.second;
                }
                break;
            case Line::Type::GET:
                break;
            case Line::Type::ACTION:
                break;
            }

            return config;
        }

        /**
         * Writes the configuration data to the specified stream.
         *
         * @param stream The stream to write the configuration data to.
         */
        void write(Stream &stream)
        {
#define WRITE(key) writeLine(stream, #key, key)

            WRITE(appEui);
            WRITE(appKey);
            WRITE(devEui);

#undef WRITE

            stream.flush();
        }

    }

    class Configurator
    {
    public:
        static void setup();
        static bool configExists();
        static void startReading(Stream &stream);

    private:
        static Config readConfig();
        static void writeConfig(T config);

        Config _config;
    }
}
