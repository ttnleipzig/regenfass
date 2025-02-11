#pragma once

#include <string>
#include <Arduino.h>
#include <scp.h>

#define CONFIG_PROPERTIES(X) \
    X(appEUI)                \
    X(appKey)                \
    X(devEUI)                \
    X(minLevel)

namespace Configuration
{
    struct Config
    {
#define X(name) std::string name;
        CONFIG_PROPERTIES(X)
#undef X

        SCPLine *applyGet(const SCPLine *line)
        {
            const auto k = line->as.k;

#define X(name)                                                           \
    if (strcmp(k, #name) == 0)                                            \
    {                                                                     \
        return scp_line_new(SCPLineType::SET, #name, this->name.c_str()); \
    }

            CONFIG_PROPERTIES(X)

#undef X

            return nullptr;
        }

        bool applySet(const SCPLine *line)
        {
            const auto k = line->as.kv.k;
            const auto v = line->as.kv.v;

#define X(name)                \
    if (strcmp(k, #name) == 0) \
    {                          \
        this->name = v;        \
        return true;           \
    }

            CONFIG_PROPERTIES(X)

#undef X

            return false;
        }

        /**
         * Writes the configuration data to the specified stream.
         *
         * @param stream The stream to write the configuration data to.
         */
        void write(Stream &stream)
        {
#define X(key)                                                                           \
    stream.write(scp_line_to_string(scp_line_new(SCPLineType::SET, #key, key.c_str()))); \
    stream.write('\n');

            CONFIG_PROPERTIES(X)

#undef X

            stream.flush();
        }
    };

    class Configurator
    {
    public:
        static void setup();
        static void loop();

        static bool configExists();

        static Config &getConfig()
        {
            return _config;
        }

    private:
        static Config loadConfig();
        static void writeConfig();

        static Config _config;
    };
}
