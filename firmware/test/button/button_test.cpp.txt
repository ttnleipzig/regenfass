#include "gtest/gtest.h"
#include "gmock/gmock.h"

#include "button.h"

using ::testing::Return;

class MockArduino : public Arduino {
public:
    MOCK_METHOD(void, pinMode, (int, int), (override));
    MOCK_METHOD(int, digitalRead, (int), (override));
};

TEST(ButtonTest, Setup) {
    MockArduino arduino;
    EXPECT_CALL(arduino, pinMode(BUTTON_PIN, INPUT_PULLUP));

    Button::setup();
}

TEST(ButtonTest, LoopPressed) {
    MockArduino arduino;
    EXPECT_CALL(arduino, digitalRead(0)).WillOnce(Return(LOW));

    Button::loop();

    // Check that log_v("pressed") was called
}

TEST(ButtonTest, LoopReleased) {
    MockArduino arduino;
    EXPECT_CALL(arduino, digitalRead(0)).WillOnce(Return(HIGH));

    Button::loop();

    // Check that log_v("released") was called
}
