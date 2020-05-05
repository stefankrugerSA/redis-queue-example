# Redis example queue application

This is an example of using events and queues on Redis


## Installation

* Clone this repository
* Run `docker-compose up --scale redis-consumer=3 --build` to startup 1 producer and 3 consumers/workers


## Methods

### Send Bulk Messages

**POST /messages/:qname/:times**

Sends a new message.

Parameters:

* `qname` (String): The Queue name. Maximum 80 characters; alphanumeric characters, hyphens (-), and underscores (_) are allowed.
* `times` (Number): The amount of times you want to send the message to the que

Example:

```
POST /messages/myqueue/10
Content-Type: application/json

{
	"message": "Hello World!",
	"delay": 0
}
```

```curl
curl --location --request POST 'localhost:8000/messages/myqueue/500' \
--header 'Content-Type: application/json' \
--data-raw '{
	"message": {"name": "person"},
	"delay": 0
}'

```



## The MIT License (MIT)

Please see the LICENSE.md file.
