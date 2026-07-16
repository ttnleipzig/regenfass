#pragma once

#include <keyhandler.h>
#include <config.h>

namespace Lora
{
    namespace Wan
    {
        void setup();
        void loop();
        void printHex2(unsigned v);
        void publish2TTN(void);

        // Taken from LMIC keyhandler.h
        class AppEuiGetter
        {
        public:
            static void get(uint8_t *buf) { memcpy_P(buf, key, SIZE); }

            static void set(std::string const &eui)
            {
                uint8_t k[SIZE] = {
                    HexCharToInt(eui[14], eui[15]),
                    HexCharToInt(eui[12], eui[13]),
                    HexCharToInt(eui[10], eui[11]),
                    HexCharToInt(eui[8], eui[9]),
                    HexCharToInt(eui[6], eui[7]),
                    HexCharToInt(eui[4], eui[5]),
                    HexCharToInt(eui[2], eui[3]),
                    HexCharToInt(eui[0], eui[1]),
                };
                memcpy_P(key, k, SIZE);
            }

        private:
            static constexpr size_t SIZE = 8;
            static uint8_t key[SIZE];
        };

        // Taken from LMIC keyhandler.h
        class DevEuiGetter
        {
        public:
            static void get(uint8_t *buf) { memcpy_P(buf, key, SIZE); }

            static void set(std::string const &eui)
            {
                uint8_t k[SIZE] = {
                    HexCharToInt(eui[14], eui[15]),
                    HexCharToInt(eui[12], eui[13]),
                    HexCharToInt(eui[10], eui[11]),
                    HexCharToInt(eui[8], eui[9]),
                    HexCharToInt(eui[6], eui[7]),
                    HexCharToInt(eui[4], eui[5]),
                    HexCharToInt(eui[2], eui[3]),
                    HexCharToInt(eui[0], eui[1]),
                };
                memcpy_P(key, k, SIZE);
            }

        private:
            static constexpr size_t SIZE = 8;
            static uint8_t key[SIZE];
        };

        // Taken from LMIC keyhandler.h
        class KeyGetter
        {
        public:
            KeyGetter(std::string const &key) : key{
                                                    HexCharToInt(key[0], key[1]),
                                                    HexCharToInt(key[2], key[3]),
                                                    HexCharToInt(key[4], key[5]),
                                                    HexCharToInt(key[6], key[7]),
                                                    HexCharToInt(key[8], key[9]),
                                                    HexCharToInt(key[10], key[11]),
                                                    HexCharToInt(key[12], key[13]),
                                                    HexCharToInt(key[14], key[15]),
                                                    HexCharToInt(key[16], key[17]),
                                                    HexCharToInt(key[18], key[19]),
                                                    HexCharToInt(key[20], key[21]),
                                                    HexCharToInt(key[22], key[23]),
                                                    HexCharToInt(key[24], key[25]),
                                                    HexCharToInt(key[26], key[27]),
                                                    HexCharToInt(key[28], key[29]),
                                                    HexCharToInt(key[30], key[31]),
                                                }
            {
            }

            AesKey get()
            {
                AesKey lmicKey;
                memcpy_P(lmicKey.data(), key, lmicKey.size());
                return lmicKey;
            }

        private:
            static constexpr size_t SIZE = 16;
            uint8_t key[SIZE];
        };
    }
}
