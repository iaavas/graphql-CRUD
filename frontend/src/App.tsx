import { useState } from "react";

import { useQuery, useMutation, gql } from "@apollo/client";

interface Todo {
  id: number;
  title: string;
  desc: string;
  isCompleted: boolean;
}

const GET_TODOS = gql`
  query getTodos {
    todos {
      id
      title
      desc
      isCompleted
    }
  }
`;
const CREATE_TODO = gql`
  mutation createTodo($title: String!, $desc: String!) {
    createTodo(title: $title, desc: $desc) {
      title
      desc
    }
  }
`;
const DELETE_TODO = gql`
  mutation deleteTodo($id: Int!) {
    deleteTodo(id: $id) {
      id
    }
  }
`;

export default function App() {
  const [createTodo] = useMutation(CREATE_TODO, {
    update(cache, { data: { createTodo } }) {
      const existingTodos = cache.readQuery<{ todos: Todo[] }>({
        query: GET_TODOS,
      });

      if (!existingTodos) return;

      const { todos } = existingTodos;

      cache.writeQuery({
        query: GET_TODOS,
        data: { todos: [...todos, createTodo] },
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createTodo({
      variables: { title, desc },
    }).then(() => {
      setTitle("");
      setDesc("");
    });
  };

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  return (
    <div>
      <h2 className="text-xl bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-600 p-4 text-white">
        GraphQL Todo-List 🚀
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex items-center justify-center gap-4 m-4"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-1.5 border border-stone-500"
          placeholder="title"
        />
        <br />
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="p-1.5 border border-stone-500"
          placeholder="description"
        />
        <br />
        <button
          type="submit"
          className="bg-green-700 text-white rounded-md p-2 hover:bg-green-900 "
        >
          Submit
        </button>
      </form>
      <table className="p-4 mx-auto ">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Is Completed</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <DisplayLocations />
        </tbody>
      </table>
    </div>
  );
}

function DisplayLocations() {
  const { loading, error, data } = useQuery(GET_TODOS);
  const [deleteTodo] = useMutation(DELETE_TODO, {
    update(cache, { data: { deleteTodo } }) {
      // Read the current cache data
      const existingTodos = cache.readQuery<{ todos: Todo[] }>({
        query: GET_TODOS,
      });

      if (!existingTodos) return;

      const { todos } = existingTodos;
      console.log(deleteTodo.id);
      const updatedTodos = todos.filter((todo) => todo.id != deleteTodo.id);

      console.log(updatedTodos);

      cache.writeQuery({
        query: GET_TODOS,
        data: { todos: updatedTodos },
      });
    },
  });

  if (loading)
    return (
      <tr>
        <td>Loading...</td>
      </tr>
    );
  if (error)
    return (
      <tr>
        <td>Error : {error.message}</td>
      </tr>
    );

  const handleDelete = (id: number) => {
    deleteTodo({
      variables: { id },
    });
  };

  return data.todos.map(({ id, title, desc, isCompleted }: Todo) => (
    <tr key={id} className="">
      <td className="text-red-900 font-bold p-2">{title}</td>

      <td className="p-2">{desc}</td>
      <td className="p-2">{isCompleted ? "True" : "false"}</td>
      <td className="p-2">
        <button
          onClick={() => handleDelete(Number(id))}
          className="bg-red-600 text-white p-2 rounded-sm"
        >
          Delete
        </button>
      </td>
    </tr>
  ));
}
