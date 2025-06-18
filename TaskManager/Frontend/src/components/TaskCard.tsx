import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
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
import { TaskCardProps, Task } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/globalStyles';

const { width: screenWidth } = Dimensions.get('window');

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onLongPress,
  isDragging,
  onDragStart,
  onDragEnd,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  
  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Gesture handler for drag and drop
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
      runOnJS(onDragStart)();
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + event.translationY;
      
      // Add rotation effect during drag
      rotation.value = interpolate(
        event.translationX,
        [-100, 0, 100],
        [-0.1, 0, 0.1],
        Extrapolate.CLAMP
      );
      
      // Scale up slightly during drag
      scale.value = withSpring(1.05, { damping: 15, stiffness: 150 });
    },
    onEnd: () => {
      // Reset position with spring animation
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      rotation.value = withSpring(0, { damping: 15, stiffness: 150 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      runOnJS(onDragEnd)();
    },
  });

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotateZ: `${rotation.value}rad` },
      ],
      opacity: opacity.value,
      zIndex: isDragging ? 1000 : 1,
    };
  });

  const pressedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(isPressed ? 0.98 : 1, { duration: 150 }) }],
    };
  });

  // Priority color mapping
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return colors.priorityHigh;
      case 'medium':
        return colors.priorityMedium;
      case 'low':
        return colors.priorityLow;
      default:
        return colors.priorityMedium;
    }
  };

  // Format due date
  const formatDueDate = (date?: Date) => {
    if (!date) return null;
    
    const now = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Overdue', color: colors.error };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: colors.warning };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: colors.warning };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, color: colors.info };
    } else {
      return { text: dueDate.toLocaleDateString(), color: colors.textSecondary };
    }
  };

  const dueDateInfo = formatDueDate(task.dueDate);

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, animatedStyle, pressedStyle]}>
        <TouchableOpacity
          style={[
            styles.card,
            isDragging && styles.dragging,
            { borderLeftColor: getPriorityColor(task.priority) },
          ]}
          onPress={() => onPress(task)}
          onLongPress={() => onLongPress(task)}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          activeOpacity={0.8}
        >
          {/* Task Header */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {task.title}
            </Text>
            
            {/* Priority Badge */}
            <View style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(task.priority) + '20' }
            ]}>
              <Text style={[
                styles.priorityText,
                { color: getPriorityColor(task.priority) }
              ]}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Text>
            </View>
          </View>

          {/* Task Description */}
          {task.description && (
            <Text style={styles.description} numberOfLines={3}>
              {task.description}
            </Text>
          )}

          {/* Task Footer */}
          <View style={styles.footer}>
            {/* Due Date */}
            {dueDateInfo && (
              <View style={styles.dueDateContainer}>
                <Text style={[styles.dueDateText, { color: dueDateInfo.color }]}>
                  {dueDateInfo.text}
                </Text>
              </View>
            )}

            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
              <View style={styles.labelsContainer}>
                {task.labels.slice(0, 2).map((label, index) => (
                  <View key={index} style={styles.label}>
                    <Text style={styles.labelText}>{label}</Text>
                  </View>
                ))}
                {task.labels.length > 2 && (
                  <View style={styles.label}>
                    <Text style={styles.labelText}>+{task.labels.length - 2}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <View style={styles.attachmentsContainer}>
                <Text style={styles.attachmentsText}>
                  📎 {task.attachments.length}
                </Text>
              </View>
            )}
          </View>

          {/* Status Indicator */}
          <View style={[
            styles.statusIndicator,
            { backgroundColor: getPriorityColor(task.priority) }
          ]} />
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
    width: '100%',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    minHeight: 80,
    ...shadows.md,
  },
  dragging: {
    ...shadows.xl,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
    lineHeight: typography.fontSize.base * 1.3,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    minWidth: 50,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    fontWeight: '600',
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * 1.4,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  dueDateContainer: {
    flex: 1,
  },
  dueDateText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: spacing.sm,
  },
  label: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  labelText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.medium,
  },
  attachmentsContainer: {
    marginLeft: spacing.sm,
  },
  attachmentsText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  statusIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default TaskCard; 