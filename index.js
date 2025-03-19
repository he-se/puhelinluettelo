require("dotenv").config();
const express = require("express");
// const morgan = require("morgan");
const Person = require("./models/person"); // Person-konstruktorifunktio

const app = express();

// const url = `mongodb+srv://heikki:${password}@cluster0.hskrx.mongodb.net/personApp?retryWrites=true&w=majority&appName=Cluster0`;

// let persons = [
//   {
//     name: "Arto Hellas",
//     number: "040-123456",
//     id: "1",
//   },
//   {
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//     id: "2",
//   },
//   {
//     name: "Dan Abramov",
//     number: "12-43-234345",
//     id: "3",
//   },
//   {
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//     id: "4",
//   },
// ];

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

// Middleware
app.use(express.static("dist")); // Show static pages
app.use(express.json());
app.use(requestLogger);

// morgan.token("data", (req) => {
//   //creating data token
//   return JSON.stringify(req.body);
// });

// app.use(
//   morgan(":method :url :status :res[content-length] - :response-time ms :data")
// );

// Routes
app.get("/info", (request, response) => {
  Person.find({}).then((persons) => {
    response.send(`<p>Phonebook has info for ${persons.length} people.</p>
      <p>${new Date()}</p>`);
  });
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

// const generateId = () => {
//   const id = Math.floor(Math.random() * 1000000);
//   return id.toString();
// };

app.get("/api/persons/:id", (request, response, next) => {
  // const id = request.params.id;
  // const person = persons.find((person) => person.id === id);
  // if (person) {
  //   response.json(person);
  // } else {
  //   console.log("x");
  //   response.status(404).end();
  // }
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  // New Person by using Person contructor
  const person = new Person({
    name: body.name,
    number: body.number,
    // id: generateId(),
  });

  // Save to db -> http response (toJSON formatted) if succeeded
  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end();
      }

      person.name = name;
      person.number = number;

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson);
      });
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  // const id = request.params.id;
  // persons = persons.filter((person) => person.id !== id);

  // response.status(204).end();
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// Middleware
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
