export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  userId: string;
  columns: Column[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  members?: string[];
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
  position: number;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
  color?: string;
  maxTasks?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  boardId: string;
  position: number;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  assigneeId?: string;
  labels?: string[];
  attachments?: Attachment[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'link';
  size?: number;
  uploadedAt: Date;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
}

// Component Props Interfaces
export interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onLongPress: (task: Task) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export interface BoardColumnProps {
  column: Column;
  onTaskMove: (taskId: string, fromColumnId: string, toColumnId: string, newPosition: number) => void;
  onAddTask: (columnId: string, taskData: Partial<Task>) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  isDropZone: boolean;
}

export interface BoardScreenProps {
  navigation: any;
  route: any;
}

// Firebase Types
export interface FirebaseBoard {
  id: string;
  title: string;
  description?: string;
  userId: string;
  isPublic: boolean;
  members?: string[];
  createdAt: any;
  updatedAt: any;
}

export interface FirebaseColumn {
  id: string;
  title: string;
  boardId: string;
  position: number;
  color?: string;
  maxTasks?: number;
  createdAt: any;
  updatedAt: any;
}

export interface FirebaseTask {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  boardId: string;
  position: number;
  dueDate?: any;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  assigneeId?: string;
  labels?: string[];
  attachments?: FirebaseAttachment[];
  createdAt: any;
  updatedAt: any;
  completedAt?: any;
}

export interface FirebaseAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'link';
  size?: number;
  uploadedAt: any;
}

// Hook Return Types
export interface UseFirebaseTasksReturn {
  boards: Board[];
  loading: boolean;
  error: string | null;
  addBoard: (boardData: Partial<Board>) => Promise<void>;
  updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  addColumn: (boardId: string, columnData: Partial<Column>) => Promise<void>;
  updateColumn: (columnId: string, updates: Partial<Column>) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  addTask: (columnId: string, taskData: Partial<Task>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, fromColumnId: string, toColumnId: string, newPosition: number) => Promise<void>;
  reorderTasks: (columnId: string, taskIds: string[]) => Promise<void>;
}

// Context Types
export interface BoardContextType {
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;
  setCurrentBoard: (board: Board | null) => void;
  refreshBoards: () => Promise<void>;
  addBoard: (boardData: Partial<Board>) => Promise<void>;
  updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  addColumn: (boardId: string, columnData: Partial<Column>) => Promise<void>;
  updateColumn: (columnId: string, updates: Partial<Column>) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  addTask: (columnId: string, taskData: Partial<Task>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, fromColumnId: string, toColumnId: string, newPosition: number) => Promise<void>;
  reorderTasks: (columnId: string, taskIds: string[]) => Promise<void>;
}

// Navigation Types
export interface RootStackParamList {
  Home: undefined;
  Board: { boardId: string };
  CreateBoard: undefined;
  EditBoard: { board: Board };
  CreateTask: { columnId: string; boardId: string };
  EditTask: { task: Task };
  Profile: undefined;
  Settings: undefined;
} 