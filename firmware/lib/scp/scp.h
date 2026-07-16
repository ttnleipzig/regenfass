#ifndef SCP_H
#define SCP_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <ctype.h>

#ifdef __EMSCRIPTEN__
#include "emscripten.h"
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

#ifdef __cplusplus
extern "C"
{
#endif

    typedef enum SCPLineType
    {
        SET,
        GET,
        ACTION
    } SCPLineType;

    typedef struct SCPLine
    {
        enum SCPLineType type;

        union
        {
            struct
            {
                char *k;
                char *v;
            } kv;
            char *k;
        } as;


        #ifdef __cplusplus
        ~SCPLine()
        {
            if (type == SET)
            {
                free(as.kv.k);
                free(as.kv.v);
            }
            else
            {
                free(as.k);
            }
        }
        #endif
    } SCPLine;

    void scp_string_trim(char *s);

    SCPLine *scp_line_new(enum SCPLineType type, const char *key, const char *value);
    EMSCRIPTEN_KEEPALIVE void scp_line_free(SCPLine *line);

    EMSCRIPTEN_KEEPALIVE char *scp_line_to_string(const SCPLine *line);

    EMSCRIPTEN_KEEPALIVE SCPLine *scp_line_parse(const char *raw);

#ifdef SCP_IMPLEMENTATION

    void scp_string_trim(char *s)
    {
        char *start = s;
        while (isspace(*start))
        {
            start++;
        }

        char *end = s + strlen(s) - 1;
        while (end > start && isspace(*end))
        {
            end--;
        }
        *(end + 1) = '\0';
    }

    SCPLine *scp_line_new(enum SCPLineType type, const char *key, const char *value)
    {
        SCPLine *line = (SCPLine *)malloc(sizeof(SCPLine));
        if (line == NULL)
        {
            return NULL;
        }

        line->type = type;
        if (type == SET)
        {
            line->as.kv.k = strdup(key);
            line->as.kv.v = strdup(value);
        }
        else
        {
            line->as.k = strdup(key);
        }

        return line;
    }

    EMSCRIPTEN_KEEPALIVE void scp_line_free(SCPLine *line)
    {
        if (line == NULL)
        {
            return;
        }

        if (line->type == SET)
        {
            free(line->as.kv.k);
            free(line->as.kv.v);
        }
        else
        {
            free(line->as.k);
        }

        free(line);
    }

    EMSCRIPTEN_KEEPALIVE char *scp_line_to_string(const SCPLine *line)
    {
        if (line == NULL)
        {
            return NULL;
        }

        char *str = NULL;
        switch (line->type)
        {
        case SET:
            asprintf(&str, "%s=%s", line->as.kv.k, line->as.kv.v);
            break;
        case GET:
            asprintf(&str, "%s?", line->as.k);
            break;
        case ACTION:
            asprintf(&str, "%s!", line->as.k);
            break;
        default:
            asprintf(&str, "error=invalid line");
            break;
        }

        return str;
    }

    EMSCRIPTEN_KEEPALIVE SCPLine *scp_line_parse(const char *raw)
    {
        char *line = strdup(raw);
        scp_string_trim(line);

        SCPLine *parsedLine = (SCPLine *)malloc(sizeof(SCPLine));
        if (parsedLine == NULL)
        {
            return NULL;
        }

        const char *equals = strchr(line, '=');
        const char *lastChar = line + strlen(line) - 1;
        int isQuestionMark = (*lastChar == '?');
        int isExclamationMark = (*lastChar == '!');

        if (equals != NULL)
        {
            parsedLine->type = SET;
            parsedLine->as.kv.k = strndup(line, equals - line);
            parsedLine->as.kv.v = strdup(equals + 1);
        }
        else if (isQuestionMark)
        {
            parsedLine->type = GET;
            parsedLine->as.k = strndup(line, lastChar - line);
        }
        else if (isExclamationMark)
        {
            parsedLine->type = ACTION;
            parsedLine->as.k = strndup(line, lastChar - line);
        }
        else
        {
            free(parsedLine);
            return NULL;
        }

        return parsedLine;
    }

#undef SCP_IMPLEMENTATION

#endif // SCP_IMPLEMENTATION

#ifdef __cplusplus
}
#endif

#endif // SCP_H
