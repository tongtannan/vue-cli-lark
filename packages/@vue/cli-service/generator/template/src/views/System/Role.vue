<template>
  <div class="first-page">
    <el-table-package
      :propTable="propTable"
      @emitOperation="emitOperation"
      ref="childTable"
    >
      <template #createTime="{item}">{{
        changeTime(item.createTime)
      }}</template>
      <template #modifyTime="{item}">{{
        changeTime(item.modifyTime)
      }}</template>
      <template #formEnd>
        <el-form :model="formObj" :rules="rules" ref="slotForm">
          <el-form-item label="模块:" label-width="120px" prop="module">
            <el-tree
              :data="data"
              show-checkbox
              default-expand-all
              node-key="id"
              ref="tree"
              highlight-current
            ></el-tree>
          </el-form-item>
        </el-form>
      </template>
    </el-table-package>
    <el-dialog
      width="50%"
      :title="dialogTitle"
      :visible.sync="dialogTableVisible"
    >
      <div class="el-table-package">
        <div class="form-page">
          <el-form :model="formObj" :rules="rules" ref="defaultForm">
            <el-form-item label="角色名称:" label-width="120px" prop="roleName">
              <el-input
                v-model="formObj.roleName"
                autocomplete="off"
                clearable
              ></el-input>
            </el-form-item>

            <el-form-item
              label="描述信息:"
              label-width="120px"
              prop="description"
            >
              <el-input
                type="textarea"
                :rows="2"
                placeholder="描述信息"
                v-model="formObj.description"
              ></el-input>
            </el-form-item>

            <el-form-item label="模块:" label-width="120px" prop="module">
              <el-tree
                :data="data"
                show-checkbox
                default-expand-all
                node-key="id"
                ref="tree"
                highlight-current
              ></el-tree>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogTableVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { changeTime, deepClone } from '@/utils/common';
import CommonInterface from '@/utils/interface';

const NewInterface = new CommonInterface();
export default {
  data() {
    return {
      dialogTitle: '',
      dialogTableVisible: false,
      data: [],
      defaultTree: [],
      formObj: {
        roleName: '',
        description: '',
        tree: ''
      },
      rowFun: '',
      props: {
        label: 'moduleName',
        children: 'children'
      }
    };
  },
  created() {
    this.getTree();
  },
  methods: {
    // 按钮点击操作
    emitOperation({ row, rowFun }) {
      this.dialogTableVisible = true;
      this.rowFun = rowFun;
      switch (rowFun) {
        case 'new':
          this.dialogTitle = '新建';
          this.$nextTick(() => {
            // this.getTree();
            this.$refs.tree.setCheckedKeys([]);
            this.formObj = { roleName: '', description: '', tree: '' };
          });
          break;
        case 'modify':
          this.dialogTitle = '修改';
          // this.getTree();
          this.formObj = deepClone(row);
          this.setCheckedNodes();
          break;
        default:
          break;
      }
    },
    getTree() {
      //调用获取所有模块列表数据
      NewInterface.get('/module/queryAll').then(res => {
        this.data = res.data.map(item => {
          const { id, moduleName, childModuleList, pid } = item;
          const children = childModuleList
            ? childModuleList.map(child => ({
                id: child.id,
                label: child.moduleName
              }))
            : [];
          return {
            id,
            pid,
            label: moduleName,
            children
          };
        });
        //如果是修改则给tree设置默认值
        if (this.rowFun === 'modify') {
          this.setCheckedNodes();
        }
      });
    },
    // 弹框确定按钮
    handleSubmit() {
      // 判断新增或修改
      const result = this.$refs.tree.getCheckedNodes().map(item => item.id);
      this.formObj.modules = result;
      const parentId = [];
      for (const id of result) {
        for (const child of this.data) {
          const son = child.children.find(item => item.id === id);
          if (son && son.id) {
            const childId = child.id;
            if (!parentId.includes(childId) && !result.includes(childId)) {
              parentId.push(childId);
            }
          }
        }
      }
      console.log(parentId);
      this.formObj.modules = Array.from(new Set([...result, ...parentId]));
      const url = this.rowFun === 'new' ? '/roles/insert' : '/roles/update';
      NewInterface.formPost(url, this.formObj, true).then(res => {
        if (res.code === '200') {
          console.log('result' + res);
          this.dialogTableVisible = false;
          this.$refs.childTable.init();
        }
      });
    },

    //模块树形图
    getCheckedNodes() {
      console.log(this.$refs.tree.getCheckedNodes());
    },
    getCheckedKeys() {
      console.log(this.$refs.tree.getCheckedKeys());
    },
    setCheckedNodes() {
      //调用获取所有模块列表数据
      NewInterface.get(
        '/roles/queryJoinModuleById?roleId=' + this.formObj.id
      ).then(res => {
        if (res.code === '200') {
          this.defaultTree = [];
          const resModules = res.data.modules;
          if (resModules && resModules.length) {
            resModules.map(item => {
              const { pid, id, moduleName } = item;
              if (pid) {
                let modules = { id: id, label: moduleName };
                this.defaultTree.push(modules);
              }
            });
          }
          this.$nextTick(() => {
            this.$refs.tree.setCheckedNodes(this.defaultTree);
          });
        }
      });
    },
    setCheckedKeys() {
      this.$refs.tree.setCheckedKeys([3]);
    },
    resetChecked() {
      this.$refs.tree.setCheckedKeys([]);
    }
  },
  beforeCreate() {
    this['rules'] = {
      roleName: [
        { required: true, message: '请填写角色名称', trigger: 'blur' }
      ],
      description: [
        { required: true, message: '请填写角色描述', trigger: 'blur' }
      ]
    };
    this['changeTime'] = changeTime;
    //规则校验
    const validateRoleName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('角色名称不能为空'));
      } else {
        callback();
      }
    };
    const validateDescription = (rule, value, callback) => {
      if (!value) {
        callback(new Error('描述信息不能为空'));
      } else {
        callback();
      }
    };
    this['propTable'] = {
      title: '角色列表', // table标题
      noLoadInit: false, // 初始化是否加载数据
      hidePage: false, // 不需要分页
      initSrc: '/roles/queryList', // 初始化table接口地址
      initMethod: 'get', // 初始化table接口method,默认get
      initProp: 'list', // 数据属性 res[initProp]
      pageTotalProp: 'total', // 分页总数prop
      rebuildData: null, // 数据重构 --- data void
      deleteMethod: 'formPost', // 删除接口method
      deleteSrc: '/roles/deleteById', // 删除操作接口地址
      dialogMethod: 'formPost', // 新建删除method,默认put
      dialogNewSrc: '/roles/insert', // 新建接口地址
      dialogModifySrc: '/roles/update', // 修改接口地址
      objectSpanMethod: null, // 合并单元格
      loading: true, // 加载中动画
      hasShowSummary: false, // 是否显示表位合计行
      rowClassName: null, // 特殊行classname --- row, rowIndex
      border: false, // 是否带有纵向边框,拖拽功能需设置为true
      isDefaultHandles: true, // 是否显示默认新建/删除操作
      isSelection: false, // 是否显示多选框
      hasSelect: false, // 有无选中功能
      hasExpand: false, // 有无展开行功能
      isDefaultDialog: false, // 使用默认新建/修改弹框
      formLabelWidth: '120px', // 弹框表单label宽度
      emptyObj: {
        agencyId: 1
      },
      rules: {
        roleName: [
          {
            required: true,
            message: '请填写角色名称',
            validator: validateRoleName,
            trigger: 'blur'
          }
        ],
        description: [
          {
            required: true,
            message: '请填写角色描述',
            validator: validateDescription,
            trigger: 'blur'
          }
        ]
      }, // 弹框表单rules
      tr: [
        // 表头数据
        // className --- 列的class名
        // fixed固定 --- true, left, right
        // sortable排序 ---  true, false, 'custom'
        // tooltip ---  true, false
        // resizable是否可以通过拖动改变宽度 -- 默认true
        // headerAlign表头对齐方式 --- left/center/right
        // align表格对齐方式 --- left/center/right
        // type表单类型 --- input datetime switch select 默认input
        // inputType input类型 --- textarea number
        // select 下拉框数据请求地址 ---url label value
        // disModify 修改的时候禁止修改
        // isNoForm 该属性是否不生成表单form
        // isSelect 根据该属性生成搜索选项
        {
          label: '角色名称',
          prop: 'roleName',
          className: 'classname',
          show: true,
          disModify: true,
          align: 'center',
          type: 'input',
          isSelect: true
        },
        {
          label: '描述',
          prop: 'description',
          className: 'classname',
          show: true,
          align: 'center',
          type: 'input',
          inputType: 'textarea'
        },
        {
          label: '创建时间',
          prop: 'createTime',
          className: 'classname',
          show: 'template',
          align: 'center',
          isNoForm: true
        },
        {
          label: '修改时间',
          prop: 'modifyTime',
          className: 'classname',
          show: 'template',
          align: 'center',
          type: 'input',
          isNoForm: true
        }
      ],
      data: [], // 表格数据 如需添加行class,处理数据时则需要传入class名数组
      hasOperation: true, // 有无操作功能
      operation: {
        // 操作功能
        label: '操作', // 操作列的行首文字
        width: '320', // 操作列的宽度
        className: 'operation', // 操作列的class名
        data: [
          // 操作列数据
          // Fun --- defaultModify  defaultDelete
          {
            label: '修改', // 按钮文字
            Fun: 'defaultModify', // 点击按钮后触发的父组件事件
            size: 'mini', // 按钮大小
            classname: 'show-modify',
            icon: 'el-icon-edit', // 按钮的类名
            type: 'danger', // 按钮颜色
            show: {
              fn: val => {
                return ![1].includes(val.id);
              }
            }
          },
          {
            label: '删除', // 按钮文字
            Fun: 'defaultDelete', // 点击按钮后触发的父事件
            size: 'mini', // 按钮大小
            classname: 'show-delete',
            icon: 'el-icon-delete',
            show: {
              fn: val => {
                return ![1, 2, 3, 4].includes(val.id);
              }
            }
          }
        ]
      }
    };
  }
};
</script>
