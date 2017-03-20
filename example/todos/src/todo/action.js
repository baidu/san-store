import { store } from 'san-store'
import { updateBuilder } from 'san-update'
import service from '../service'

store.addActions({
    fetchTodos(category, {getState, dispatch}) {
        dispatch('updateCategoryFilter', category);

        return service.todos(category).then(todos => {
            if (getState('todosCategoryFilter') === category) {
                dispatch('fillTodos', todos);
            }
        });
    },

    fillTodos(todos) {
        return updateBuilder().set('todos', todos);
    },

    updateCategoryFilter(category) {
        return updateBuilder().set('todosCategoryFilter', category);
    },

    startRmTodo(id, {getState, dispatch}) {
        return service.rmTodo(id).then(todoId => {
            let todos = getState('todos');
            let index = -1;
            todos.forEach((item, i) => {
                if (todoId == item.id) {
                    index = i;
                }
            });

            if (index >= 0) {
                dispatch('rmTodo', index);
            }
        });
    },

    rmTodo(index) {
        return updateBuilder().splice('todos', index, 1);
    },

    startDoneTodo(id, {getState, dispatch}) {
        return service.doneTodo(id).then(todoId => {
            let todos = getState('todos');
            let index = -1;
            todos.forEach((item, i) => {
                if (todoId == item.id) {
                    index = i;
                }
            });

            if (index >= 0) {
                dispatch('doneTodo', index);
            }
        });
    },

    doneTodo(index) {
        return updateBuilder().set('todos[' + index + '].done', true);
    },

    startEditTodo(id, {dispatch}) {
        dispatch('finishEditTodoState', false);

        if (!id) {
            let now = new Date();
            dispatch('updateEditingTodo', {
                id: 0,
                title: '',
                desc: '',
                endTime: now.getTime(),
                categoryId: null,
                done: false
            });
        }
        else {
            return service.todo(id).then(todo => {
                dispatch('updateEditingTodo', todo);
            });
        }
    },

    updateEditingTodo(todo) {
        return updateBuilder()
            .set('editingTodo', todo)
            .set('editingTodoFinished', false);
    },

    submitEditTodo(todo, {dispatch}) {
        let id = todo.id;
        return service[id ? 'editTodo' : 'addTodo'](todo).then(() => {
            dispatch('finishEditTodoState', true);
        });
    },


    finishEditTodoState(state) {
        return updateBuilder()
            .set('editingTodo', null)
            .set('editingTodoFinished', state);
    }
});
