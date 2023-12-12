// Libraries
#include <Arduino.h>

namespace Button
{
    void setup()
    {
        log_i("Setup:\tButton");
        pinMode(BUTTON_PIN, INPUT_PULLUP);
    }
    void loop()
    {
        // Check if the button is pressed
        if (digitalRead(0) == LOW)
            log_d("Button:\tpressed");
        else
            log_v("Button:\treleased");
    }
} // namespace Button
