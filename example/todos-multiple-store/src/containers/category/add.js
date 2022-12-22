import san from 'san';
import {defineComponent, template, components, onAttached, method} from 'san-composition';
import {useState, useAction} from 'san-store/use';
import ColorPicker from '../../components/ColorPicker.san';
import catgoryStore from '../../store/category';
import './style.less';

export default defineComponent(context => {
    template(`
        <div class="form">
            <input
                value="{= title =}"
                type="text"
                placeholder="分类"
                class="form-title"
            >
            <ui-colorpicker value="{= color =}"/>
            <div class="form-op">
                <button
                    type="button"
                    class="form-ok"
                    on-click="submit"
                >
                    <i class="fa fa-check-circle-o"></i>
                </button>
                <button
                    type="button"
                    class="form-cancel"
                    on-click="cancel"
                >
                    <i class="fa fa-times-circle-o"></i>
                </button>
            </div>
        </div>
    `);
    components({'ui-colorpicker': ColorPicker});
    const title = useState(catgoryStore, 'addingCategory.title', 'title');
    const color = useState(catgoryStore, 'addingCategory.color', 'color');
    useState(catgoryStore, 'addingCategoryFinished', 'finished');
    let startAddCategory = useAction(catgoryStore, 'startAddCategory');
    let submitAddCategory = useAction(catgoryStore, 'submitAddCategory');
    method({
        submit: () => {
            let t = title.get();
            if (!t) {
                return;
            }

            submitAddCategory({
                title: t,
                color: color.get()
            });
        },

        cancel: () => {
            context.component.finish();
        },

        finish: () => {
            startAddCategory();
            context.component.fire('finished');

            if (!context.data.get('inDialog')) {
                history.go(-1);
            }
        }

    });
    onAttached(() => {
        startAddCategory();

        context.component.watch('finished', value => {
            if (value) {
                context.component.finish();
            }
        });
    });

}, san);
