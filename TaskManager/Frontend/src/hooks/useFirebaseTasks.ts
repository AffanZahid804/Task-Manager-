import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { db, collections } from '../../../Backend/firebaseConfig';
import { 
  Board, 
  Column, 
  Task, 
  FirebaseBoard, 
  FirebaseColumn, 
  FirebaseTask,
  UseFirebaseTasksReturn 
} from '../types';

// Convert Firebase timestamp to Date
const convertTimestamp = (timestamp: Timestamp | null): Date | undefined => {
  return timestamp ? timestamp.toDate() : undefined;
};

// Convert Date to Firebase timestamp
const convertToTimestamp = (date: Date | undefined): Timestamp | null => {
  return date ? Timestamp.fromDate(date) : null;
};

// Convert Firebase document to Board
const convertFirebaseBoard = (doc: DocumentSnapshot<DocumentData>): Board => {
  const data = doc.data() as FirebaseBoard;
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    userId: data.userId,
    columns: [], // Will be populated separately
    createdAt: convertTimestamp(data.createdAt) || new Date(),
    updatedAt: convertTimestamp(data.updatedAt) || new Date(),
    isPublic: data.isPublic || false,
    members: data.members || [],
  };
};

// Convert Firebase document to Column
const convertFirebaseColumn = (doc: DocumentSnapshot<DocumentData>): Column => {
  const data = doc.data() as FirebaseColumn;
  return {
    id: doc.id,
    title: data.title,
    boardId: data.boardId,
    position: data.position,
    tasks: [], // Will be populated separately
    createdAt: convertTimestamp(data.createdAt) || new Date(),
    updatedAt: convertTimestamp(data.updatedAt) || new Date(),
    color: data.color,
    maxTasks: data.maxTasks,
  };
};

// Convert Firebase document to Task
const convertFirebaseTask = (doc: DocumentSnapshot<DocumentData>): Task => {
  const data = doc.data() as FirebaseTask;
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    columnId: data.columnId,
    boardId: data.boardId,
    position: data.position,
    dueDate: convertTimestamp(data.dueDate),
    priority: data.priority || 'medium',
    status: data.status || 'todo',
    assigneeId: data.assigneeId,
    labels: data.labels || [],
    attachments: data.attachments || [],
    createdAt: convertTimestamp(data.createdAt) || new Date(),
    updatedAt: convertTimestamp(data.updatedAt) || new Date(),
    completedAt: convertTimestamp(data.completedAt),
  };
};

// Convert Board to Firebase document
const convertBoardToFirebase = (board: Partial<Board>): Partial<FirebaseBoard> => {
  return {
    title: board.title,
    description: board.description,
    userId: board.userId,
    isPublic: board.isPublic || false,
    members: board.members || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
};

// Convert Column to Firebase document
const convertColumnToFirebase = (column: Partial<Column>): Partial<FirebaseColumn> => {
  return {
    title: column.title,
    boardId: column.boardId,
    position: column.position || 0,
    color: column.color,
    maxTasks: column.maxTasks,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
};

// Convert Task to Firebase document
const convertTaskToFirebase = (task: Partial<Task>): Partial<FirebaseTask> => {
  return {
    title: task.title,
    description: task.description,
    columnId: task.columnId,
    boardId: task.boardId,
    position: task.position || 0,
    dueDate: task.dueDate ? convertToTimestamp(task.dueDate) : null,
    priority: task.priority || 'medium',
    status: task.status || 'todo',
    assigneeId: task.assigneeId,
    labels: task.labels || [],
    attachments: task.attachments || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: task.completedAt ? convertToTimestamp(task.completedAt) : null,
  };
};

export const useFirebaseTasks = (userId?: string): UseFirebaseTasksReturn => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all boards for a user
  const fetchBoards = useCallback(async (): Promise<Board[]> => {
    if (!userId) return [];

    try {
      const boardsQuery = query(
        collection(db, collections.BOARDS),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(boardsQuery);
      const boardsData: Board[] = [];

      for (const boardDoc of querySnapshot.docs) {
        const board = convertFirebaseBoard(boardDoc);
        
        // Fetch columns for this board
        const columnsQuery = query(
          collection(db, collections.COLUMNS),
          where('boardId', '==', board.id),
          orderBy('position', 'asc')
        );
        
        const columnsSnapshot = await getDocs(columnsQuery);
        const columns: Column[] = [];

        for (const columnDoc of columnsSnapshot.docs) {
          const column = convertFirebaseColumn(columnDoc);
          
          // Fetch tasks for this column
          const tasksQuery = query(
            collection(db, collections.TASKS),
            where('columnId', '==', column.id),
            orderBy('position', 'asc')
          );
          
          const tasksSnapshot = await getDocs(tasksQuery);
          const tasks: Task[] = tasksSnapshot.docs.map(doc => convertFirebaseTask(doc));
          
          column.tasks = tasks;
          columns.push(column);
        }
        
        board.columns = columns;
        boardsData.push(board);
      }

      return boardsData;
    } catch (err) {
      console.error('Error fetching boards:', err);
      throw new Error('Failed to fetch boards');
    }
  }, [userId]);

  // Real-time listener for boards
  useEffect(() => {
    if (!userId) {
      setBoards([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      query(
        collection(db, collections.BOARDS),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      ),
      async (snapshot) => {
        try {
          const boardsData: Board[] = [];

          for (const boardDoc of snapshot.docs) {
            const board = convertFirebaseBoard(boardDoc);
            
            // Fetch columns for this board
            const columnsQuery = query(
              collection(db, collections.COLUMNS),
              where('boardId', '==', board.id),
              orderBy('position', 'asc')
            );
            
            const columnsSnapshot = await getDocs(columnsQuery);
            const columns: Column[] = [];

            for (const columnDoc of columnsSnapshot.docs) {
              const column = convertFirebaseColumn(columnDoc);
              
              // Fetch tasks for this column
              const tasksQuery = query(
                collection(db, collections.TASKS),
                where('columnId', '==', column.id),
                orderBy('position', 'asc')
              );
              
              const tasksSnapshot = await getDocs(tasksQuery);
              const tasks: Task[] = tasksSnapshot.docs.map(doc => convertFirebaseTask(doc));
              
              column.tasks = tasks;
              columns.push(column);
            }
            
            board.columns = columns;
            boardsData.push(board);
          }

          setBoards(boardsData);
          setLoading(false);
        } catch (err) {
          console.error('Error in real-time listener:', err);
          setError('Failed to fetch boards in real-time');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in real-time listener:', err);
        setError('Failed to listen to boards changes');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Add a new board
  const addBoard = useCallback(async (boardData: Partial<Board>): Promise<void> => {
    if (!userId) throw new Error('User ID is required');

    try {
      const firebaseBoard = convertBoardToFirebase({ ...boardData, userId });
      await addDoc(collection(db, collections.BOARDS), firebaseBoard);
    } catch (err) {
      console.error('Error adding board:', err);
      throw new Error('Failed to add board');
    }
  }, [userId]);

  // Update a board
  const updateBoard = useCallback(async (boardId: string, updates: Partial<Board>): Promise<void> => {
    try {
      const boardRef = doc(db, collections.BOARDS, boardId);
      const firebaseUpdates = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(boardRef, firebaseUpdates);
    } catch (err) {
      console.error('Error updating board:', err);
      throw new Error('Failed to update board');
    }
  }, []);

  // Delete a board
  const deleteBoard = useCallback(async (boardId: string): Promise<void> => {
    try {
      const batch = writeBatch(db);
      
      // Delete all tasks in the board
      const tasksQuery = query(
        collection(db, collections.TASKS),
        where('boardId', '==', boardId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      tasksSnapshot.docs.forEach(taskDoc => {
        batch.delete(taskDoc.ref);
      });

      // Delete all columns in the board
      const columnsQuery = query(
        collection(db, collections.COLUMNS),
        where('boardId', '==', boardId)
      );
      const columnsSnapshot = await getDocs(columnsQuery);
      columnsSnapshot.docs.forEach(columnDoc => {
        batch.delete(columnDoc.ref);
      });

      // Delete the board
      const boardRef = doc(db, collections.BOARDS, boardId);
      batch.delete(boardRef);

      await batch.commit();
    } catch (err) {
      console.error('Error deleting board:', err);
      throw new Error('Failed to delete board');
    }
  }, []);

  // Add a new column
  const addColumn = useCallback(async (boardId: string, columnData: Partial<Column>): Promise<void> => {
    try {
      const firebaseColumn = convertColumnToFirebase({ ...columnData, boardId });
      await addDoc(collection(db, collections.COLUMNS), firebaseColumn);
    } catch (err) {
      console.error('Error adding column:', err);
      throw new Error('Failed to add column');
    }
  }, []);

  // Update a column
  const updateColumn = useCallback(async (columnId: string, updates: Partial<Column>): Promise<void> => {
    try {
      const columnRef = doc(db, collections.COLUMNS, columnId);
      const firebaseUpdates = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(columnRef, firebaseUpdates);
    } catch (err) {
      console.error('Error updating column:', err);
      throw new Error('Failed to update column');
    }
  }, []);

  // Delete a column
  const deleteColumn = useCallback(async (columnId: string): Promise<void> => {
    try {
      const batch = writeBatch(db);
      
      // Delete all tasks in the column
      const tasksQuery = query(
        collection(db, collections.TASKS),
        where('columnId', '==', columnId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      tasksSnapshot.docs.forEach(taskDoc => {
        batch.delete(taskDoc.ref);
      });

      // Delete the column
      const columnRef = doc(db, collections.COLUMNS, columnId);
      batch.delete(columnRef);

      await batch.commit();
    } catch (err) {
      console.error('Error deleting column:', err);
      throw new Error('Failed to delete column');
    }
  }, []);

  // Add a new task
  const addTask = useCallback(async (columnId: string, taskData: Partial<Task>): Promise<void> => {
    try {
      // Get the column to determine boardId
      const columnRef = doc(db, collections.COLUMNS, columnId);
      const columnDoc = await getDoc(columnRef);
      
      if (!columnDoc.exists()) {
        throw new Error('Column not found');
      }

      const columnData = columnDoc.data() as FirebaseColumn;
      const firebaseTask = convertTaskToFirebase({ 
        ...taskData, 
        columnId, 
        boardId: columnData.boardId 
      });
      
      await addDoc(collection(db, collections.TASKS), firebaseTask);
    } catch (err) {
      console.error('Error adding task:', err);
      throw new Error('Failed to add task');
    }
  }, []);

  // Update a task
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>): Promise<void> => {
    try {
      const taskRef = doc(db, collections.TASKS, taskId);
      const firebaseUpdates = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(taskRef, firebaseUpdates);
    } catch (err) {
      console.error('Error updating task:', err);
      throw new Error('Failed to update task');
    }
  }, []);

  // Delete a task
  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    try {
      const taskRef = doc(db, collections.TASKS, taskId);
      await deleteDoc(taskRef);
    } catch (err) {
      console.error('Error deleting task:', err);
      throw new Error('Failed to delete task');
    }
  }, []);

  // Move a task between columns
  const moveTask = useCallback(async (
    taskId: string, 
    fromColumnId: string, 
    toColumnId: string, 
    newPosition: number
  ): Promise<void> => {
    try {
      const taskRef = doc(db, collections.TASKS, taskId);
      const updates = {
        columnId: toColumnId,
        position: newPosition,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(taskRef, updates);
    } catch (err) {
      console.error('Error moving task:', err);
      throw new Error('Failed to move task');
    }
  }, []);

  // Reorder tasks within a column
  const reorderTasks = useCallback(async (columnId: string, taskIds: string[]): Promise<void> => {
    try {
      const batch = writeBatch(db);
      
      taskIds.forEach((taskId, index) => {
        const taskRef = doc(db, collections.TASKS, taskId);
        batch.update(taskRef, {
          position: index,
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (err) {
      console.error('Error reordering tasks:', err);
      throw new Error('Failed to reorder tasks');
    }
  }, []);

  return {
    boards,
    loading,
    error,
    addBoard,
    updateBoard,
    deleteBoard,
    addColumn,
    updateColumn,
    deleteColumn,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
  };
}; 