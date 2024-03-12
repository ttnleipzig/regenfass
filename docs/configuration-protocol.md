# S(imple)C(onfiguration)P(rotocol)

## Set value

```plain
<KEY>=<VALUE>\n
^^^^^^^^^^^^^^^
  |  |   |    `- statement delimiter
  |  |   |
  |  |   `- value as a string (can't contain `=` and `\n`)
  |  `- delimiter
  `- key as a string (can't contain `=` and `\n`)
```

## Query key

```plain
<KEY>?\n
^^^^^^
   | `- Query this key
   `- Key to retrieve
```

## Run action

```plain
<ACTION>!\n
^^^^^^^^^
   |    `- Run this action
   `- Action to run
```



