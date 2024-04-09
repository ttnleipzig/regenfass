#include "unity.h"
#include "button.h"

void setUp(void) {
    // Dieser Code wird vor jedem Test ausgeführt
}

void tearDown(void) {
    // Dieser Code wird nach jedem Test ausgeführt
}

void test_button_setup(void) {
    // Teste die setup Funktion
    Button::setup();
    TEST_ASSERT_EQUAL_INT(INPUT_PULLUP, getPinMode(BUTTON_PIN));
}

void test_button_loop(void) {
    // Teste die loop Funktion
    // Hier müssen wir einen Weg finden, den digitalen Pin zu simulieren
    // Da dies von der spezifischen Hardware abhängt, ist es hier nicht dargestellt
}

int main(void) {
    UNITY_BEGIN();
    RUN_TEST(test_button_setup);
    RUN_TEST(test_button_loop);
    UNITY_END();

    return 0;
}
