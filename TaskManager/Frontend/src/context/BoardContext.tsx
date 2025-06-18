import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { 
  Board, 
  Task, 
  Column, 
  BoardContextType 
} from '../types';

// Action types for the reducer
type BoardAction =
  | { type: 'SET_BOARDS'; payload: Board[] }
  | { type: 'SET_CURRENT_BOARD'; payload: Board | null }
  | { type: 'ADD_BOARD'; payload: Board }
  | { type: 'UPDATE_BOARD'; payload: { boardId: string; updates: Partial<Board> } }
  | { type: 'DELETE_BOARD'; payload: string }
  | { type: 'ADD_COLUMN'; payload: { boardId: string; column: Column } }
  | { type: 'UPDATE_COLUMN'; payload: { columnId: string; updates: Partial<Column> } }
  | { type: 'DELETE_COLUMN'; payload: { boardId: string; columnId: string } }
  | { type: 'ADD_TASK'; payload: { columnId: string; task: Task } }
  | { type: 'UPDATE_TASK'; payload: { taskId: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: { columnId: string; taskId: string } }
  | { type: 'MOVE_TASK'; payload: { taskId: string; fromColumnId: string; toColumnId: string; newPosition: number } }
  | { type: 'REORDER_TASKS'; payload: { columnId: string; taskIds: string[] } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// Initial state
interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;
}

const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
};

// Reducer function
const boardReducer = (state: BoardState, action: BoardAction): BoardState => {
  switch (action.type) {
    case 'SET_BOARDS':
      return {
        ...state,
        boards: action.payload,
        loading: false,
        error: null,
      };

    case 'SET_CURRENT_BOARD':
      return {
        ...state,
        currentBoard: action.payload,
      };

    case 'ADD_BOARD':
      return {
        ...state,
        boards: [action.payload, ...state.boards],
      };

    case 'UPDATE_BOARD':
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.payload.boardId
            ? { ...board, ...action.payload.updates }
            : board
        ),
        currentBoard: state.currentBoard?.id === action.payload.boardId
          ? { ...state.currentBoard, ...action.payload.updates }
          : state.currentBoard,
      };

    case 'DELETE_BOARD':
      return {
        ...state,
        boards: state.boards.filter(board => board.id !== action.payload),
        currentBoard: state.currentBoard?.id === action.payload ? null : state.currentBoard,
      };

    case 'ADD_COLUMN':
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.payload.boardId
            ? { ...board, columns: [...board.columns, action.payload.column] }
            : board
        ),
        currentBoard: state.currentBoard?.id === action.payload.boardId
          ? { ...state.currentBoard, columns: [...state.currentBoard.columns, action.payload.column] }
          : state.currentBoard,
      };

    case 'UPDATE_COLUMN':
      return {
        ...state,
        boards: state.boards.map(board => ({
          ...board,
          columns: board.columns.map(column =>
            column.id === action.payload.columnId
              ? { ...column, ...action.payload.updates }
              : column
          ),
        })),
        currentBoard: state.currentBoard ? {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(column =>
            column.id === action.payload.columnId
              ? { ...column, ...action.payload.updates }
              : column
          ),
        } : null,
      };

    case 'DELETE_COLUMN':
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.payload.boardId
            ? { ...board, columns: board.columns.filter(col => col.id !== action.payload.columnId) }
            : board
        ),
        currentBoard: state.currentBoard?.id === action.payload.boardId
          ? { ...state.currentBoard, columns: state.currentBoard.columns.filter(col => col.id !== action.payload.columnId) }
          : state.currentBoard,
      };

    case 'ADD_TASK':
      return {
        ...state,
        boards: state.boards.map(board => ({
          ...board,
          columns: board.columns.map(column =>
            column.id === action.payload.columnId
              ? { ...column, tasks: [...column.tasks, action.payload.task] }
              : column
          ),
        })),
        currentBoard: state.currentBoard ? {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(column =>
            column.id === action.payload.columnId
              ? { ...column, tasks: [...column.tasks, action.payload.task] }
              : column
          ),
        } : null,
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        boards: state.boards.map(board => ({
          ...board,
          columns: board.columns.map(column => ({
            ...column,
            tasks: column.tasks.map(task =>
              task.id === action.payload.taskId
                ? { ...task, ...action.payload.updates }
                : task
            ),
          })),
        })),
        currentBoard: state.currentBoard ? {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(column => ({
            ...column,
            tasks: column.tasks.map(task =>
              task.id === action.payload.taskId
                ? { ...task, ...action.payload.updates }
                : task
            ),
          })),
        } : null,
      };

    case 'DELETE_TASK':
      return {
        ...state,
        boards: state.boards.map(board => ({
          ...board,
          columns: board.columns.map(column =>
            column.id === action.payload.columnId
              ? { ...column, tasks: column.tasks.filter(task => task.id !== action.payload.taskId) }
              : column
          ),
        })),
        currentBoard: state.currentBoard ? {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(column =>
            column.id === action.payload.columnId
              ? { ...column, tasks: column.tasks.filter(task => task.id !== action.payload.taskId) }
              : column
          ),
        } : null,
      };

    case 'MOVE_TASK':
      return {
        ...state,
        boards: state.boards.map(board => {
          let movedTask: Task | null = null;
          
          // Remove task from source column
          const updatedColumns = board.columns.map(column => {
            if (column.id === action.payload.fromColumnId) {
              const taskIndex = column.tasks.findIndex(task => task.id === action.payload.taskId);
              if (taskIndex !== -1) {
                movedTask = { ...column.tasks[taskIndex] };
                return {
                  ...column,
                  tasks: column.tasks.filter(task => task.id !== action.payload.taskId),
                };
              }
            }
            return column;
          });

          // Add task to destination column
          if (movedTask) {
            const updatedTask = {
              ...movedTask,
              columnId: action.payload.toColumnId,
              position: action.payload.newPosition,
            };

            return {
              ...board,
              columns: updatedColumns.map(column =>
                column.id === action.payload.toColumnId
                  ? { ...column, tasks: [...column.tasks, updatedTask] }
                  : column
              ),
            };
          }

          return board;
        }),
        currentBoard: state.currentBoard ? {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(column => {
            if (column.id === action.payload.fromColumnId) {
              return {
                ...column,
                tasks: column.tasks.filter(task => task.id !== action.payload.taskId),
              };
            }
            if (column.id === action.payload.toColumnId) {
              const movedTask = state.currentBoard.columns
                .find(col => col.id === action.payload.fromColumnId)
                ?.tasks.find(task => task.id === action.payload.taskId);
              
              if (movedTask) {
                const updatedTask = {
                  ...movedTask,
                  columnId: action.payload.toColumnId,
                  position: action.payload.newPosition,
                };
                return { ...column, tasks: [...column.tasks, updatedTask] };
              }
            }
            return column;
          }),
        } : null,
      };

    case 'REORDER_TASKS':
      return {
        ...state,
        boards: state.boards.map(board => ({
          ...board,
          columns: board.columns.map(column =>
            column.id === action.payload.columnId
              ? {
                  ...column,
                  tasks: action.payload.taskIds.map((taskId, index) => {
                    const task = column.tasks.find(t => t.id === taskId);
                    return task ? { ...task, position: index } : task!;
                  }).filter(Boolean),
                }
              : column
          ),
        })),
        currentBoard: state.currentBoard ? {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(column =>
            column.id === action.payload.columnId
              ? {
                  ...column,
                  tasks: action.payload.taskIds.map((taskId, index) => {
                    const task = column.tasks.find(t => t.id === taskId);
                    return task ? { ...task, position: index } : task!;
                  }).filter(Boolean),
                }
              : column
          ),
        } : null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const BoardContext = createContext<BoardContextType | undefined>(undefined);

// Provider component
interface BoardProviderProps {
  children: ReactNode;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  const setCurrentBoard = useCallback((board: Board | null) => {
    dispatch({ type: 'SET_CURRENT_BOARD', payload: board });
  }, []);

  const refreshBoards = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    // This would typically call the Firebase hook
    // For now, we'll just clear the loading state
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const addBoard = useCallback(async (boardData: Partial<Board>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // This would typically call the Firebase hook
      const newBoard: Board = {
        id: Date.now().toString(), // Temporary ID
        title: boardData.title || '',
        description: boardData.description,
        userId: boardData.userId || '',
        columns: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: boardData.isPublic || false,
        members: boardData.members || [],
      };
      dispatch({ type: 'ADD_BOARD', payload: newBoard });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add board' });
    }
  }, []);

  const updateBoard = useCallback(async (boardId: string, updates: Partial<Board>) => {
    dispatch({ type: 'UPDATE_BOARD', payload: { boardId, updates } });
  }, []);

  const deleteBoard = useCallback(async (boardId: string) => {
    dispatch({ type: 'DELETE_BOARD', payload: boardId });
  }, []);

  const addColumn = useCallback(async (boardId: string, columnData: Partial<Column>) => {
    const newColumn: Column = {
      id: Date.now().toString(), // Temporary ID
      title: columnData.title || '',
      boardId,
      position: columnData.position || 0,
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      color: columnData.color,
      maxTasks: columnData.maxTasks,
    };
    dispatch({ type: 'ADD_COLUMN', payload: { boardId, column: newColumn } });
  }, []);

  const updateColumn = useCallback(async (columnId: string, updates: Partial<Column>) => {
    dispatch({ type: 'UPDATE_COLUMN', payload: { columnId, updates } });
  }, []);

  const deleteColumn = useCallback(async (columnId: string) => {
    const board = state.boards.find(b => b.columns.some(c => c.id === columnId));
    if (board) {
      dispatch({ type: 'DELETE_COLUMN', payload: { boardId: board.id, columnId } });
    }
  }, [state.boards]);

  const addTask = useCallback(async (columnId: string, taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(), // Temporary ID
      title: taskData.title || '',
      description: taskData.description,
      columnId,
      boardId: taskData.boardId || '',
      position: taskData.position || 0,
      dueDate: taskData.dueDate,
      priority: taskData.priority || 'medium',
      status: taskData.status || 'todo',
      assigneeId: taskData.assigneeId,
      labels: taskData.labels || [],
      attachments: taskData.attachments || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: taskData.completedAt,
    };
    dispatch({ type: 'ADD_TASK', payload: { columnId, task: newTask } });
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { taskId, updates } });
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    const column = state.boards
      .flatMap(b => b.columns)
      .find(c => c.tasks.some(t => t.id === taskId));
    
    if (column) {
      dispatch({ type: 'DELETE_TASK', payload: { columnId: column.id, taskId } });
    }
  }, [state.boards]);

  const moveTask = useCallback(async (
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    newPosition: number
  ) => {
    dispatch({
      type: 'MOVE_TASK',
      payload: { taskId, fromColumnId, toColumnId, newPosition },
    });
  }, []);

  const reorderTasks = useCallback(async (columnId: string, taskIds: string[]) => {
    dispatch({ type: 'REORDER_TASKS', payload: { columnId, taskIds } });
  }, []);

  const value: BoardContextType = {
    boards: state.boards,
    currentBoard: state.currentBoard,
    loading: state.loading,
    error: state.error,
    setCurrentBoard,
    refreshBoards,
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

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
};

// Custom hook to use the context
export const useBoardContext = (): BoardContextType => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
}; 