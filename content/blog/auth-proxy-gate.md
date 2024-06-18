+++
title = "Simple Security for Personal Projects"
slug = "simple-security-for-personal-projects"
date = 2024-06-18
+++

I am often asked to build scripts for people (or I offer to do it just for fun). Usually these scripts tackle simple, menial things
like geocoding addresses into latitude longitude points to put pins on a map for something like the [Shuttle Tracker](https://github.com/wtg/shuttletracker), or a simple transaction ledger for budgeting. These scripts are almost always
driven by a flask app to provide a basic UI for my less technically savvy friends and family, sending a URL that _just works_ is much easier than any other method of distribution.

Sometimes these data are sensitive, or calls an API that will cost me money, and I get uncomfortable publishing it to the general internet without some type of security. Despite my searching, I have not found a simple way to do this type of blocking.

In response, I decided to create my own tailor-made solution. 

Introducing [auth-proxy-gate](https://github.com/jlyon1/auth-proxy-gate) (name pending). This project aims to be a simple OAuth login protected proxy, if you are logged in, your requests will be proxied to whatever service we are protecting, otherwise you get a 401.

### Tech

I wanted to be able to write this in an afternoon, so I picked simple tech I'm familiar with:

* Go
* [Boltdb](https://github.com/etcd-io/bbolt)
* [Templ](https://github.com/a-h/templ)

I have also limited the initial implementation to just Google OAuth Providers. 

### How it works

First set up a [Google OAuth Application](https://developers.google.com/identity/protocols/oauth2). I have requested pretty minimal permissions since I really only need an email to verify. 

In my case I set up two redirect urls _these can be set on the credentials tab of the oauth consent screen configuration_:

```markdown
http://localhost:8081/api/v1/auth/callback?provider=google - for local testing
https://service.lyon.lol/api/v1/auth/callback?provider=google - fake url of the deployed service
```

After which grab your Client ID and Client Secret.

We can then run the application like this:

```bash
templ generate; go build .

./auth-proxy-gate --secret "GOOGLE SECRET" --redirect "http://localhost:8081" --clientid "GOOGLE_CLIENT_ID" --secretKey "replace_me_with_a_secret" --proxy "https://www.google.com" --allowList "email@example.com"
```

This is super simple, but effective. I will run this on the VPS where the app is running. My app will run listening on localhost, and the proxy will listen on whatever domain I chose to set up, for example [https://geocode.lyonsoftworks.com](https://geocode.lyonsoftworks.com) and add 
any authorized users to the allow-list.

My next improvements will be to switch to a sqlite database, add a config file, and then add additional oauth providers.
