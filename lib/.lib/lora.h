#pragma once

namespace Board
{
    namespace HeltecWifiLora32V3
    {
        namespace Lora
        {
            void prepareTxFrame(uint8_t port);
            void setup();
            void loop();
        }
    }
}
