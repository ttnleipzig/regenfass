// Libraries
#include <Arduino.h>

namespace Button
{
    void setup()
    {
        Serial.println("Setup: Button");
        pinMode(BUTTON_PIN, INPUT_PULLUP);
    }
    void loop()
    {
        // Check if the button is pressed
        if (digitalRead(0) == LOW)
        {
            Serial.println("Button: pressed");
        }
    }
} // namespace Button
