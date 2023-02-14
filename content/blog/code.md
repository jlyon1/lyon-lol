+++
title = "lyon.lol from the ground up"
date = 2023-02-13
+++

Continuing the meta blog-about-blog trend I will go into how I run the infrastructure used to host this site and other small things i'm working on.

When working on personal projects I usually don't want to think too hard about deployments while still not being limited by my infrastructure. As such, this site and most everything else I put online is on a $4 DigitalOcean VPS with Docker and [Dokku](https://dokku.com/) installed. Shout out to [@sidney](https://sidney.kochman.org) for introducing me to it years ago.

Dokku is a great go-to self hosted PaaS for simple projects. It works nicely with Docker and Buildpacks to provide a simple `git push` deployment mechanism with zero downtime deployments. Deploying an app with ssl is as simple as running:

```bash
# On the VPS
$ dokku apps:create [name]
$ dokku domains:set [name] name.lyon.lol
$ dokku letsencrypt:auto-renew [name]

# Locally
$ git remote add dokku dokku@lyon.lol:[name]
$ git push origin main:master
```

After this my new app will be hosted at `https://name.lyon.lol`. If I want to deploy a new version I simply git push again.

In order to facilitate this I've setup a few DNS records, namely a wildcard A record for all subdomains on lyon.lol

```
Host IP          Type   TTL
@    lyon.lol.   A      5m
*    lyon.lol.   A      5m
```

I setup this website with [Zola](https://www.getzola.org/) I learned it has built in syntax highlighting that only requires a basic config change. This means that 

```js
var x = 5;
```