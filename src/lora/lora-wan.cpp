#include <Arduino.h>

#ifndef LoraFunctions_H
#define LoraFunctions_H
#endif

#include "Arduino.h"
#include <lmic.h>
#include <hal/hal.h>
#include <SPI.h>
#include <algorithm>
#include <keyhandler.h>

#define DEVICE_SIMPLE

// This EUI must be in little-endian format, so least-significant-byte
// first. When copying an EUI from ttnctl output, this means to reverse
// the bytes. For TTN issued EUIs the last bytes should be 0xD5, 0xB3,
// 0x70.
// constexpr char const appEui[8] = {0x42, 0x3A, 0x92, 0xA6, 0xF5, 0xBB, 0xBC, 0x18};
// void os_getArtEui(u1_t *buf) { memcpy_P(buf, APPEUI, 8); }

// This should also be in little endian format, see above.
// constexpr char const devEui[8] = {0x3A, 0xE1, 0x9C, 0xCB, 0x7D, 0x60, 0xF0, 0xCF};
// void os_getDevEui(u1_t *buf) { memcpy_P(buf, DEVEUI, 8); }

// This key should be in big endian format (or, since it is not really a
// number but a block of memory, endianness does not really apply). In
// practice, a key taken from ttnctl can be copied as-is.
// constexpr char const appKey[16] = {0xA3, 0x46, 0xE1, 0xB1, 0x2B, 0x0A, 0x15, 0xD1, 0x43, 0xA6, 0x7D, 0x37, 0xE2, 0x8C, 0xEC, 0xE5};
// void os_getDevKey(u1_t *buf) { memcpy_P(buf, APPKEY, 16); }

// Die LMICPP-Arduino braucht den Kram als Strings!
constexpr char const appEui[] = "ABCABCABCABCABCA";
// Device EUI in string format.
constexpr char const devEui[] = "DEFDEFDEFDEFDEFD";
// Application key in string format.
constexpr char const appKey[] = "FFEEFFEEFFEEFFEEFFEEFFEEFFEEFFEE";

static uint8_t mydata[] = "Hello, world!";
uint8_t payload[34];

// Schedule TX every this many seconds (might become longer due to duty
// cycle limitations).
const unsigned TX_INTERVAL = 30;

char TTN_response[30];

static const lmic_pinmap myPinmap = {
    .nss = LORA_NSS_PIN,
    .prepare_antenna_tx = nullptr,
    .rst = LORA_RESET_PIN,
    .dio = {LORA_DIO0_PIN, LORA_DIO1_PIN},
};

RadioSx1262 radio(myPinmap, ImageCalibrationBand::band_863_870);
LmicEu868 LMIC{radio};

namespace Lora
{
    namespace Wan
    {
        void printHex2(unsigned v)
        {
            v &= 0xff;
            if (v < 16)
                Serial.print('0');
            Serial.print(v, HEX);
        }

        void publish2TTN(void)
        {
            // Check if there is not a current TX/RX job running
            if (LMIC.getOpMode().test(OpState::TXRXPEND))
            {
                Serial.printf("*** OP_TXRXPEND, not sending\n");
                return;
            }

            // Prepare upstream data transmission at the next possible time.
            LMIC.setTxData2(1, mydata, sizeof(mydata) - 1, 0);
            Serial.println(F("Packet queued"));
            // Next TX is scheduled after TX_COMPLETE event.
        }

        void setup()
        {
            log_i("Setup LoraWAN");
            SPI.begin(LORA_SCK_PIN, LORA_MISO_PIN, LORA_MOSI_PIN, LORA_NSS_PIN);

            os_init();
            LMIC.init();
            // Reset the MAC state. Session and pending data transfers will be discarded.
            LMIC.reset();

            SetupLmicKey<appEui, devEui, appKey>::setup(LMIC);
            LMIC.setClockError(MAX_CLOCK_ERROR * 1 / 100);

            // Disable link check validation
            // Disable link-check mode and ADR, because ADR tends to complicate testing.
            LMIC.setLinkCheckMode(0);

            // TTN uses SF9 for its RX2 window.
            // LMIC.dn2Dr = DR_SF9;

            // Set data rate and transmit power for uplink
            // Set the data rate to Spreading Factor 7.  This is the fastest supported rate for 125 kHz channels, and it
            // minimizes air time and battery power. Set the transmission power to 14 dBi (25 mW).
            // LMIC_setDrTxpow(DR_SF7,14);

            // Start job (sending automatically starts OTAA too)
            // do_send(&sendjob);

            log_d("Setting up LoRa done");
        };
        
        void loop()
        {
            log_i("LoRa WAN");
            auto freeTimeBeforeNextCall = LMIC.run();
            if (freeTimeBeforeNextCall < OsDeltaTime::from_ms(100))
                return;

            if (LMIC.getOpMode().test(OpState::TXRXPEND))
            {
                auto waittime = freeTimeBeforeNextCall.to_ms() - 100;
                PRINT_DEBUG(1, F("Delay TXRXPEND %dms"), waittime);
                delay(waittime);
                return;
            }
        };
    }
}
