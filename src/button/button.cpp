// Libraries
#include <Arduino.h>

namespace Button
{
    void setup()
    {
        if (DEBUG_LEVEL > 0)
            Serial.println("Setup:\tButton");
        pinMode(BUTTON_PIN, INPUT_PULLUP);
    }
    void loop()
    {
        // Check if the button is pressed
        if (digitalRead(0) == LOW && DEBUG_LEVEL > 1)
            Serial.println("Button:\tpressed");
        else if (DEBUG_LEVEL > 2)
            Serial.println("Button:\treleased");
    }
} // namespace Button
