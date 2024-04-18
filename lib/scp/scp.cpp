#include <optional>
#include "scp.h"
#include <iostream>
#include <algorithm>
#include <cctype>
#include <locale>

namespace SCP
{
    std::optional<Line> Line::parse(const std::string &line)
    {
        const auto firstEquals = line.find('=');
        const auto lastChar = line.back();
        const auto isQuestionMark = lastChar == '?';
        const auto isExclamationMark = lastChar == '!';

        // check if equals sign is present
        if (firstEquals != std::string::npos)
        {
            auto key = line.substr(0, firstEquals);
            auto value = line.substr(firstEquals + 1);
            auto p = std::make_pair(key, value);
            return std::make_optional<Line>(Type::SET, p);
        }
        // check if question mark is the last character
        else if (isQuestionMark)
        {
            auto key = line.substr(0, line.size() - 1);
            return std::make_optional<Line>(Type::GET, key);
        }
        // check if exclamation mark is the last character
        else if (isExclamationMark)
        {
            auto key = line.substr(0, line.size() - 1);
            return std::make_optional<Line>(Type::ACTION, key);
        }

        return std::nullopt;
    }

    void Helper::trim(std::string &s)
    {
        s.erase(s.begin(), std::find_if(s.begin(), s.end(), [](unsigned char ch)
                                        { return !std::isspace(ch); }));
        s.erase(std::find_if(s.rbegin(), s.rend(), [](unsigned char ch)
                             { return !std::isspace(ch); })
                    .base(),
                s.end());
    }
}
