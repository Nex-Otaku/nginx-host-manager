Nginx Host Manager
===================================

Development tool for managing Nginx hosts.

![nginx-host-manager PNG](https://raw.githubusercontent.com/Nex-Otaku/nginx-host-manager/master/img/screenshot.png)

Why?
---------

You for sure can do all of its functionality manually.

It is targeted to be more convenient and fast way to do the same thing.


How It Works
---------

Tool consists of two parts:

1. Nginx reverse proxy docker container, to serve your hosts.

2. CLI tool to manage hosts - add, remove hosts, start proxy container, reload hosts configuration.


Prerequisites
---------

To use this tool, you will need:

1. Node.js - for host management in CLI

2. Docker - for running proxy container

3. [mkcert](https://github.com/FiloSottile/mkcert) - for making self-signed SSL certificates


Installation
---------

You can run tool from its own repo.

```
Clone the repo
cd nginx-host-manager
npm start
```

Or just install it globally to run from anywhere.

```
Clone the repo
cd nginx-host-manager
npm link
nginx-host-manager
```

Usage
---------

```
nginx-host-manager
```
