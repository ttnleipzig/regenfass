#pragma once

#include <string>
#include <optional>

namespace SCP
{
    class Line
    {
    public:
        enum class Type
        {
            // `<KEY>=<VALUE>\n`
            SET,
            // `<KEY>?\n`
            GET,
            // `<KEY>!\n`
            ACTION
        };

        union Data
        {
            Data(std::pair<std::string, std::string> set) : kv(set) {}
            Data(std::string v) : k(v) {}
            ~Data() {}

            std::pair<std::string, std::string> kv;
            std::string k;
        };

        Type type;
        Data data;

        Line() = delete;
        Line(Type type, std::pair<std::string, std::string> kv) : type(type), data(kv) {}
        Line(Type type, std::string k) : type(type), data(k) {}

        Line(const Line &other) : type(other.type), data("")
        {
            switch (type)
            {
            case Type::SET:
                new (&data.kv) std::pair<std::string, std::string>(other.data.kv);
                break;
            case Type::GET:
            case Type::ACTION:
                new (&data.k) std::string(other.data.k);
                break;
            }
        }

        ~Line()
        {
            type.~Type();
            if (type == Type::SET)
            {
                data.kv.~pair<std::string, std::string>();
            }
            else if (type == Type::GET || type == Type::ACTION)
            {
                data.k.~basic_string();
            }
        }

        static std::optional<Line> parse(const std::string &stream);

        std::string toString()
        {
            switch (type)
            {
            case Type::SET:
                return data.kv.first + "=" + data.kv.second;
            case Type::GET:
                return data.k + "?";
            case Type::ACTION:
                return data.k + "!";
            }

            return "error=invalid line";
        }
    };

    namespace Helper
    {
        void trim(std::string &s);
    };
}
