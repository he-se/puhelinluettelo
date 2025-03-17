const express = require("express");
const morgan = require("morgan");
const app = express();

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: "1",
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: "2",
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: "3",
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: "4",
  },
];

// Middleware
app.use(express.json());

morgan.token("data", (req) => {
  //creating data token
  return JSON.stringify(req.body);
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :data")
);
// Show static pages
app.use(express.static("dist"));

// Routes
app.get("/info", (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people.</p>
    <p>${new Date()}</p>`);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

const generateId = () => {
  const id = Math.floor(Math.random() * 1000000);
  return id.toString();
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "name missing",
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: "number missing",
    });
  }
  const foundPerson = persons.find((person) => person.name === body.name);
  if (foundPerson) {
    return response.status(409).json({ error: "name must be unique" });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);
  response.json(person);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    console.log("x");
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
