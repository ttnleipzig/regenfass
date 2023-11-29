// Libraries
#include <Arduino.h>

namespace Button
{
    void setup()
    {
        Serial.println("Setup:\tButton");
        pinMode(BUTTON_PIN, INPUT_PULLUP);
    }
    void loop()
    {
        // Check if the button is pressed
        if (digitalRead(0) == LOW)
        {
            Serial.println("Button:\tpressed");
        }
    }
} // namespace Button
