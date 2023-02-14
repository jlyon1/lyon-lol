+++
title = "Infrastrucure Time"
date = 2023-02-14
+++

Continuing the meta blog-about-blog trend I will go into how I run the infrastructure used to host this site and other small things I'm working on.

When working on personal projects I usually don't want to think too hard about deployments while still not being limited by my infrastructure. As such, this site and most everything else I put online is on a $4 DigitalOcean VPS with Docker and [Dokku](https://dokku.com/) installed. Shout out to [@sidney](https://sidney.kochman.org) for introducing me to it years ago.

Dokku is a great go-to self-hosted PaaS for simple projects. It works nicely with Docker and Buildpacks to provide a simple `git push` deployment mechanism with zero downtime deployments. Deploying an app with SSL is as simple as running:

```bash
# On the VPS
$ dokku apps:create [name]
$ dokku domains:set [name] name.lyon.lol
$ dokku letsencrypt:auto-renew [name]

# Locally
$ git remote add dokku dokku@lyon.lol:[name]
$ git push origin main:master
```

After this, my new app will be hosted at `https://name.lyon.lol`. If I want to deploy a new version I simply git push again.

To facilitate this I've set up a few DNS records, namely a wildcard A record for all subdomains on lyon.lol

```
Host IP              Type   TTL
@    68.183.102.12   A      5m
*    68.183.102.12   A      5m
```

This site is a great example of how this infrastructure is very powerful and quick to iterate with. The source is located on [github](https://github.com/jlyon1/lyon-lol). Content updates are just a `git push` away. I write the content, compile it with [Zola](https://www.getzola.org/) and commit the whole output to the repo, at which point I push to dokku.

For example:

```bash
docker run -u "$(id -u):$(id -g)" -v $PWD:/app --workdir /app -p 8080:8080 -p 1024:1024 ghcr.io/getzola/zola:v0.16.0 build
git add .
git commit -m "Update content"
git push dokku master
```

This keeps it simple and low overhead to maintain.