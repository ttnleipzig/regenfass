// Libraries
#include <Arduino.h>
#include <Wire.h>
#include "SSD1306Wire.h"
#include "../assets/bitmaps.h"

#ifdef Wireless_Stick_V3
SSD1306Wire display(0x3c, 500000, SDA_OLED, SCL_OLED, GEOMETRY_64_32, RST_OLED); // addr , freq , i2c group , resolution , rst
#else
// SSD1306Wire display(0x3c, 500000, SDA_OLED, SCL_OLED, GEOMETRY_128_64, RST_OLED); // addr , freq , i2c group , resolution , rst
// SSD1306Wire display(0x3c, SDA_OLED, SCL_OLED);
SSD1306Wire display(0x3c, 17, 18, GEOMETRY_64_32);
#endif

namespace Display
{
    namespace SD1306
    {

        void setup()
        {
            Serial.println("Setup: SD1306");
            Serial.println("Setup: Display SD1306");
 
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

        void loop()
        {
        }
    }
}
