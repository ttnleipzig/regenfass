#pragma once

#include <string>
#include <Arduino.h>
#include <scp.h>

namespace Configuration
{
    struct Config
    {
        std::string appEui;
        std::string appKey;
        std::string devEui;

        void apply(const SCPLine *line)
        {
            if (line->type != SCPLineType::SET)
            {
                return;
            }

            const auto k = line->as.kv.k;
            const auto v = line->as.kv.v;
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
#define WRITE(key) stream.write(scp_line_to_string(scp_line_new(SCPLineType::SET, #key, key.c_str())));
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
