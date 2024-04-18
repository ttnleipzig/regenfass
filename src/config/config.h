#pragma once

#include <string>
#include <Arduino.h>
#include <scp.h>

using namespace SCP;

namespace Configuration
{
    struct Config
    {
        std::string appEui;
        std::string appKey;
        std::string devEui;

        void apply(Line line)
        {
            if (line.type != Line::Type::SET)
            {
                return;
            }

            const auto k = line.data.kv.first;
            const auto v = line.data.kv.second;
            if (k == "appEui")
            {
                this->appEui = v;
            }
            else if (k == "appKey")
            {
                this->appKey = v;
            }
            else if (k == "devEui")
            {
                this->devEui = v;
            }
        }

        /**
         * Writes the configuration data to the specified stream.
         *
         * @param stream The stream to write the configuration data to.
         */
        void write(Stream &stream)
        {
#define WRITE(key) stream.write(SCP::Line(SCP::Line::Type::SET, std::make_pair(#key, key)).toString().c_str());
            WRITE(appEui);
            WRITE(appKey);
            WRITE(devEui);
#undef WRITE

            stream.flush();
        }
    };

    class Configurator
    {
    public:
        static void setup();
        static bool configExists();

    private:
        static Config loadConfig();
        static void writeConfig();

        static Config _config;
    };
}
