# Discord Theme

DiscordTheme is a free and open source [Pterodactyl theme](https://pterodactyl.io) with a Discord-inspired layout.

Based on **Pterodactyl Panel v1.15.1**.

### Features

- Discord-style **server icon rail** and **channel sidebar** for navigation
- **Edit mode** — drag-and-drop server reorder (saved per user)
- **Custom server icons** — upload from Settings → Server Icon
- Console **stat cards** and **charts** styled to match the theme

## Installation

This will update your panel to the latest DiscordTheme release (Pterodactyl **v1.15.1** base).

<details>
<summary>Upgrade PHP</summary>

Before proceeding, ensure PHP **8.2+** (8.3 recommended):

```bash
sudo apt update
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install -y php8.3
php -v
```

</details>

### Enter Maintenance Mode

```bash
cd /var/www/pterodactyl
php artisan down
```

### Download the theme

```bash
curl -L https://github.com/jgbry/DiscordTheme/releases/latest/download/panel.tar.gz | tar -xzv
```

```bash
chmod -R 755 storage/* bootstrap/cache
```

### Update Dependencies

```bash
composer install --no-dev --optimize-autoloader
```

### Clear Compiled Template Cache

```bash
php artisan view:clear
php artisan config:clear
```

### Database Updates

```bash
php artisan migrate --seed --force
php artisan storage:link
```

### Set Permissions

```bash
# If using NGINX or Apache (not on CentOS):
chown -R www-data:www-data /var/www/pterodactyl/*

# If using NGINX on CentOS:
chown -R nginx:nginx /var/www/pterodactyl/*

# If using Apache on CentOS:
chown -R apache:apache /var/www/pterodactyl/*
```

### Restarting Queue Workers

```bash
php artisan queue:restart
```

### Exit Maintenance Mode

```bash
php artisan up
```

## Building from source

```bash
yarn install
yarn build:production
```

See also [BUILDING.md](./BUILDING.md).

## Documentation

* [Panel Documentation](https://pterodactyl.io/panel/1.0/getting_started.html)
* [Wings Documentation](https://pterodactyl.io/wings/1.0/installing.html)
* [Community Guides](https://pterodactyl.io/community/about.html)
* Or, get additional help [via Discord](https://discord.gg/pterodactyl)

## License

Pterodactyl® Copyright © 2015 - 2023 Dane Everitt and contributors.

> DiscordTheme is not affiliated with Pterodactyl® Panel or its contributors.

Pterodactyl code released under the [MIT License](./LICENSE.md).
