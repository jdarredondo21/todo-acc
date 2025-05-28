import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private _storage: Storage | null = null;
  private STORAGE_KEY = 'categories';

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async getCategories(): Promise<Category[]> {
    if (!this._storage) {
      throw new Error('Database not created. Must call create() first');
    }
    return (await this._storage.get(this.STORAGE_KEY)) || [];
  }

  async addCategory(name: string): Promise<void> {
    const categories = await this.getCategories();
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
    };
    categories.push(newCategory);
    await this._storage?.set(this.STORAGE_KEY, categories);
  }

  async deleteCategory(id: string): Promise<void> {
    const categories = await this.getCategories();
    const updated = categories.filter(c => c.id !== id);
    await this._storage?.set(this.STORAGE_KEY, updated);
  }
}
