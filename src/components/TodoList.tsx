import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem, { TreeItemProps } from '@mui/lab/TreeItem';
import Typography from '@mui/material/Typography';
import { Box, Checkbox, Grid, Fab, Button } from '@mui/material';
import Todo from '../types/Todo';
import { CustomTree } from './CustomTree';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateTodoModal from './CreateTodoModal';

export default function TodoList() {
  const [todos, setTodos] = React.useState<Todo[]>([
    {
      id: '1',
      name: 'Купить продукты',
      text: 'Купить продукты',
      completed: false,
      children: [
        {
          id: '2',
          name: 'Купить хлеб',
          completed: false,
          text: 'Купить батон и ржаной хлеб.',
        },
        {
          id: '3',
          name: 'Купить молочные продукты',
          completed: false,
          text: 'молоко, сметана, сливки ',
        },
      ],
    },
    {
      id: '4',
      name: 'Уборка',
      completed: false,
      text: 'Уборка в доме',
      children: [
        {
          id: '5',
          name: 'Пропылесосить',
          completed: false,
          text: 'Пропылесосить',
        },
        {
          id: '6',
          name: 'Протереть пыль',
          completed: false,
          text: 'Протереть пыль на всех полках и протереть пыль на компьютере.',
        },
      ],
    },
  ]);

  const [openModal, setOpenModal] = React.useState(false);

  const [currentTodo, setCurrentTodo] = React.useState<Todo | null>(null);

  const CustomTreeItem = (props: TreeItemProps) => (
    <TreeItem ContentComponent={CustomTree} {...props} />
  );

  const handleAddTodo = () => {
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const handleSaveTodo = (newTodoName: string, newTodoText: string, parentId: string | null) => {
    const newTodo: Todo = {
      id: generateUniqueId(),
      name: newTodoName,
      text: newTodoText,
      completed: false,
      children: [],
    };

    const updateSubtask = (tasks: Todo[], taskId: string, subtask: Todo): Todo[] => {
      return tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            children: task.children ? [...task.children, subtask] : [subtask],
          };
        } else if (task.children) {
          return {
            ...task,
            children: updateSubtask(task.children, taskId, subtask),
          };
        }
        return task;
      });
    };

    setTodos((prevTodos) => {
      if (parentId) {
        return updateSubtask(prevTodos, parentId, newTodo);
      } else {
        return [...prevTodos, newTodo];
      }
    });

    setOpenModal(false);
  };

  const generateUniqueId = (): string => {
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${random}`;
  };

  const deleteCompletedTodos = (todos: Todo[]) => {
    return todos.filter((todo: Todo) => {
      if (todo.completed) {
        // Удаляем текущую задачу, если она завершена
        return false;
      }
      if (Array.isArray(todo.children)) {
        // Рекурсивно вызываем функцию для проверки подзадач
        todo.children = deleteCompletedTodos(todo.children);
      }
      // Сохраняем текущую задачу в списке
      return true;
    });
  };

  const handleDeleteCompletedTodos = () => {
    setTodos((prevTodos) => deleteCompletedTodos(prevTodos));
  };

  const handleCheckboxClick = (e: React.MouseEvent<HTMLButtonElement>, todoId: string) => {
    e.stopPropagation();
    const updatedTodos = toggleTodoCompleted(todos, todoId);
    setTodos(updatedTodos);
  };

  React.useEffect(() => {
    console.log(todos);
  }, [todos]);

  const toggleTodoCompleted = (todos: Todo[], todoId: string): Todo[] => {
    return todos.map((todo) => {
      if (todo.id === todoId) {
        const updatedTodo = {
          ...todo,
          completed: !todo.completed,
        };
        if (Array.isArray(todo.children)) {
          updatedTodo.children = toggleChildrenCompleted(todo.children, updatedTodo.completed);
        }
        return updatedTodo;
      } else if (Array.isArray(todo.children)) {
        const updatedChildren = toggleTodoCompleted(todo.children, todoId);
        return {
          ...todo,
          children: updatedChildren,
        };
      }
      return todo;
    });
  };

  const toggleChildrenCompleted = (children: Todo[], completed: boolean): Todo[] => {
    return children.map((child) => {
      const updatedChild = {
        ...child,
        completed,
      };
      if (Array.isArray(child.children)) {
        updatedChild.children = toggleChildrenCompleted(child.children, completed);
      }
      return updatedChild;
    });
  };

  const renderTree = (todos: Todo[]) =>
    todos.map((todo) => (
      <CustomTreeItem
        key={todo.id}
        nodeId={todo.id}
        label={
          <div
            onClick={() => setCurrentTodo(todo)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingRight: '10px',
            }}>
            <span>{todo.name}</span>
            <Checkbox onClick={(e) => handleCheckboxClick(e, todo.id)} checked={todo.completed} />
          </div>
        }>
        {Array.isArray(todo.children) ? renderTree(todo.children) : null}
      </CustomTreeItem>
    ));

  return (
    <Box display="flex" justifyContent="center" height="auto">
      <Grid container sx={{ display: 'flex', alignItems: 'stretch' }}>
        <Grid
          item
          xs={4}
          sx={{
            overflowY: 'hidden',
            backgroundColor: '#FFFFFF',
            paddingBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
          <Box p={2}>
            <TreeView
              aria-label="rich object"
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpanded={['root']}
              defaultExpandIcon={<ChevronRightIcon />}
              sx={{
                height: 'auto',
                flexGrow: 1,
                maxWidth: 400,
                overflow: 'hidden',
                marginRight: '10px',
              }}>
              {renderTree(todos)}
            </TreeView>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
            <Fab color="primary" size="small" aria-label="add" onClick={handleAddTodo}>
              <AddIcon fontSize="small" />
            </Fab>
            <Fab color="error" size="small" aria-label="add" onClick={handleDeleteCompletedTodos}>
              <DeleteIcon fontSize="small" />
            </Fab>
            <Button
              variant="outlined"
              disabled={!currentTodo}
              sx={{ textTransform: 'none' }}
              onClick={handleAddTodo}>
              Добавить подзадачу
            </Button>
          </Box>
          <CreateTodoModal
            open={openModal}
            onClose={handleModalClose}
            onSave={handleSaveTodo}
            parentId={currentTodo?.id || null}
          />
        </Grid>
        <Grid item xs={8}>
          <Box
            p={2}
            sx={{ backgroundColor: '#DCE0E1', height: '70vh', overflowWrap: 'break-word' }}>
            <Typography variant="h5" component="h2" gutterBottom fontSize={'32px'}>
              {currentTodo?.name}
            </Typography>
            <Box height="100%">
              <p>{currentTodo?.text}</p>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
