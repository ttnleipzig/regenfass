#include "Arduino.h"
#include <Wire.h>
#include "SSD1306Wire.h"
#include "../assets/bitmaps.h"

#ifdef Wireless_Stick_V3
SSD1306Wire display(0x3c, 500000, SDA_OLED, SCL_OLED, GEOMETRY_64_32, RST_OLED); // addr , freq , i2c group , resolution , rst
#else
// SSD1306Wire display(0x3c, 500000, SDA_OLED, SCL_OLED, GEOMETRY_128_64, RST_OLED); // addr , freq , i2c group , resolution , rst
SSD1306Wire display(0x3c, SDA_OLED, SCL_OLED);
#endif

namespace Board
{
    namespace HeltecWifiLora32V3
    {

        /*license for Heltec ESP32 LoRaWan, quary your ChipID relevant license: http://resource.heltec.cn/search */
        uint32_t license[4] = {0x00000000, 0x00000000, 0x00000000, 0x00000000};
        /* OTAA para*/
        uint8_t DevEui[] = {0x22, 0x32, 0x33, 0x00, 0x00, 0x88, 0x88, 0x02};
        uint8_t AppEui[] = {0x70, 0xB3, 0xD5, 0x7E, 0xD0, 0x02, 0xB1, 0x8A};
        uint8_t AppKey[] = {0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x66, 0x01};

        /* ABP para*/
        uint8_t NwkSKey[] = {0x15, 0xb1, 0xd0, 0xef, 0xa4, 0x63, 0xdf, 0xbe, 0x3d, 0x11, 0x18, 0x1e, 0x1e, 0xc7, 0xda, 0x85};
        uint8_t AppSKey[] = {0xd7, 0x2c, 0x78, 0x75, 0x8c, 0xdc, 0xca, 0xbf, 0x55, 0xee, 0x4a, 0x77, 0x8d, 0x16, 0xef, 0x67};
        uint32_t DevAddr = (uint32_t)0x007e6ae1;

        /*LoraWan channelsmask, default channels 0-7*/
        uint16_t userChannelsMask[6] = {0x00FF, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000};

        void VextON(void)
        {
            pinMode(Vext, OUTPUT);
            digitalWrite(Vext, LOW);
        }

        void VextOFF(void) // Vext default OFF
        {
            pinMode(Vext, OUTPUT);
            digitalWrite(Vext, HIGH);
        }

        void setupDisplay()
        {
            VextON();
            delay(100);

            display.init();
            display.clear();
            display.display();
            display.setContrast(255);
            /*
            display.setTextAlignment(TEXT_ALIGN_CENTER);
            display.setFont(ArialMT_Plain_16);
            display.drawString(display.getWidth() / 2, display.getHeight() / 2 - 16 / 2, "Super Dirk");
            */
            display.drawXbm(0, 0, LOGO_WIDTH, LOGO_HEIGHT, LOGO_BITMAP);

            display.display();
        }

        void loopDisplay()
        {
        }

        uint8_t appData[64];           // Declare appData array
        const uint8_t appDataSize = 4; // AppDataSize max value is 64

        void prepareTxFrame(uint8_t port)
        {
            // Format the data to bytes
            appData[0] = 0x00;
            appData[1] = 0x01;
            appData[2] = 0x02;
            appData[3] = 0x03;
        }

        void setupLora()
        {
        }

        void loopLora()
        {
        }

        void setup()
        {
            Serial.println("Setup: Board Heltec Wifi Lora 32 V3");
            // Heltec.begin(true, false, true);
            // setupDisplay();
            // setupLora();
        }
        void loop()
        {
            // loopDisplay();
        }

    } // namespace HeltecV3
} // namespace Board
