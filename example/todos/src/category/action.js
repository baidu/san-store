import { store } from 'san-store'
import { updateBuilder } from 'san-update'
import service from '../service'


store.addActions({
    fetchCategories(payload, {getState, dispatch}) {
        if (!getState('categories')) {
            return service.categories().then(categories => {
                dispatch('fillCategories', categories);
            });
        }
    },

    fillCategories(categories) {
        return updateBuilder().set('categories', categories);
    },

    startRmCategory(id, {getState, dispatch}) {
        return service.rmCategory(id).then(categoryId => {
            let categories = getState('categories');

            let index = -1;
            categories.forEach((item, i) => {
                if (item.id === categoryId) {
                    index = i;
                }
            });

            if (index >= 0) {
                dispatch('rmCategory', index);
            }
        });
    },

    rmCategory(index) {
        return updateBuilder().splice('categories', index, 1);
    },

    startEditCategory(category, {getState, dispatch}) {
        return service.editCategory(category).then(editedCategory => {
            let categories = getState('categories');

            let index = -1;
            categories.forEach((item, i) => {
                if (item.id === editedCategory.id) {
                    index = i;
                }
            });

            if (index >= 0) {
                dispatch('editCategory', {index, category: editedCategory});
            }
        });
    },

    editCategory(payload) {
        return updateBuilder().set('categories[' + payload.index + ']', payload.category);
    },

    startAddCategory() {
        return updateBuilder()
            .set('addingCategory', {
                title: '',
                color: ''
            })
            .set('addingCategoryFinished', false);
    },

    submitAddCategory(category, {dispatch}) {
        return service.addCategory(category).then(addedCategory => {
            dispatch('addCategory', addedCategory);
        });
    },

    addCategory(category) {
        return updateBuilder()
            .push('categories', category)
            .set('addingCategoryFinished', true);
    }

});
