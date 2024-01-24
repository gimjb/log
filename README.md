# `gimjb/log`

Log to console and file.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Install

```bash
npm install gimjb/log
```

## Usage

```ts
import path from 'path';
import log from 'gimjb/log';

log.path = path.join(__dirname, 'log.txt');

log.info('Hello world!');
log.warn('Hello world!');
log.error('Hello world!');
```

## Contributing

Contributions are welcome! Please read the [Code of Conduct](docs/CODE_OF_CONDUCT.md)
and [Contributing](docs/CONTRIBUTING.md) documents before contributing.

## License

This project is licensed under the MIT-0 License; see the
[LICENSE.md](LICENSE.md) file for details.
