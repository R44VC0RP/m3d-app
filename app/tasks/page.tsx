"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface Task {
  _id: string;
  text: string;
  isCompleted: boolean;
}

export default function TasksPage() {
  const tasks = useQuery(api.tasks.get) as Task[] | undefined;
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Convex Tasks Demo</h1>
        <div className="space-y-4">
          {tasks === undefined ? (
            <div className="text-center text-gray-500">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-gray-500">No tasks found</div>
          ) : (
            tasks.map(({ _id, text, isCompleted }) => (
              <div 
                key={_id} 
                className={`p-4 rounded-lg border ${
                  isCompleted 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    isCompleted ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className={isCompleted ? 'line-through' : ''}>{text}</span>
                  <span className="ml-auto text-sm opacity-60">
                    {isCompleted ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
