

namespace Board
{
    namespace HeltecWifiLora32V3
    {

        void VextON(void);
        void VextOFF(void);
        void prepareTxFrame(uint8_t port);

        void setup();
        void setupDisplay();
        void setuoLora();
        void loop();
        void loopDisplay();
        void loopLora();
    }
}
