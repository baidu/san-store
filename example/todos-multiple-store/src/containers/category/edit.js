import san from 'san';
import {defineComponent, template, components, onAttached, method} from 'san-composition';
import {useState, useAction} from 'san-store/use';
import ColorPicker from '../../components/ColorPicker.san';
import catgoryStore from '../../store/category';
import './style.less';

;

export default defineComponent(() => {
    template(`
        <ul class="edit-category-list">
            <li s-for="item, index in categories">
                <input
                    value="{= item.title =}"
                    type="text"
                    class="form-title"
                >
                <ui-colorpicker value="{= item.color =}"/>
                <i class="fa fa-check" on-click="edit(index)"></i>
                <i class="fa fa-trash" on-click="rm(index)"></i>
            </li>
        </ul>
    `);
    components({'ui-colorpicker': ColorPicker});
    useState(catgoryStore, 'categories', 'categories');
    let getList = useAction(catgoryStore, 'fetchCategories', 'list');
    let startRm = useAction(catgoryStore, 'startRmCategory');
    let startEdit = useAction(catgoryStore, 'startEditCategory');
    method({
        rm: function (index) {
            let category = this.data.get('categories')[index];
            startRm(category.id);
        },

        edit: function (index) {
            let category = this.data.get('categories')[index];
            startEdit(category);
        }
    });
    onAttached(() => {
        getList();
    });
}, san);
