// Servicios, modelos y controladores necesarios
import { Component, OnInit } from '@angular/core';
import { TaskService } from '../services/task.service'; // Servicio de tareas
import { CategoryService } from '../services/category.service'; // Servicio de categorías
import { Task } from '../models/task.model'; // Modelo de tarea
import { Category } from '../models/category.model'; // Modelo de categoría
import { environment } from '../../environments/environment'; // Entorno
import { AngularFireRemoteConfig } from '@angular/fire/compat/remote-config'; // Firebase Remote Config
import { ToastController } from '@ionic/angular'; // Notificaciones tipo toast
import { AlertController } from '@ionic/angular'; // Alertas de confirmación

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  // Listas y estados para tareas y categorías
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  categories: Category[] = [];

  // Nuevas tareas y categorías
  newTaskTitle = '';
  newCategoryName = '';
  selectedCategoryId: string = '';
  selectedFilterId: string = '';

  // Para edición de tareas
  editingTaskId: string | null = null;
  editingTaskTitle: string = '';
  editingCategoryId: string = '';

  sortOption: string = 'date_desc'; // Criterio de ordenamiento
  remoteConfigEnabled = true; // Feature flag de categorías

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private remoteConfig: AngularFireRemoteConfig,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  // Inicialización al cargar la vista
  async ngOnInit() {
    console.log('🔵 ngOnInit ejecutado');
    this.initializeRemoteConfig();
    await this.loadCategories();
    await this.loadTasks();
  }

  // Carga de tareas
  async loadTasks() {
    this.tasks = await this.taskService.getTasks();
    this.applyFilter();
  }

  // Carga de categorías
  async loadCategories() {
    this.categories = await this.categoryService.getCategories();
  }

  // Agregar nueva tarea
  async addTask() {
    const title = this.newTaskTitle.trim();
    if (!title) {
      this.presentToast('El título no puede estar vacío.', 'danger');
      return;
    }

    const exists = this.tasks.some(t => t.title.toLowerCase() === title.toLowerCase());
    if (exists) {
      this.presentToast('Ya existe una tarea con ese título.', 'warning');
      return;
    }

    await this.taskService.addTask(title, this.selectedCategoryId, Date.now());
    this.presentToast('Tarea agregada con éxito.', 'success');

    this.newTaskTitle = '';
    this.selectedCategoryId = '';
    await this.loadTasks();
  }

  // Confirmación al completar tarea
  async confirmToggleComplete(task: Task) {
    const alert = await this.alertController.create({
      header: task.completed ? 'Marcar como completada' : 'Marcar como pendiente',
      buttons: [
        {
          text: 'Cancelar',
          handler: async () => {
            task.completed = !task.completed;
            await this.taskService.updateTask(task);
          }
        },
        {
          text: 'Sí',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  // Confirmación para eliminar tarea
  async confirmDeleteTask(taskId: string) {
    const alert = await this.alertController.create({
      header: 'Eliminar tarea',
      message: '¿Estás seguro de que deseas eliminar esta tarea?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.taskService.deleteTask(taskId);
            await this.loadTasks();
          }
        }
      ]
    });
    await alert.present();
  }

  // Obtener nombre de categoría por ID
  getCategoryName(categoryId?: string): string {
    const category = this.categories.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Sin categoría';
  }

  // Aplicar filtros y ordenamiento
  applyFilter() {
    let tasks = [...this.tasks];

    if (this.selectedFilterId) {
      tasks = tasks.filter(task => task.categoryId === this.selectedFilterId);
    }

    switch (this.sortOption) {
      case 'date_asc':
        tasks.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        break;
      case 'date_desc':
        tasks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
      case 'pending_first':
        tasks.sort((a, b) => Number(a.completed) - Number(b.completed));
        break;
      case 'completed_first':
        tasks.sort((a, b) => Number(b.completed) - Number(a.completed));
        break;
    }

    this.filteredTasks = tasks;
  }

  // Agregar nueva categoría
  async addCategory() {
    const name = this.newCategoryName.trim();
    if (!name) {
      this.presentToast('El nombre de la categoría no puede estar vacío.', 'danger');
      return;
    }

    const exists = this.categories.some(
      c => c.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      this.presentToast('Ya existe una categoría con ese nombre.', 'warning');
      return;
    }

    await this.categoryService.addCategory(name);
    this.presentToast('Categoría creada con éxito.', 'success');
    this.newCategoryName = '';
    await this.loadCategories();
  }

  // Confirmación para eliminar categoría
  async confirmDeleteCategory(categoryId: string) {
    const alert = await this.alertController.create({
      header: 'Eliminar categoría',
      message: '¿Estás seguro de que deseas eliminar esta categoría?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.categoryService.deleteCategory(categoryId);
            if (this.selectedCategoryId === categoryId) this.selectedCategoryId = '';
            if (this.selectedFilterId === categoryId) this.selectedFilterId = '';
            await this.loadCategories();
            await this.loadTasks();
          }
        }
      ]
    });
    await alert.present();
  }

  // Empezar edición de tarea
  startEdit(task: Task) {
    this.editingTaskId = task.id;
    this.editingTaskTitle = task.title;
    this.editingCategoryId = task.categoryId || '';
  }

  // Cancelar edición
  cancelEdit() {
    this.editingTaskId = null;
    this.editingTaskTitle = '';
    this.editingCategoryId = '';
  }

  // Guardar tarea editada
  async saveEdit(task: Task) {
    const title = this.editingTaskTitle.trim();
    if (!title) {
      this.presentToast('El título editado no puede estar vacío.', 'danger');
      return;
    }

    const isDuplicate = this.tasks.some(
      t => t.id !== task.id && t.title.toLowerCase() === title.toLowerCase()
    );

    if (isDuplicate) {
      this.presentToast('Ya existe otra tarea con ese título.', 'warning');
      return;
    }

    const updatedTask: Task = {
      ...task,
      title,
      categoryId: this.editingCategoryId,
    };

    await this.taskService.updateTask(updatedTask);
    this.presentToast('Tarea actualizada con éxito.', 'success');
    this.cancelEdit();
    await this.loadTasks();
  }

  // Configuración inicial de Remote Config de Firebase
  initializeRemoteConfig() {
    console.log('🟢 Iniciando configuración de Remote Config');
    (this.remoteConfig as any).defaultConfig = {
      show_categories: true
    };

    this.remoteConfig.settings = {
      minimumFetchIntervalMillis: 0
    } as any;

    this.remoteConfig.fetchAndActivate()
      .then(() => {
        console.log('🟢 fetchAndActivate completado');
        return this.remoteConfig.getBoolean('show_categories');
      })
      .then((value: boolean) => {
        console.log('🟡 Valor de show_categories:', value);
        this.remoteConfigEnabled = value;
      })
      .catch((err) => {
        console.error('Error con Remote Config:', err);
        this.remoteConfigEnabled = true;
      });
  }

  // Eliminar todas las tareas
  async deleteAllTasks() {
    await this.taskService.deleteAllTasks();
    this.presentToast('Todas las tareas fueron eliminadas.', 'success');
    await this.loadTasks();
  }

  // Contador de tareas completadas
  get completedCount(): number {
    return this.tasks.filter(t => t.completed).length;
  }

  // Contador de tareas pendientes
  get pendingCount(): number {
    return this.tasks.filter(t => !t.completed).length;
  }

  // Limpiar filtro de categoría
  clearFilter() {
    this.selectedFilterId = '';
    this.applyFilter();
  }

  // Mostrar mensaje flotante
  async presentToast(message: string, color: 'success' | 'warning' | 'danger' = 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
