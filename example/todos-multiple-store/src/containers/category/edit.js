import san from 'san';
import {defineComponent, template, components, onAttached, method} from 'san-composition';
import {useState, useAction} from '@use';
import ColorPicker from '../../components/ColorPicker.san';
import catgoryStore from '../../store/category';
import './style.less';;

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
    const categories = useState(catgoryStore, 'categories', 'categories');
    useAction(catgoryStore, 'fetchCategories', 'list');
    useAction(catgoryStore, 'startRmCategory');
    useAction(catgoryStore, 'startEditCategory');
    method({
        rm: function (index) {
            let category = this.data.get('categories')[index];
            context.component.startRmCategory(category.id);
        },
    
        edit: function (index) {
            let category = this.data.get('categories')[index];
            context.component.startEditCategory(category);
        }
    })
    onAttached(() => {
        context.component.list();
    });
}, san);
