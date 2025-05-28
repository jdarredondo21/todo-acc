import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Task } from '../models/task.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private STORAGE_KEY = 'tasks';

  private tasks: Task[] = [];
  
  constructor(private storage: Storage) {}

  async getTasks(): Promise<Task[]> {
    const tasks = await this.storage.get(this.STORAGE_KEY);
    return tasks || [];
  }
  
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9); // Genero un id aleatorio
  }  

  private async save(): Promise<void> {
    await this.storage.set(this.STORAGE_KEY, this.tasks);
  }  

  async addTask(title: string, categoryId?: string, createdAt: number = Date.now()): Promise<void> {
    const newTask: Task = {
      id: this.generateId(),
      title,
      completed: false,
      categoryId,
      createdAt
    };
    this.tasks.push(newTask);
    await this.save();
  }

  async updateTask(updatedTask: Task): Promise<void> {
    const index = this.tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      this.tasks[index] = updatedTask;
      await this.save();
    }
  }

  async deleteTask(id: string) {
    let tasks = await this.getTasks();
    tasks = tasks.filter(t => t.id !== id);
    await this.storage.set(this.STORAGE_KEY, tasks);
  }

  async deleteAllTasks() {
    await this.storage.set(this.STORAGE_KEY, []);
  }
}
