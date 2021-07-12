## Multiplayer games networking

http://buildnewgames.com/real-time-multiplayer/

### Server updates

There are two update loops in the server:

1. Physics update loop: run every 15ms (faster)

2. Server update loop: run every 45ms (slower). Here we send the state to all clients.

You can use more than one server update loop for things that don't need to be updated so often.

### Client updates

## To investigate

- What is client side prediction?

Latency can be from 30ms to 800ms. We can't update client position after the server process the input and sends back the new position.
We can act on input immediately, predicting what the server will calculate.
