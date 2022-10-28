const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

/*
- users:
  { 
    id: 'uuid', // precisa ser um uuid
    name: 'Danilo Vieira', 
    username: 'danilo', 
    todos: []
  }
*/

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  console.log(request, username)
  const userExist = users.find(u => u.username === username);

  
  if (users.length == 0) {
    return response.status(404).json({ Error: "Não há usuários cadastrados" })
  }

  if (!userExist) {
    return response.status(404).send("Usuário não encontrado")
  }

  request.user = userExist

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExist = users.find((user) => user.username === username)

  if (userExist) {
    return response.status(400).json({ Error: "Usuário já existe no sistema" })
  }

  const user = { 
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);
  return response.json(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.status(201).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.send(todo)
});

/*
  A rota deve receber, pelo header da requisição, uma propriedade username 
  contendo o username do usuário e receber as propriedades title e deadline 
  dentro do corpo. É preciso alterar apenas o title e o deadline da tarefa que
   possua o id igual ao id presente nos parâmetros da rota.
*/

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find(user => user.username === username)

  const todoselct =  user.todos.find(todo => todo.id === id)

  todoselct.title = title;
  todoselct.deadline = deadline;

  console.log(todoselct)

  return response.send(todoselct)
});

/*
  A rota deve receber, pelo header da requisição, uma propriedade username contendo
   o username do usuário e alterar a propriedade done para true no todo que possuir 
   um id igual ao id presente nos parâmetros da rota.
*/

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find(user => user.username === username);
  const idSelect = user.todos.find(to => to.id === id);

  idSelect.done = true;

  return response.send(user)
});

/*
  A rota deve receber, pelo header da requisição, uma propriedade username contendo 
  o username do usuário e excluir o todo que possuir um id igual ao id presente nos 
  parâmetros da rota.
*/

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = request.user;

  user.todos.splice(user.todos.indexOf(id), 1);

  return response.send(users)
});

module.exports = app;
