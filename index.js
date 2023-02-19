const express = require('express');
const amqp = require('amqplib');

const app = express();
const port = 3000;
const queueName = 'testQ';

app.get('/', async (req, res) => {
  const message = 'Hello World';


  try {
    console.log('here')
    // Connect to RabbitMQ server
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // Assert the queue to make sure it exists
    await channel.assertQueue(queueName);

    // Send message to the queue
    await channel.sendToQueue(queueName, Buffer.from(message));

    // Close the connection to RabbitMQ
    await channel.close();
    await connection.close();

    // Send response to client
    res.send('Message sent to RabbitMQ\n');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending message to RabbitMQ\n');
  }
});

// Set up a RabbitMQ consumer to listen for messages on the queue
amqp.connect('amqp://localhost').then(connection => {
  connection.createChannel().then(channel => {
    channel.assertQueue(queueName).then(() => {
      channel.consume(queueName, message => {
        console.log(`Received message: ${message.content.toString()}`);
      });
    });
  });
}).catch(error => {
  console.error(error);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
