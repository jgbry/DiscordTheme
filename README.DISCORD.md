# Pterodactyl Panel — Discord theme + Edit mode

Based on **Pterodactyl Panel v1.15.1**, with:

- **Discord-style layout** — left server icon rail, channel sidebar for tabs, themed dashboard rows
- **Edit mode** — drag-and-drop server reorder, persisted per user (`server_order`)
- **Custom server icons** — upload in Settings → Server Icon (shown on the rail and dashboard rows)

**Not included:** phpMyAdmin auto-login / SSO.

## Requirements

Same as upstream Pterodactyl Panel (PHP, MySQL/MariaDB, Redis, Node 22+, Yarn classic 1.22.x).

## Install extras

```bash
php artisan migrate --force
php artisan storage:link
yarn install
yarn build:production
```

## Upstream

https://github.com/pterodactyl/panel (v1.15.1)
