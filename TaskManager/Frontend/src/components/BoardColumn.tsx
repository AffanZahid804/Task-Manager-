import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
import { BoardColumnProps, Column, Task } from '../types';
import { colors, typography, spacing, borderRadius, shadows, layout } from '../styles/globalStyles';
import TaskCard from './TaskCard';

const BoardColumn: React.FC<BoardColumnProps> = ({
  column,
  onTaskMove,
  onAddTask,
  onEditTask,
  onDeleteTask,
  isDropZone,
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isDropTarget, setIsDropTarget] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation values
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(colors.surface);
  const borderColor = useSharedValue(colors.border);

  // Handle adding new task
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const newTask: Partial<Task> = {
      title: newTaskTitle.trim(),
      description: '',
      columnId: column.id,
      boardId: column.boardId,
      position: column.tasks.length,
      priority: 'medium',
      status: 'todo',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onAddTask(column.id, newTask);
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  // Handle cancel adding task
  const handleCancelAddTask = () => {
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  // Handle task press
  const handleTaskPress = (task: Task) => {
    onEditTask(task);
  };

  // Handle task long press
  const handleTaskLongPress = (task: Task) => {
    Alert.alert(
      'Task Options',
      'What would you like to do with this task?',
      [
        { text: 'Edit', onPress: () => onEditTask(task) },
        { 
          text: 'Delete', 
          onPress: () => {
            Alert.alert(
              'Delete Task',
              'Are you sure you want to delete this task?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDeleteTask(task.id) },
              ]
            );
          },
          style: 'destructive'
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Drop zone gesture handler
  const dropZoneGestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      backgroundColor.value = withTiming(colors.surfaceVariant, { duration: 200 });
      borderColor.value = withTiming(colors.primary, { duration: 200 });
    },
    onActive: (event) => {
      // Check if the gesture is within the drop zone
      if (event.absoluteY > 0 && event.absoluteY < layout.screenHeight) {
        setIsDropTarget(true);
        scale.value = withSpring(1.02, { damping: 15, stiffness: 150 });
      } else {
        setIsDropTarget(false);
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }
    },
    onEnd: () => {
      backgroundColor.value = withTiming(colors.surface, { duration: 200 });
      borderColor.value = withTiming(colors.border, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      runOnJS(setIsDropTarget)(false);
    },
  });

  // Animated styles for drop zone
  const dropZoneAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: backgroundColor.value,
      borderColor: borderColor.value,
    };
  });

  // Calculate column height based on content
  const columnHeight = Math.max(
    layout.screenHeight * 0.6,
    column.tasks.length * 120 + 200 // Approximate height for tasks + header + add button
  );

  return (
    <View style={[styles.container, { width: layout.columnWidth }]}>
      {/* Column Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{column.title}</Text>
          <View style={styles.taskCount}>
            <Text style={styles.taskCountText}>{column.tasks.length}</Text>
          </View>
        </View>
        
        {column.maxTasks && (
          <Text style={styles.maxTasksText}>
            Max: {column.maxTasks}
          </Text>
        )}
      </View>

      {/* Column Content */}
      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <PanGestureHandler onGestureEvent={dropZoneGestureHandler}>
          <Animated.View style={[
            styles.dropZone,
            dropZoneAnimatedStyle,
            isDropTarget && styles.dropTarget,
            { minHeight: columnHeight }
          ]}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {/* Tasks */}
              {column.tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onPress={handleTaskPress}
                  onLongPress={handleTaskLongPress}
                  isDragging={false}
                  onDragStart={() => {}}
                  onDragEnd={() => {}}
                />
              ))}

              {/* Add Task Input */}
              {isAddingTask && (
                <View style={styles.addTaskInputContainer}>
                  <TextInput
                    style={styles.addTaskInput}
                    placeholder="Enter task title..."
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                    autoFocus={true}
                    multiline={false}
                    maxLength={100}
                    onSubmitEditing={handleAddTask}
                    returnKeyType="done"
                  />
                  <View style={styles.addTaskButtons}>
                    <TouchableOpacity
                      style={[styles.addTaskButton, styles.addTaskButtonPrimary]}
                      onPress={handleAddTask}
                    >
                      <Text style={styles.addTaskButtonText}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.addTaskButton, styles.addTaskButtonSecondary]}
                      onPress={handleCancelAddTask}
                    >
                      <Text style={[styles.addTaskButtonText, styles.addTaskButtonTextSecondary]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Empty State */}
              {column.tasks.length === 0 && !isAddingTask && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No tasks yet
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    Add a task to get started
                  </Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </PanGestureHandler>
      </KeyboardAvoidingView>

      {/* Add Task Button */}
      {!isAddingTask && (!column.maxTasks || column.tasks.length < column.maxTasks) && (
        <TouchableOpacity
          style={styles.addTaskButton}
          onPress={() => setIsAddingTask(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.addTaskButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      )}

      {/* Max Tasks Warning */}
      {column.maxTasks && column.tasks.length >= column.maxTasks && (
        <View style={styles.maxTasksWarning}>
          <Text style={styles.maxTasksWarningText}>
            Column is full ({column.tasks.length}/{column.maxTasks})
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.sm,
    ...shadows.md,
    maxHeight: layout.screenHeight * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  taskCount: {
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 24,
    alignItems: 'center',
  },
  taskCountText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  maxTasksText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.medium,
  },
  contentContainer: {
    flex: 1,
  },
  dropZone: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    margin: spacing.sm,
  },
  dropTarget: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.sm,
    paddingBottom: spacing.lg,
  },
  addTaskInputContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addTaskInput: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.regular,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  addTaskButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  addTaskButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  addTaskButtonPrimary: {
    backgroundColor: colors.primary,
  },
  addTaskButtonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addTaskButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textInverse,
  },
  addTaskButtonTextSecondary: {
    color: colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.medium,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  maxTasksWarning: {
    padding: spacing.sm,
    backgroundColor: colors.warning + '20',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  maxTasksWarningText: {
    fontSize: typography.fontSize.xs,
    color: colors.warning,
    textAlign: 'center',
    fontFamily: typography.fontFamily.medium,
  },
});

export default BoardColumn; 