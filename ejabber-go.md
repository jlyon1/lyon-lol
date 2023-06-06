+++
title = "Ejabberd + Go"
slug = "ejabberd-go"
date = 2023-06-05
+++

Recently I stumbled upon some cool uses of [ejabberd](https://www.ejabberd.im). Immediately I became intrigued and wanted to see what I could do with it. I have always been a big fan of erlang & elixir, so seeing it used in this usecase was very exciting to me. My biggest complaint was that the xmpp protocol was difficult to digest, so I wanted to simplify things. This blog is a quick writeup of a few things i've found interesting. Once I am happy with the state of the codebase I will publish it on github.

I started brainstorming the simplest workflow I could and decided I wanted the following:

1) Users can navigate to `/chat/{from_username}/{to_username}`.
2) The application would create two users in ejabberd with the two usernames from the url.
3) The user would be served a basic chat applicaiton that would send messages over a REST api.
4) Users would be able to retrieve their messages via REST api.

This is a high level overview of what I came up with **Note:** Things are intentionally vague as this is more of a TIL blog post rather than an explaination. I plan to write a full explaination of this later on.

## Step 0 - Setup Ejabberd & the environment for development

Prior to writing any go code I setup an ejabberd server with a very basic config. The only real changes I made were disabling TLS for testing purposes. The go application runs on the same machine as ejabberd and makes requests over the REST and XMPP apis.

## Step 1 - Sending Messages

I am piggybacking on the ejabberd admin API to support a lot of this functionality. 

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

The key here is the `CreateOrGetUser` function that will create a user with the display name that you add in the request & map that ID to the ejabberd user. Then subsequent requests with the same ID will come from or go to that same user. We do this for the user we are sending to as well. Some additional validation logic is omitted for simplicity.

After all the initialization happens we can just use the ejabberd admin api to directly send a message from the "from user" to the "to user"

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

This code logs into the client with an admin account on the ejabberd server, and finally calls a send message using the data from the request.

## Step 2 - Receiving Messages

The message receive handler works with xmpp and sends responses via a long running grpc request that passes through a grpc-gateway. To the end user they can just make a long-lived GET request to `api/v1/message/{from_id}/{to_id}` and the server will respond with a newline delimited json response for every message in the converation between `from_id` and `to_id`

```go
for {
    select {
    case <-ctx.Done():
        log.Logger().Debug("Client disconnected, quitting")
        return nil
    default:
        // TODO filter by recipient & timeout
        mess, err := client.Recv()
        if err != nil {
            log.Logger().Error("Failed to receive message", err)
        }
        switch msg := mess.(type) {
        case xmpp.Chat:
            log.Logger().Infof("Received message from %s: %s\n", msg.Remote, msg.Text)
            sender, err := m.usersClient.GetUser(context.Background(), &users.GetUserRequest{
                ExternalId: req.ToId,
            })
            sendName := "Unknown"
            if err != nil {
                log.Logger().Errorf("Failed to get to user: %s", err)
            } else {
                sendName = sender.User.DisplayName
            }
            if sender.User.UserJid == msg.Remote {
                stream.Send(&messages.Message{
                    Type:            messages.MessageType_MESSAGE_TYPE_TEXT,
                    Text:            fmt.Sprintf(msg.Text), // TODO lookup user
                    FromDisplayName: sendName,
                })
            }

        }
    }
}
```

This code makes an xmpp request to ejabberd to get all of the messages for a user, filters them by sender id and returns those messages. This has a flaw in that if the user has multiple points of contact with the sender (eg in multiple groups) they would see all messages from that user in this chat. Since this is a POC and only supports single user chats, that's not an issue for now. 

Next up I will work on group chat support but for now this is what i've got.
