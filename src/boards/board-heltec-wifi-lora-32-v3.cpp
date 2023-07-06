#include <Wire.h>
#include "HT_SSD1306Wire.h"
#include "../assets/bitmaps.h"

#ifdef Wireless_Stick_V3
SSD1306Wire display(0x3c, 500000, SDA_OLED, SCL_OLED, GEOMETRY_64_32, RST_OLED); // addr , freq , i2c group , resolution , rst
#else
SSD1306Wire display(0x3c, 500000, SDA_OLED, SCL_OLED, GEOMETRY_128_64, RST_OLED); // addr , freq , i2c group , resolution , rst
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

        void setup()
        {
            Serial.println("Setup: Board Heltec Wifi Lora 32 V3");
            // Heltec.begin(true, false, true);
            setupDisplay();
        }
        void loop()
        {
            loopDisplay();
        }

    } // namespace HeltecV3
} // namespace Board
