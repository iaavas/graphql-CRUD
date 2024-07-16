import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
let todos = [];
const typeDefs = `#graphql
  type Todo {
  id: Int!
  title: String!
  desc: String!
  isCompleted: Boolean

  
}

  type Query {
    todos: [Todo!]!
    todo(id:ID!):Todo
    }
  type Mutation {
    createTodo(title: String!, desc: String!): Todo!
    deleteTodo(id: Int!): Todo!
    completeTodo(id: Int!): Todo!

  }


`;
const resolvers = {
    Query: {
        todos: () => todos,
        todo: (parent, { id }) => todos.find((t) => t.id === id),
    },
    Mutation: {
        createTodo(_, { title, desc }) {
            const newTodo = {
                id: todos.length + 1,
                title,
                desc,
                isCompleted: false,
            };
            todos.push(newTodo);
            return newTodo;
        },
        deleteTodo(_, { id }) {
            const todoIndex = todos.findIndex((t) => t.id === Number(id));
            if (todoIndex === -1) {
                throw new Error(`Todo with id ${id} not found`);
            }
            const deletedTodo = todos.splice(todoIndex, 1)[0];
            console.log(deletedTodo);
            return deletedTodo;
        },
        completeTodo(_, { id }) {
            let todo = todos.find((t) => t.id === Number(id));
            console.log(todo);
            todo.isCompleted = true;
            return todo;
        },
    },
};
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});
console.log(`🚀  Server ready at: ${url}`);
