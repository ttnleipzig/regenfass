// Libraries
#include <Arduino.h>
#include <SPI.h>
#include <U8g2lib.h>

#include "../assets/bitmaps.h"

U8G2_SSD1306_128X64_NONAME_1_SW_I2C u8g2(U8G2_R0, SCL_OLED, 17, 21);

namespace Display
{
    namespace SD1306
    {
        void setup()
        {
            log_i("SD1306");
            delay(10);
            u8g2.begin();
            u8g2.setFont(u8g2_font_ncenB14_tr);
        }

        void loop()
        {
            log_v("SD1306");
            u8g2.firstPage();
            do
            {
                u8g2.drawXBMP(0, 0, 128, 64, LOGO_BITMAP);
            } while (u8g2.nextPage());
        }
    }
}
