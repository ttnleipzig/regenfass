#include "LoRaWan_APP.h"

namespace Board
{
    namespace HeltecWifiLora32V3
    {
        namespace Lora
        {

            /* OTAA para*/
            uint8_t devEui[] = {0x70, 0xB3, 0xD5, 0x7E, 0xD0, 0x05, 0xD2, 0xC3};
            uint8_t appEui[] = {0x2F, 0x59, 0xAD, 0x43, 0xEA, 0xAB, 0x21, 0xFF};
            uint8_t appKey[] = {0x77, 0xBB, 0x65, 0x22, 0x2D, 0x84, 0x10, 0x74, 0xBE, 0x1B, 0xB5, 0xE8, 0xA8, 0xC6, 0x89, 0xB0};

            /* ABP para*/
            uint8_t nwkSKey[] = {0x01, 0xB0, 0x28, 0x3D, 0x72, 0x53, 0x73, 0x7C, 0xAB, 0xD9, 0xA6, 0xCF, 0xA1, 0x00, 0x6F, 0x15};
            uint8_t appSKey[] = {0x88, 0xC6, 0x54, 0x71, 0xA7, 0x46, 0x69, 0xD4, 0xB1, 0x47, 0xDC, 0x1D, 0xA1, 0x72, 0x97, 0x26};
            uint32_t devAddr = (uint32_t)0x007e6ae1;

            /*LoraWan channelsmask*/
            uint16_t userChannelsMask[6] = {0x00FF, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000};

            /*LoraWan region, select in arduino IDE tools*/
            LoRaMacRegion_t loraWanRegion = ACTIVE_REGION;

            /*LoraWan Class, Class A and Class C are supported*/
            DeviceClass_t loraWanClass = CLASS_A;

            /*the application data transmission duty cycle.  value in [ms].*/
            uint32_t appTxDutyCycle = 15000;

            /*OTAA or ABP*/
            bool overTheAirActivation = true;

            /*ADR enable*/
            bool loraWanAdr = true;

            /* Indicates if the node is sending confirmed or unconfirmed messages */
            bool isTxConfirmed = true;

            /* Application port */
            uint8_t appPort = 2;
            /*!
             * Number of trials to transmit the frame, if the LoRaMAC layer did not
             * receive an acknowledgment. The MAC performs a datarate adaptation,
             * according to the LoRaWAN Specification V1.0.2, chapter 18.4, according
             * to the following table:
             *
             * Transmission nb | Data Rate
             * ----------------|-----------
             * 1 (first)       | DR
             * 2               | DR
             * 3               | max(DR-1,0)
             * 4               | max(DR-1,0)
             * 5               | max(DR-2,0)
             * 6               | max(DR-2,0)
             * 7               | max(DR-3,0)
             * 8               | max(DR-3,0)
             *
             * Note, that if NbTrials is set to 1 or 2, the MAC will not decrease
             * the datarate, in case the LoRaMAC layer did not receive an acknowledgment
             */
            uint8_t confirmedNbTrials = 4;

            /* Prepares the payload of the frame */
            void prepareTxFrame(uint8_t port)
            {
                /*appData size is LORAWAN_APP_DATA_MAX_SIZE which is defined in "commissioning.h".
                 *appDataSize max value is LORAWAN_APP_DATA_MAX_SIZE.
                 *if enabled AT, don't modify LORAWAN_APP_DATA_MAX_SIZE, it may cause system hanging or failure.
                 *if disabled AT, LORAWAN_APP_DATA_MAX_SIZE can be modified, the max value is reference to lorawan region and SF.
                 *for example, if use REGION_CN470,
                 *the max value for different DR can be found in MaxPayloadOfDatarateCN470 refer to DataratesCN470 and BandwidthsCN470 in "RegionCN470.h".
                 */
                appDataSize = 4;
                appData[0] = 0x00;
                appData[1] = 0x01;
                appData[2] = 0x02;
                appData[3] = 0x03;
            }

            RTC_DATA_ATTR bool firstrun = true;

            void setup()
            {
                Serial.begin(115200);
                Mcu.begin();
                if (firstrun)
                {
                    LoRaWAN.displayMcuInit();
                    firstrun = false;
                }
                deviceState = DEVICE_STATE_INIT;
            }

            void loop()
            {
                switch (deviceState)
                {
                case DEVICE_STATE_INIT:
                {
#if (LORAWAN_DEVEUI_AUTO)
                    LoRaWAN.generateDeveuiByChipID();
#endif
                    LoRaWAN.init(loraWanClass, loraWanRegion);
                    break;
                }
                case DEVICE_STATE_JOIN:
                {
                    LoRaWAN.displayJoining();
                    LoRaWAN.join();
                    break;
                }
                case DEVICE_STATE_SEND:
                {
                    LoRaWAN.displaySending();
                    prepareTxFrame(appPort);
                    LoRaWAN.send();
                    deviceState = DEVICE_STATE_CYCLE;
                    break;
                }
                case DEVICE_STATE_CYCLE:
                {
                    // Schedule next packet transmission
                    txDutyCycleTime = appTxDutyCycle + randr(0, APP_TX_DUTYCYCLE_RND);
                    LoRaWAN.cycle(txDutyCycleTime);
                    deviceState = DEVICE_STATE_SLEEP;
                    break;
                }
                case DEVICE_STATE_SLEEP:
                {
                    LoRaWAN.displayAck();
                    LoRaWAN.sleep(loraWanClass);
                    break;
                }
                default:
                {
                    deviceState = DEVICE_STATE_INIT;
                    break;
                }
                }
            }
        }
    }
}
