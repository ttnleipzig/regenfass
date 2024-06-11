// Libraries
#include <Arduino.h>

namespace Button
{
    void setup()
    {
        log_d("Setup onboard button");
        pinMode(BUTTON_PIN, INPUT_PULLUP);
    }
    void loop()
    {
        // Check if the button is pressed
        // if (digitalRead(0) == LOW)
        //     log_v("pressed");
        // else
        //     log_v("released");
    }
} // namespace Button
