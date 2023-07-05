#include <U8x8lib.h>

U8X8_SSD1306_128X64_NONAME_SW_I2C u8x8(/* clock=*/15, /* data=*/4, /* reset=*/16);

namespace Board
{
    namespace HeltecWifiLora32V3
    {

        void setupDisplay()
        {
            u8x8.begin();
            u8x8.setPowerSave(0);
        }

        void loopDisplay()
        {
            u8x8.setFont(u8x8_font_chroma48medium8_r);
            u8x8.drawString(0, 1, "Hello World!");
            u8x8.setInverseFont(1);
            u8x8.drawString(0, 0, "012345678901234567890123456789");
            u8x8.setInverseFont(0);
            // u8x8.drawString(0,8,"Line 8");
            // u8x8.drawString(0,9,"Line 9");
            u8x8.refreshDisplay();
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
