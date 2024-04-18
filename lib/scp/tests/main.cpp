#include "../scp.h"
#include "catch2.hpp"

TEST_CASE("scp/line/set", "Set line parsing")
{
    SECTION("a=b")
    {
        auto l = SCP::Line::parse("a=b");
        REQUIRE(l.has_value());

        auto v = l.value();
        REQUIRE(v.type == SCP::Line::Type::SET);
        REQUIRE(v.data.kv.first == "a");
        REQUIRE(v.data.kv.second == "b");
        REQUIRE(v.toString() == "a=b");
    }

    SECTION("a=?")
    {
        auto l = SCP::Line::parse("a=?");
        REQUIRE(l.has_value());

        auto v = l.value();
        REQUIRE(v.type == SCP::Line::Type::SET);
        REQUIRE(v.data.kv.first == "a");
        REQUIRE(v.data.kv.second == "?");
        REQUIRE(v.toString() == "a=?");
    }

    SECTION("a!=")
    {
        auto l = SCP::Line::parse("a!=");
        REQUIRE(l.has_value());

        auto v = l.value();
        REQUIRE(v.type == SCP::Line::Type::SET);
        REQUIRE(v.data.kv.first == "a!");
        REQUIRE(v.data.kv.second == "");
        REQUIRE(v.toString() == "a!=");
    }

    SECTION("a=!")
    {
        auto l = SCP::Line::parse("a=!");
        REQUIRE(l.has_value());

        auto v = l.value();
        REQUIRE(v.type == SCP::Line::Type::SET);
        REQUIRE(v.data.kv.first == "a");
        REQUIRE(v.data.kv.second == "!");
        REQUIRE(v.toString() == "a=!");
    }
}

TEST_CASE("scp/line/get", "Get line parsing")
{
    SECTION("a?")
    {
        auto l = SCP::Line::parse("a?");
        REQUIRE(l.has_value());

        auto v = l.value();
        REQUIRE(v.type == SCP::Line::Type::GET);
        REQUIRE(v.data.k == "a");
        REQUIRE(v.toString() == "a?");
    }

    SECTION("a!?")
    {
        auto l = SCP::Line::parse("a!?");
        REQUIRE(l.has_value());

        auto v = l.value();
        REQUIRE(v.type == SCP::Line::Type::GET);
        REQUIRE(v.data.k == "a!");
        REQUIRE(v.toString() == "a!?");
    }
}

TEST_CASE("scp/line/action", "Action line parsing")
{
    SECTION("a!")
    {
        auto l = SCP::Line::parse("a!");
        REQUIRE(l.has_value());

        auto v = l.value();
        REQUIRE(v.type == SCP::Line::Type::ACTION);
        REQUIRE(v.data.k == "a");
        REQUIRE(v.toString() == "a!");
    }

    SECTION("a!!")
    {
        auto l = SCP::Line::parse("a!!");
        REQUIRE(l.has_value());

        auto v = l.value();
        REQUIRE(v.type == SCP::Line::Type::ACTION);
        REQUIRE(v.data.k == "a!");
        REQUIRE(v.toString() == "a!!");
    }

    SECTION("a?!")
    {
        auto l = SCP::Line::parse("a?!");
        REQUIRE(l.has_value());

        auto v = l.value();
        REQUIRE(v.type == SCP::Line::Type::ACTION);
        REQUIRE(v.data.k == "a?");
        REQUIRE(v.toString() == "a?!");
    }
}

TEST_CASE("scp/line/invalid", "Invalid line parsing")
{
    SECTION("a")
    {
        auto l = SCP::Line::parse("a");
        REQUIRE(!l.has_value());
    }

    SECTION("a?b")
    {
        auto l = SCP::Line::parse("a?b");
        REQUIRE(!l.has_value());
    }
}
