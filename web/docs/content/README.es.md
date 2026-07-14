# barril de lluvia

> Este proyecto trata sobre un tanque de agua inteligente. Mide el nivel de agua y envía los datos a un servidor. El servidor se puede usar para controlar la bomba de agua. La bomba se puede controlar a través de una interfaz web o a través de un bot de telegrama. Utiliza un sensor ultrasónico HC-SR04 para medir el nivel del agua. Los datos se envían a TTN a través de una puerta de enlace de Lorawan.

?> El documento original fue escrito en[Inglés](README.md). La traducción se realizó con Google Translate. Si encuentra algún error, intente ignorarlos. ¡Gracias!

* * *

## Tabla de contenido

1.  **Inicio rápido**
    1.  Introducción
    2.  Hardware
    3.  Software flash
2.  **Hardware**
    1.  Sensores
    2.  Fuente de alimentación
    3.  Alojamiento
    4.  Microcontrolador
    5.  Puerta de enlace (opcional)
3.  **Ensamblaje**
    1.  Sensor a controlador
    2.  Potencia para controlador
    3.  Solución de problemas
4.  **Configuración**
    1.  TTN
        1.  Crear una cuenta
        2.  Crear aplicación
        3.  Configurar decodificador
        4.  Copiar credenciales
    2.  Dispositivo
        1.  Descargar conductor
        2.  Brillante
        3.  Configuración
5.  **Depuración**
    1.  Monitor en serie
    2.  Consola TTN
    3.  Cliente MQTT
    4.  Trampas
6.  **Ingeniería de datos**
    1.  Nodo rojo
    2.  Raspar
    3.  Habilidad de Alexa
    4.  Azure Connect

* * *

## Comienzo rápido

### Inicio rápido - Introducción

El inicio rápido está hecho para personas que desean comenzar de inmediato y un profundo conocimiento sobre IoT con el marco Arudino. Si quieres entender cómo funciona, puedes leer el[documentación](#hardware).

### Inicio rápido - Descripción general del hardware

Necesita las siguientes partes:

![Overview](_media/hardware/hardware-overview.png ":size=200")

-   Microcontrolador con chip lora
-   Sensor
-   Fuente de alimentación
-   Alojamiento

?> Si quieres saber más sobre las piezas, puedes leer el[documentación de hardware](#Hardware).

### Inicio rápido: software flash

1.  Conecte su placa a su computadora y
2.  Haga clic en el siguiente botón:

<esp-web-install-button manifest="/static/firmware_build/manifest.json"></esp-web-install-button>

?> Si desea saber más sobre el proceso de flasheo, puede leer el[documentación de configuración](#Setup).

## Hardware

1.  [Sensores](#Sensors)
2.  [Fuente de alimentación](#Power-supply)
3.  [Alojamiento](#Housing)
4.  [Microcontrolador](#Microcontroller)
5.  [Puerta](#Gateway)

### Sensores

Para medir el nivel de agua necesita un sensor. No es una tarea fácil encontrar un sensor que sea impermeable y que se pueda usar en un tanque de agua. Los siguientes sensores son compatibles y recomendados:

#### Principiante

Si es un principiante, le recomendamos usar sensores baratos para construir su primer prototipo. Los siguientes sensores son compatibles y recomendados:

| Parte                                               | Descripción                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![HC-S04 sensor](_media/hardware/sensor-hcsr04.svg) | [Sensor ultrasónico HC-SR04](https://amzn.to/3MHNrbJ)El sensor es relativamente barato y fácil de usar. No es impermeable. Tienes que ponerlo en una carcasa impermeable. Recomentamos este sensor si solo quieres probarlo. No se recomienda para uso a largo plazo. El**HC-SR04**El sensor es un sensor ultrasónico utilizado para la medición de la distancia. Emite ondas de sonido de alta frecuencia y detecta el tiempo que tarda las ondas en recuperarse después de golpear un objeto. Este tiempo se usa para calcular la distancia entre el sensor y el objeto. Tiene un rango de hasta 4 metros y puede interactuar con microcontroladores como Arduino, Raspberry Pi, etc. El HC-SR04 se usa comúnmente en robótica, automatización, sistemas de seguridad y otras aplicaciones que requieren una sensación de distancia precisa y confiable. |
| ![](_media/hardware/sensor-vl6180x.svg)             | [VL6180X](https://amzn.to/3zVEFPM)El tiempo del sensor de vuelo es relativamente barato y fácil de usar. El módulo de distancia láser VL6180X es un sensor que usa un láser para medir la distancia entre el sensor y un objeto. Es un sensor de tiempo de vuelo (TOF), lo que significa que mide el tiempo que tarda la luz del láser en rebotar un objeto y volver al sensor. El sensor no es resistente al agua, pero tiene una mayor precisión. Tienes que ponerlo en una carcasa impermeable. Recomentamos este sensor si solo quieres probarlo. No se recomienda para uso a largo plazo.                                                                                                                                                                                                                                                             |

#### Avanzado

Si desea utilizar ese proyecto durante mucho tiempo, recomendamos usar sensores más caros. Los siguientes sensores son compatibles y recomendados:

| Parte                                                                  | Descripción                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ![CQRobot](_media/hardware/sensor-water-CQRobot.svg)                   | [Sensor de nivel de agua de contacto](https://amzn.to/41sKAaL)Este sensor utiliza principios ópticos para detectar niveles de líquido y se conoce como un sensor de nivel de líquido de agua fotoeléctrica. Una ventaja importante de este tipo de sensor es su excelente sensibilidad y falta de partes mecánicas, lo que conduce a una calibración menos frecuente. La sonda del sensor en sí es pequeña y flexible en términos de orientación de colocación, lo que le permite detectar una variedad de condiciones, como derrame de solución, sequedad y nivel horizontal. Además, este sensor puede funcionar como un sistema de recordatorio y alarma. El dispositivo presenta un diodo emisor incorporado y un fototransistor, con la porción cargada completamente aislada del líquido controlado, lo que garantiza la seguridad.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ![Water proof Ultrasonic Sensor](_media/hardware/sensor-JSN-SR04T.svg) | [Sensor ultrasónico a prueba de agua](https://amzn.to/3MNk4F2)El JSN-SR04T es un módulo de sensor ultrasónico que utiliza la tecnología de sonar para detectar la distancia de los objetos. Este módulo compacto y fácil de usar presenta una alta precisión y confiabilidad, por lo que es una opción ideal para una amplia gama de aplicaciones que incluyen robótica, automatización y sistemas de seguridad. El sensor tiene un rango de detección de hasta 5 metros y puede detectar objetos dentro de un ángulo de 15 grados. Funciona a una frecuencia de 40 kHz y tiene una resolución de 1 cm. El módulo también incluye una función de compensación de temperatura incorporada, asegurando lecturas estables y precisas incluso en diferentes condiciones de temperatura.**El JSN-SR04T**El módulo está diseñado con una carcasa impermeable y a prueba de polvo, lo que lo hace adecuado para su uso en entornos hostiles. Es fácil de instalar e integra perfectamente con una amplia gama de microcontroladores, como Arduino y Raspberry Pi, a través de su simple interfaz de tres pines. En general, el módulo de sensor ultrasónico JSN-SR04T es una excelente opción para cualquier persona que busque una solución de medición de distancia confiable y precisa para sus proyectos. |

### Fuente de alimentación

Para alimentar el microcontrolador, necesita una fuente de alimentación. La batería de 18650 es la mejor opción. Es barato y puede cargarlo con un panel solar. Pero también puede usar un banco de energía o una fuente de alimentación USB.

| Parte                                                   | Descripción                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![18650 battery](_media/hardware/hardware-18650.svg)    | Hay muchos tipos de baterías. Los más comunes son el ion de litio, el polímero de litio y el fosfato de hierro de litio. El**18650 batería**es una batería de iones de litio. Es la mejor opción para este proyecto. Es barato y puede cargarlo con un panel solar. Está hecho de iones de litio y se puede cargar hasta 500 veces. La batería 18650 tiene un voltaje de 3.7V y puede tener una capacidad de Araound 2200mAh. El panel solar tiene un voltaje de 5V y una potencia de 2W. El panel solar puede cargar la batería en 3 horas. Nuestro sensor necesita 5V y 100 mA. El microcontrolador necesita 5V y 100 mA. Por lo tanto, necesitamos dos baterías de 18650 un regulador de voltaje A para obtener 5V. La batería no es impermeable. Tienes que ponerlo en una carcasa impermeable. También cuide también las altas temperaturas. La batería puede explotar si hace demasiado calor. Recomendamos esta batería si desea usarla durante mucho tiempo. |
| ![Solar panel](_media/hardware/hardware-solarpanel.svg) | **Panel solar:**Como estamos en nuestro jardín, podemos usar un panel solar. Es impermeable y se puede usar bajo la lluvia. Está hecho de silicio policristalino y tiene un poder de 2W. Si compra un panel solar, debe hacer que tenga una salida de 5V con al menos 400 mA. Para cargar nuestras baterías, necesitamos un controlador de carga. Por suerte, el microcontrolador tiene un controlador de carga incorporado. Por lo tanto, podemos usar el panel solar directamente.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

### Alojamiento

Para proteger el sensor y el microcontrolador, necesita una carcasa. La carcasa tiene que ser impermeable y un poco resistente a las altas temperaturas y la radiación UV.
Usar**Petg**es bueno para los prototipos. No es impermeable y puede ser destruido por radiación UV. Usar**Petg**para uso a largo plazo. Es impermeable y resistente a los rayos UV. También puedes usar**Abdominales**. Es impermeable y resistente a los rayos UV.

Incluso**tupperware**es una buena opción. Es impermeable y resistente a los rayos UV.

### Microcontrolador

El microcontrolador es el cerebro del sistema. Es responsable de medir el nivel de agua y enviar los datos al servidor. Los siguientes microcontroladores son compatibles y recomendados:

| Parte                                                               | Descripción                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ![Seamuing SX1262 LoRa Modul](_media/hardware/hardware-esplora.svg) | El[Seaming SX1262 Lora Módulo 868](https://amzn.to/3UFRGq5)es un microcontrolador con un módulo Lora. Es barato y fácil de usar. El SX1262 es un transceptor de baja potencia y de baja potencia altamente integrado diseñado para su uso en una variedad de aplicaciones de comunicación inalámbrica. Cuenta con un modo de consumo de energía ultra bajo, lo que lo hace ideal para aplicaciones con batería que requieren una duración de batería larga. El SX1262 utiliza la técnica de modulación Lora, que permite una comunicación de largo alcance con un consumo de energía mínimo. Con un rango de hasta 15 km en condiciones de línea de visión y hasta 2 km en entornos urbanos, el SX1262 es una excelente opción para aplicaciones de comunicación inalámbrica de largo alcance. El transceptor opera en el rango de frecuencia de 860-930 MHz, lo que lo hace compatible con una amplia gama de requisitos regionales regionales. También presenta una alta sensibilidad de -148 dBm, lo que permite una comunicación confiable incluso en entornos de señal ruidosos o débiles. El SX1262 está diseñado con una interfaz altamente configurable, lo que facilita la integración en una amplia gama de aplicaciones. También presenta un modo de espera de baja potencia, que reduce el consumo de energía cuando el transceptor no está en uso. En general, el SX1262 es una solución de transceptor altamente versátil y confiable que es ideal para una amplia gama de aplicaciones de comunicación inalámbrica, que incluyen IoT, medición inteligente y automatización industrial.**No es impermeable.**Tienes que ponerlo en una carcasa impermeable. Recomendamos este microcontrolador si solo desea probarlo. No se recomienda para uso a largo plazo. |

### Puerta

Verifique el mapa TTN para ver si hay una puerta de enlace cerca de usted. Si no hay puerta de enlace cerca de usted, puede comprar una puerta de enlace pero necesita una conexión a Internet. La puerta de enlace es el puente entre el microcontrolador y el servidor TTN. Las siguientes puertas de enlace son compatibles y recomendadas:

| Parte                                                | Descripción                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![TTN gateway](_media/hardware/hardware-gateway.svg) | [TTN Guerra interior](https://amzn.to/3L1x1JN)La puerta de enlace está diseñada para funcionar sin problemas con las cosas Network V3, que ofrece una gama de características, como la activación de dispositivos seguros, la cobertura global y la gestión fácil de dispositivos. También presenta soporte incorporado para Bluetooth Low Energy (BLE) y Wi-Fi, lo que permite una configuración y administración fácil utilizando un teléfono inteligente o computadora. En general, las cosas que cubre la puerta de enlace interior de Lorawan TTNV3 es una excelente opción para cualquier persona que busque una puerta de entrada confiable y fácil de usar para su red Lorawan. Es asequible, eficiente en energía y está repleto de características que lo convierten en una opción ideal para aplicaciones de IoT comerciales e industriales. |

## 3. Assembeling

1.  [Sensor a controlador](#sensor-to-controller)
2.  [Potencia para controlador](#power-to-controller)
3.  [Solución de problemas](#trouble-shooting)

### Sensor a controlador

Este ejemplo ilustra cómo ensamblar el sensor HC-SR04 al microcontrolador. El sensor está conectado al microcontrolador con un cable de 4 pines. El cable amarillo es el cable de gatillo. El cable azul es el cable de eco. El cable rojo es el cable de 5V. El cable negro es el cable de tierra.

![Schema for ultra sonic sensor](_media/schema/schema-regenfass-ultrasonic.png)

### Potencia para controlador

### Solución de problemas

* * *

#### Lorawan

-   Puerta de entrada de Lorawan

#### Micro controlador

Es obvio que necesita un tablero para ejecutar el software. Pero también necesita un chip Lora para enviar los datos a TTN. Se admiten los siguientes tableros:

-   [Ttgo lora32](Hardware/TTGOLoRa32.md)
-   [Heltec Lora32](Hardware/HeltecLoRa32.md)

### Esquemático

![Schematic](https://raw.githubusercontent.com/Regenfass/Regenfass/master/Hardware/Schematic.png)

### Piezas impresas en 3D

## Software

### Arduino

-   [Arduino](Software/Arduino/README.md)

### Servidor

-   [Servidor](Software/Server/README.md)

### Bot de telegrama

-   [Bot de telegrama](Software/TelegramBot/README.md)

## Contribuir

-   <https://github.com/ttnleipzig/regenfass-hc-sr04/>
-

## Licencia

[Atribución no comercial-sharealike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

**Eres libre de:**

-   Compartir: copiar y redistribuir el material en cualquier medio o formato
-   Adaptar - remix, transformar y construir sobre el material

* * *

_Hecho con ❤️ por[docsificar](https://docsify.js.org/)_
