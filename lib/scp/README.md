# S(imple)C(onfiguration)P(rotocol)

## Run tests

Tests are written in C++ using [Catch2](https://github.com/catchorg/Catch2).

```bash
make run-tests
```

## Protocol specification

### Operator order

1. Set value
2. Query key
3. Run action

### Set value

```plain
<KEY>=<VALUE>\n
^^^^^^^^^^^^^^^
  |  |   |    `- statement delimiter
  |  |   |
  |  |   `- value as a string (can't contain `=` and `\n`)
  |  `- delimiter
  `- key as a string (can't contain `=` and `\n`)
```

### Query key

```plain
<KEY>?\n
^^^^^^
   | `- Query this key
   `- Key to retrieve
```

### Run action

```plain
<ACTION>!\n
^^^^^^^^^
   |    `- Run this action
   `- Action to run
```
