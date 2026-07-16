#define SCP_IMPLEMENTATION
#include "../scp.h"

#include "catch2.hpp"

#define DEBUG_STR(thing) printf("[DBG] %s:%d: %s = \"%s\"\n", __FILE__, __LINE__, #thing, thing);
#define DEBUG_INT(thing) printf("[DBG] %s:%d: %s = %d\n", __FILE__, __LINE__, #thing, thing);

TEST_CASE("scp/line/set", "Set line parsing")
{
    SECTION("a=b")
    {
        auto v = scp_line_parse("a=b");
        REQUIRE(v != NULL);
        REQUIRE(v->type == SCPLineType::SET);
        REQUIRE(strcmp(v->as.kv.k, "a") == 0);
        REQUIRE(strcmp(v->as.kv.v, "b") == 0);
        REQUIRE(strcmp(scp_line_to_string(v), "a=b") == 0);
    }

    SECTION("a=?")
    {
        auto v = scp_line_parse("a=?");
        REQUIRE(v != NULL);
        REQUIRE(v->type == SCPLineType::SET);
        REQUIRE(strcmp(v->as.kv.k, "a") == 0);
        REQUIRE(strcmp(v->as.kv.v, "?") == 0);
        REQUIRE(strcmp(scp_line_to_string(v), "a=?") == 0);
    }

    SECTION("a!=")
    {
        auto v = scp_line_parse("a!=");
        REQUIRE(v != NULL);
        REQUIRE(v->type == SCPLineType::SET);
        REQUIRE(strcmp(scp_line_to_string(v), "a!=") == 0);
        REQUIRE(strcmp(v->as.kv.k, "a!") == 0);
        REQUIRE(strcmp(v->as.kv.v, "") == 0);
    }

    SECTION("a=!")
    {
        auto v = scp_line_parse("a=!");
        REQUIRE(v != NULL);
        REQUIRE(v->type == SCPLineType::SET);
        REQUIRE(strcmp(v->as.kv.k, "a") == 0);
        REQUIRE(strcmp(v->as.kv.v, "!") == 0);
        REQUIRE(strcmp(scp_line_to_string(v), "a=!") == 0);
    }

    SECTION("devEUI=0123456789ABCDEF")
    {
        auto v = scp_line_parse("devEUI=0123456789ABCDEF\n");
        REQUIRE(v != NULL);
        REQUIRE(v->type == SCPLineType::SET);
        REQUIRE(strcmp(v->as.kv.k, "devEUI") == 0);
        REQUIRE(strcmp(v->as.kv.v, "0123456789ABCDEF") == 0);
        REQUIRE(strcmp(scp_line_to_string(v), "devEUI=0123456789ABCDEF") == 0);
    }
}

TEST_CASE("scp/line/get", "Get line parsing")
{
    SECTION("a?")
    {
        auto v = scp_line_parse("a?");
        REQUIRE(v != NULL);
        REQUIRE(v->type == SCPLineType::GET);
        REQUIRE(strcmp(v->as.k, "a") == 0);
        REQUIRE(strcmp(scp_line_to_string(v), "a?") == 0);
    }

    SECTION("a!?")
    {
        auto v = scp_line_parse("a!?");
        REQUIRE(v != NULL);
        REQUIRE(v->type == SCPLineType::GET);
        REQUIRE(strcmp(v->as.k, "a!") == 0);
        REQUIRE(strcmp(scp_line_to_string(v), "a!?") == 0);
    }
}

TEST_CASE("scp/line/action", "Action line parsing")
{
    SECTION("a!")
    {
        auto v = scp_line_parse("a!");
        REQUIRE(v != NULL);
        REQUIRE(v->type == SCPLineType::ACTION);
        REQUIRE(strcmp(v->as.k, "a") == 0);
        REQUIRE(strcmp(scp_line_to_string(v), "a!") == 0);
    }

    SECTION("a!!")
    {
        auto v = scp_line_parse("a!!");
        REQUIRE(v != NULL);
        REQUIRE(v->type == SCPLineType::ACTION);
        REQUIRE(strcmp(v->as.k, "a!") == 0);
        REQUIRE(strcmp(scp_line_to_string(v), "a!!") == 0);
    }

    SECTION("a?!")
    {
        auto v = scp_line_parse("a?!");
        REQUIRE(v != NULL);
        REQUIRE(v->type == SCPLineType::ACTION);
        REQUIRE(strcmp(v->as.k, "a?") == 0);
        REQUIRE(strcmp(scp_line_to_string(v), "a?!") == 0);
    }
}

TEST_CASE("scp/line/invalid", "Invalid line parsing")
{
    SECTION("a")
    {
        auto v = scp_line_parse("a");
        REQUIRE(v == NULL);
    }

    SECTION("a?b")
    {
        auto v = scp_line_parse("a?b");
        REQUIRE(v == NULL);
    }
}
