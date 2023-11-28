#include "Arduino.h"
#include <Wire.h>
#include "SSD1306Wire.h"
#include "../assets/bitmaps.h"

#ifdef Wireless_Stick_V3
SSD1306Wire display(0x3c, 500000, SDA_OLED, SCL_OLED, GEOMETRY_64_32, RST_OLED); // addr , freq , i2c group , resolution , rst
#else
 //SSD1306Wire display(0x3c, 500000, SDA_OLED, SCL_OLED, GEOMETRY_128_64, RST_OLED); // addr , freq , i2c group , resolution , rst
SSD1306Wire display(0x3c, SDA_OLED, SCL_OLED);
#endif

namespace Board
{
    namespace HeltecWifiLora32V3
    {

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
            Serial.println("Setup: Display");
            VextON();
            delay(100);

            display.init();
            display.clear();
            display.display();
            display.setContrast(255);
            
            display.setTextAlignment(TEXT_ALIGN_CENTER);
            display.setFont(ArialMT_Plain_16);
            display.drawString(display.getWidth() / 2, display.getHeight() / 2 - 16 / 2, "Super Dirk");
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
            setupDisplay();
            // setupLora();
        }
        void loop()
        {
            loopDisplay();
        }

    } // namespace HeltecV3
} // namespace Board
