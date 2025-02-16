
#include <Arduino.h>

namespace Sensor {
    namespace Lora32Battery {

        /*
         * @brief Read the current Battery Voltage in Volts
         *
         * @return float
         */
        float readBattery(void) {
            return 0.0041 * analogRead(LORA32_VBAT_PIN);
        }

        /*
         * @brief Setup Pins for Reading Battery Voltage
         */
        void  setup(void){
            pinMode(LORA32_VBAT_READ_CNTRL_PIN, OUTPUT);
            digitalWrite(LORA32_VBAT_READ_CNTRL_PIN, LOW);
        }
    }
}
