

const express = require("express")
const { v4: uuid } = require("uuid")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

const users = []

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  if (users.length == 0) {
    return response.status(404).json({ Error: "Não há usuários cadastrados" })
  }

  const user = users.find((u) => u.username == username)

  if (!user) {
    return response.status(404).send("Usuário não encontrado")
  }

  request.user = user

  return next()
}

// Criar usuario
app.post("/users", (request, response) => {
  // Recebendo dados da requisição
  const { name, username } = request.body

  // verificando se o usuario existe pelo username
  const userExists = users.find((u) => u.username === username)
  if (userExists) {
    return response.status(400).json({ Error: "Usuário já existe no sistema" })
  }

  // formatando usuario
  const user = {
    id: uuid(),
    name,
    username,
    todos: []
  }

  // adicionando usuario
  users.push(user)

  // retornando usuario criado
  return response.status(201).json(user)
})

app.get("/todos", checksExistsUserAccount, (request, response) => {
  // recebendo usuario da requisição
  const { user } = request

  // retornando todos do usuario
  return response.json(user.todos)
})

app.post("/todos", checksExistsUserAccount, (request, response) => {
  // Recebendo dados da requisição
  const { title, deadline } = request.body
  const { user } = request

  // Formatando todo
  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  // Adicionando todo
  user.todos.push(todo)

  // Retornado todo
  return response.status(201).json(todo)
})

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  //Recebendo parametros da requisição
  const { id } = request.params
  const { title, deadline } = request.body
  const { user } = request

  // Buscando todo
  const todo = user.todos.find((t) => t.id === id)

  if (!todo) {
    return response.status(404).json({ Error: "Todo não existe" })
  }

  // alterando valores da todo
  todo.title = title
  todo.deadline = new Date(deadline)

  // retornando todo alterada
  return response.status(201).json(todo)
})

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  // Recebendo dados da requisição
  const { id } = request.params
  const { user } = request

  // buscando todo
  const todo = user.todos.find((t) => t.id === id)

  if (!todo) {
    return response.status(404).json({ Error: "Todo não existe" })
  }

  if (todo.done == true) {
    return response.status(404).json({ Error: "Todo já concluida" })
  }

  // altrando valor
  todo.done = true

  // Retornando todo alterada
  return response.status(201).json(todo)
})

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  // recebendo id da requisição
  const { id } = request.params
  const { user } = request

  // busca o indicie do array
  const index = user.todos.findIndex((t) => t.id === id)

  if (index == -1) {
    return response.status(404).json({ Erro: "Todo não existe" })
  }

  // deleta a todo da posição
  user.todos.splice(index, 1)

  // retorna uma mensagem de sucesso
  return response.status(204)
})

module.exports = app

