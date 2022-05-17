const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const  userExist = users.find((user)=> username === user.username)

  if(!userExist){
    return response.status(400).json({message:'User Not found'})
   
  }
  request.user = userExist 
  return next()
}

const checkTodoExists = (request, response, next) => {
  const {
    user,
    params: { id },
  } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo doesn't exists" });
  }

  request.todo = todo;

  return next();
};

app.post('/users', (request, response) => {
  const {name, username} = request.body

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const user = {
  id:uuidv4(),
  name,
  username,
  todos: []
 }
  users.push(user)
  response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { todos } = request.user  
    return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const { user} = request
  const todo = {
    id:uuidv4(),
    title, 
    deadline : new Date(deadline), 
    done: false, 
    created_at: Date.now()
  }
  user.todos.push(todo)
  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checkTodoExists, (request, response) => {
  const {title, deadline } = request.body
  const { todo } = request 
  todo.title = title;
  todo.deadline = deadline;
  response.status(201).send(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkTodoExists,  (request, response) => {
  const { todo } = request 
  todo.done= true;
  response.status(201).send(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, checkTodoExists, (request, response) => {
  const user = request.user  
  const { id } = request.params
  const index =  user.todos.findIndex((todo)=> id === todo.id )
  user.todos.splice(index, 1)
  response.status(204).send(user.todos)

});

module.exports = app;