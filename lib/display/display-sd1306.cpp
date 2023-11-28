// Libraries
#include <Arduino.h>
#include <U8x8lib.h>

#include "../assets/bitmaps.h"

/*
#ifdef Wireless_Stick_V3
SSD1306Wire display(0x3c, 500000, SDA_OLED, SCL_OLED, GEOMETRY_64_32, RST_OLED); // addr , freq , i2c group , resolution , rst
#else
// SSD1306Wire display(0x3c, 500000, SDA_OLED, SCL_OLED, GEOMETRY_128_64, RST_OLED); // addr , freq , i2c group , resolution , rst
// SSD1306Wire display(0x3c, SDA_OLED, SCL_OLED);
// SSD1306Wire display(0x3c, 17, 18, GEOMETRY_64_32);
#endif
SSD1306Wire display(0x3c, 15, 4, GEOMETRY_64_32);

*/
U8X8_SSD1306_128X64_NONAME_SW_I2C u8x8(SCL_OLED, SDA_OLED, RST_OLED);

namespace Display
{
    namespace SD1306
    {

        void setup()
        {
            Serial.println("Setup: Display SD1306");
            delay(100);

            u8x8.begin();
            u8x8.setFont(u8x8_font_amstrad_cpc_extended_f);
            u8x8.drawUTF8(0, 0, "Regenfässer");
            u8x8.drawUTF8(0, 1, "Regenfässer");
            u8x8.drawUTF8(0, 2, "Regenfässer");
            u8x8.drawUTF8(0, 3, "Regenfässer");
            u8x8.setInverseFont(1);
            u8x8.drawUTF8(0, 4, "Regenfässer");
            u8x8.drawUTF8(0, 5, "Regenfässer");
            u8x8.drawUTF8(0, 6, "Regenfässer");
            u8x8.drawUTF8(0, 7, "Regenfässer");

            // Draw image
        }

        void loop()
        {
            Serial.println("Loop:\tDisplay SD1306");
        }
    }
}
