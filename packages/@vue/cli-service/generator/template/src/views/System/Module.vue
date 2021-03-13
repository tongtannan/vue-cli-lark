<template>
  <div class="first-page">
    <el-table-package :propTable="propTable">
      <template #createTime="{item}">
        {{ changeTime(item.createTime) }}
      </template>
      <template #modifyTime="{item}">
        {{ changeTime(item.modifyTime) }}
      </template>

      <template #pid="{item}">{{ treeData[item.pid] }}</template>
    </el-table-package>
  </div>
</template>

<script>
import { changeTime } from '@/utils/common';
import Interface from '@/utils/interface';
const NewInterface = new Interface();
export default {
  data() {
    return {
      treeData: {},
      value: ''
    };
  },
  created() {
    NewInterface.get('/module/queryAll', {}, false).then(res => {
      const { code } = res;
      if (code === '200') {
        const objPids = Object.create(null);
        for (const val of res.data) {
          const { id, moduleName } = val;
          if ((id || id === 0) && !objPids[id]) {
            objPids[id] = moduleName;
          }
        }
        objPids['0'] = 'root';
        this.treeData = objPids;
      }
    });
  },
  beforeCreate() {
    this['changeTime'] = changeTime;
    //规则校验
    const validateUserName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('角色名称不能为空为空'));
      } else {
        callback();
      }
    };

    this['propTable'] = {
      title: '模块列表', // table标题
      noLoadInit: false, // 初始化是否加载数据
      hidePage: false, // 不需要分页
      initSrc: '/module/queryList', // 初始化table接口地址
      initMethod: 'get', // 初始化table接口method,默认get
      initProp: 'list', // 数据属性 res[initProp]
      pageTotalProp: 'total', // 分页总数prop
      rebuildData: null, // 数据重构 --- data void
      deleteMethod: 'formPost', // 删除接口method
      deleteSrc: '/module/deleteById', // 删除操作接口地址
      dialogMethod: 'formPost', // 新建删除method,默认put
      dialogNewSrc: '/module/insert', // 新建接口地址
      dialogModifySrc: '/module/update', // 修改接口地址
      objectSpanMethod: null, // 合并单元格
      loading: true, // 加载中动画
      hasShowSummary: false, // 是否显示表位合计行
      rowClassName: null, // 特殊行classname --- row, rowIndex
      border: false, // 是否带有纵向边框,拖拽功能需设置为true
      isDefaultHandles: true, // 是否显示默认新建/删除操作
      isSelection: false, // 是否显示多选框
      hasSelect: false, // 有无选中功能
      hasExpand: false, // 有无展开行功能
      isDefaultDialog: true, // 使用默认新建/修改弹框
      formLabelWidth: '120px', // 弹框表单label宽度
      emptyObj: {
        agencyId: 1
      },
      rules: {
        moduleName: [
          { required: true, message: '请填写模块名称', trigger: 'blur' }
        ],
        pid: [
          {
            required: true,
            message: '请选择管理模块',
            trigger: 'change'
          }
        ],
        moduleUrl: [
          {
            required: true,
            validator: validateUserName,
            trigger: 'blur'
          }
        ],
        sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
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
          label: '模块名称',
          prop: 'moduleName',
          className: 'moduleName',
          show: true,
          disModify: true,
          align: 'center',
          type: 'input',
          isSelect: true
        },
        {
          label: '模块地址',
          prop: 'moduleUrl',
          className: 'moduleUrl',
          show: true,
          align: 'center',
          inputType: 'input'
        },
        {
          label: '图标',
          prop: 'lcon',
          className: 'lcon',
          show: true,
          align: 'center',
          type: 'select',
          isIcon: true,
          select: {
            options: [
              {
                iconName: '管理',
                iconClass: 'el-icon-s-management'
              },
              {
                iconName: '菜单',
                iconClass: 'el-icon-menu'
              },
              {
                iconName: '用户',
                iconClass: 'el-icon-s-custom'
              },
              {
                iconName: '信息',
                iconClass: 'el-icon-message'
              },
              {
                iconName: '设置',
                iconClass: 'el-icon-setting'
              },
              {
                iconName: '文件',
                iconClass: 'el-icon-folder'
              },
              {
                iconName: '列表',
                iconClass: 'el-icon-s-grid'
              },
              {
                iconName: '操作',
                iconClass: 'el-icon-s-operation'
              },
              {
                iconName: '开始',
                iconClass: 'el-icon-s-home'
              }
            ],
            label: 'iconClass',
            value: 'iconClass'
          }
        },
        {
          label: '上级模块',
          prop: 'pid',
          className: 'pid',
          show: 'template',
          align: 'center',
          // inputType: "input"
          type: 'select',
          select: {
            rebuildData: val => {
              let rootNode = {
                id: 0,
                moduleName: 'root',
                moduleUrl: '',
                lcon: '',
                pid: '',
                sort: 0
              };
              val.push(rootNode);
              return val;
            },
            url: '/module/queryAll',
            options: [],
            label: 'moduleName',
            value: 'id'
          }
        },
        {
          label: '排序',
          prop: 'sort',
          className: 'classname',
          show: true,
          align: 'center',
          type: 'input',
          isNoForm: false
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
            type: 'danger' // 按钮颜色
          },
          {
            label: '删除', // 按钮文字
            Fun: 'defaultDelete', // 点击按钮后触发的父事件
            size: 'mini', // 按钮大小
            classname: 'show-delete',
            icon: 'el-icon-delete'
          }
        ]
      }
    };
  },
  methods: {
    transverterFun(pid) {
      console.log('begin');
      console.log(this.treeData);
      console.log(pid);
      console.log('end');
    }
  }
};
</script>
