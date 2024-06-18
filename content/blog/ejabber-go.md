+++
title = "Ejabberd + Go"
slug = "ejabberd-go"
date = 2023-06-05
draft = true
+++

Recently I stumbled upon some cool uses of [ejabberd](https://www.ejabberd.im). Immediately I became intrigued and wanted to see what I could do with it. I have always been a big fan of erlang & elixir, so seeing it used in this usecase was very exciting to me. My biggest complaint was that the xmpp protocol was difficult to digest, so I wanted to simplify things. This blog is a quick writeup of what I want to accomplish and how I send messages in this project. Once I am happy with the state of the codebase I will publish it on github.

I started brainstorming the simplest workflow I could and decided I wanted the following:

1) Users can navigate to `/chat/{from_username}/{to_username}`.
2) The application would create two users in ejabberd with the two usernames from the url.
3) The user would be served a basic chat applicaiton that would send messages over a REST api.
4) Users would be able to retrieve their messages via REST api.



### Step 1 - Setup Ejabberd & the environment for development

Prior to writing any go code I setup an ejabberd server with a very basic config. The only real changes I made were disabling TLS for testing purposes. The go application runs on the same machine as ejabberd and makes requests over the REST and XMPP apis.

### Step 2 - Sending Messages

I am piggybacking on the ejabberd admin API to support a lot of this functionality. This code uses the `"github.com/processone/ejabberd-api"` package to communicate with ejabberd.

To send a message the user makes a post request to `/api/v1/message` with the following body:

```json
{
    "fromId": "[your user id]",
    "toId": "[the id to send to]",
    "message": "[the message to send]"
}
```

The application then does the following for each user:

```go
fromUserResp, err := m.usersClient.CreateOrGetUser(context.Background(), &users.CreateOrGetUserRequest{
    ExternalId:  req.FromId,
    DisplayName: req.FromId,
})

if err != nil {
    log.Logger().Errorf("Failed to get from user: %s", err)
    return nil, status.Errorf(codes.NotFound, "Failed to get from user %s", err)
}

fromUser = users.User{
    DisplayName: fromUserResp.User.DisplayName,
    UserJid:     fromUserResp.User.UserJid,
    ExternalId:  fromUserResp.User.ExternalId,
}
```

The key here is the CreateOrGetUser function, which creates a user with the display name specified in the request and maps that ID to the ejabberd user. Subsequent requests with the same ID will be associated with the same user. We perform the same lookup for the user we are sending the message to. For the sake of simplicity, we have omitted some additional validation logic.

Once all the initialization is complete, we can use the ejabberd admin API to send a message directly from the "from user" to the "to user".
```go
m.client.AuthorizeClient()
msg := EjabberdMessage{
    Type:    "message",
    From:    fromUser.UserJid,
    To:      toUser.UserJid,
    Subject: "message",
    Body:    req.Message.Text,
}

body, _ := json.Marshal(msg)

code, result, err := m.client.Client.CallRaw(body, "send_message", true)
if err != nil {
    return nil, status.Error(codes.Internal, err.Error())
}
```

This code logs in with an admin account on the ejabberd server and sends a message using the provided data. Now, we can send ejabberd messages to and from any user without XMPP. Users can log in anonymously using a simple external ID, and recipients can use their preferred XMPP client. All communication is done through the REST API.

A more conventional approach would involve logging in on behalf of the user and sending messages using XMPP. But where's the fun in that?

I plan to write a detailed blog post about this implementation in the future. For now, this simple solution provides impressive functionality.
