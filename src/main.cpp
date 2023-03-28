#include <Arduino.h>

#include <HCSR04.h>

#define TRIGGER_PIN 5
#define ECHO_PIN 18
#define MAX_DISTANCE 400

UltraSonicDistanceSensor distanceSensor(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE);
float distance = -1;

void setup () {
    Serial.begin(9600);  // We initialize serial connection so that we could print values from sensor.
}

void loop () {
    // Every 500 miliseconds, do a measurement using the sensor and print the distance in centimeters.
    distance = distanceSensor.measureDistanceCm();
    Serial.printf("Distance: %f cm", distance);
    delay(500);
}