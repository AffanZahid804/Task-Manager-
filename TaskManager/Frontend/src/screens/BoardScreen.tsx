import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { BoardScreenProps, Board, Column, Task } from '../types';
import { colors, typography, spacing, borderRadius, shadows, layout } from '../styles/globalStyles';
import { useBoardContext } from '../context/BoardContext';
import BoardColumn from '../components/BoardColumn';
import TaskCard from '../components/TaskCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BoardScreen: React.FC<BoardScreenProps> = ({ navigation, route }) => {
  const { boardId } = route.params || {};
  const {
    boards,
    currentBoard,
    loading,
    error,
    setCurrentBoard,
    refreshBoards,
    addColumn,
    updateColumn,
    deleteColumn,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
  } = useBoardContext();

  const [refreshing, setRefreshing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<Column | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  
  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Find the current board
  const board = currentBoard || boards.find(b => b.id === boardId);

  // Set current board when component mounts
  useEffect(() => {
    if (board && !currentBoard) {
      setCurrentBoard(board);
    }
  }, [board, currentBoard, setCurrentBoard]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshBoards();
    } catch (error) {
      console.error('Error refreshing boards:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshBoards]);

  // Handle adding new column
  const handleAddColumn = useCallback(() => {
    Alert.prompt(
      'Add Column',
      'Enter column title:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (title) => {
            if (title && title.trim()) {
              const newColumn: Partial<Column> = {
                title: title.trim(),
                boardId: board?.id || '',
                position: board?.columns.length || 0,
                color: '#3b82f6',
                maxTasks: 10,
              };
              addColumn(board?.id || '', newColumn);
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  }, [board, addColumn]);

  // Handle editing column
  const handleEditColumn = useCallback((column: Column) => {
    Alert.prompt(
      'Edit Column',
      'Enter new column title:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: (title) => {
            if (title && title.trim()) {
              updateColumn(column.id, { title: title.trim() });
            }
          },
        },
      ],
      'plain-text',
      column.title,
      'default'
    );
  }, [updateColumn]);

  // Handle deleting column
  const handleDeleteColumn = useCallback((column: Column) => {
    Alert.alert(
      'Delete Column',
      `Are you sure you want to delete "${column.title}"? This will also delete all tasks in this column.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteColumn(column.id),
        },
      ]
    );
  }, [deleteColumn]);

  // Handle adding task
  const handleAddTask = useCallback((columnId: string, taskData: Partial<Task>) => {
    addTask(columnId, taskData);
  }, [addTask]);

  // Handle editing task
  const handleEditTask = useCallback((task: Task) => {
    // Navigate to task edit screen or show modal
    Alert.alert(
      'Edit Task',
      'Task editing functionality would be implemented here',
      [
        { text: 'OK' },
      ]
    );
  }, []);

  // Handle deleting task
  const handleDeleteTask = useCallback((taskId: string) => {
    deleteTask(taskId);
  }, [deleteTask]);

  // Handle moving task
  const handleMoveTask = useCallback((
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    newPosition: number
  ) => {
    moveTask(taskId, fromColumnId, toColumnId, newPosition);
  }, [moveTask]);

  // Handle reordering tasks
  const handleReorderTasks = useCallback((columnId: string, taskIds: string[]) => {
    reorderTasks(columnId, taskIds);
  }, [reorderTasks]);

  // Drag and drop gesture handler
  const dragGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
      runOnJS(setIsDragging)(true);
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + event.translationY;
      
      // Add rotation effect during drag
      const rotation = interpolate(
        event.translationX,
        [-100, 0, 100],
        [-0.1, 0, 0.1],
        Extrapolate.CLAMP
      );
      
      scale.value = withSpring(1.05, { damping: 15, stiffness: 150 });
    },
    onEnd: () => {
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      runOnJS(setIsDragging)(false);
      runOnJS(setDraggedTask)(null);
    },
  });

  // Animated styles for dragged item
  const draggedItemStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
      zIndex: isDragging ? 1000 : 1,
    };
  });

  // Render column item
  const renderColumn = useCallback(({ item: column, index }: { item: Column; index: number }) => {
    return (
      <BoardColumn
        column={column}
        onTaskMove={handleMoveTask}
        onAddTask={handleAddTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        isDropZone={isDragging}
      />
    );
  }, [handleMoveTask, handleAddTask, handleEditTask, handleDeleteTask, isDragging]);

  // Render empty state
  const renderEmptyState = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>Loading board...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!board || board.columns.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No columns yet</Text>
          <Text style={styles.emptySubtext}>Add a column to get started</Text>
          <TouchableOpacity style={styles.addColumnButton} onPress={handleAddColumn}>
            <Text style={styles.addColumnButtonText}>+ Add Column</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  }, [loading, error, board, handleRefresh, handleAddColumn]);

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: Column) => item.id, []);

  // Get item layout for FlatList optimization
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: layout.columnWidth + spacing.md * 2,
    offset: (layout.columnWidth + spacing.md * 2) * index,
    index,
  }), []);

  if (!board) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>Board not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{board.title}</Text>
            {board.description && (
              <Text style={styles.subtitle}>{board.description}</Text>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.addColumnButton}
            onPress={handleAddColumn}
          >
            <Text style={styles.addColumnButtonText}>+ Column</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Board Content */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={board.columns}
          renderItem={renderColumn}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          getItemLayout={getItemLayout}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={3}
        />
      </KeyboardAvoidingView>

      {/* Dragged Task Overlay */}
      {isDragging && draggedTask && (
        <Animated.View style={[styles.draggedTaskOverlay, draggedItemStyle]}>
          <TaskCard
            task={draggedTask}
            onPress={() => {}}
            onLongPress={() => {}}
            isDragging={true}
            onDragStart={() => {}}
            onDragEnd={() => {}}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  addColumnButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  addColumnButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.textInverse,
    fontFamily: typography.fontFamily.medium,
  },
  content: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.base,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  retryButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.textInverse,
    fontFamily: typography.fontFamily.medium,
  },
  draggedTaskOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1000,
  },
});

export default BoardScreen; 