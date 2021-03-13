<template>
  <div class="first-page">
    <el-table-package :propTable="propTable">
      <template #status="{item}"> {{ statusList[item.status] }} </template>
    </el-table-package>
  </div>
</template>

<script>
export default {
  beforeCreate() {
    this['textList'] = ['首页', '数据字典'];
    this['statusList'] = {
      1: '有效',
      0: '无效'
    };
    this['propTable'] = {
      title: '操作员列表', // table标题
      noLoadInit: false, // 初始化是否加载数据
      hidePage: false, // 不需要分页
      initSrc: '/dictionary/queryList', // 初始化table接口地址
      initMethod: 'get', // 初始化table接口method,默认get
      initProp: 'list', // 数据属性 res[initProp]
      pageTotalProp: 'total', // 分页总数prop
      rebuildData: null, // 数据重构 -&#45;&#45; data void
      deleteMethod: 'formPost', // 删除接口method
      deleteSrc: '/dictionary/deleteById', // 删除操作接口地址
      dialogMethod: 'formPost', // 新建删除method,默认put
      dialogNewSrc: '/dictionary/insert', // 新建接口地址
      dialogModifySrc: '/dictionary/update', // 修改接口地址
      objectSpanMethod: null, // 合并单元格
      loading: false, // 加载中动画
      hasShowSummary: false, // 是否显示表位合计行
      rowClassName: null, // 特殊行classname -&#45;&#45; row, rowIndex
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
        dicType: [
          { required: true, message: '请填写真实姓名', trigger: 'blur' }
        ],
        dicCode: [
          { required: true, message: '请填写字典编码', trigger: 'blur' }
        ],
        dicName: [
          { required: true, message: '请填写字典名称', trigger: 'blur' }
        ],
        status: [{ required: true, message: '请选择状态', trigger: 'blur' }]
      }, // 弹框表单rules
      tr: [
        // 表头数据
        // className -&#45;&#45; 列的class名
        // fixed固定 -&#45;&#45; true, left, right
        // sortable排序 -&#45;&#45;  true, false, 'custom'
        // tooltip -&#45;&#45;  true, false
        // resizable是否可以通过拖动改变宽度 &#45;&#45; 默认true
        // headerAlign表头对齐方式 -&#45;&#45; left/center/right
        // align表格对齐方式 -&#45;&#45; left/center/right
        // type表单类型 -&#45;&#45; input datetime switch select 默认input
        // inputType input类型 -&#45;&#45; textarea number
        // select 下拉框数据请求地址 -&#45;&#45;url label value
        // disModify 修改的时候禁止修改
        // isNoForm 该属性是否不生成表单form
        // isSelect 根据该属性生成搜索选项
        {
          label: '字典类型',
          prop: 'dicType',
          className: 'dicType',
          show: true,
          align: 'center',
          type: 'input',
          isSelect: true
        },
        {
          label: '字典编码',
          prop: 'dicCode',
          className: 'dicCode',
          show: true,
          align: 'center',
          type: 'input',
          isSelect: true
        },
        {
          label: '字典名称',
          prop: 'dicName',
          className: 'dicName',
          show: true,
          align: 'center',
          type: 'input',
          isSelect: true
        },
        {
          label: '注释说明',
          prop: 'remark',
          className: 'remark',
          show: true,
          align: 'center',
          type: 'input'
        },
        {
          label: '状态',
          prop: 'status',
          className: 'status',
          show: 'template', // slot特殊列
          align: 'center',
          isSelect: true,
          type: 'select',
          defaultValue: 1,
          select: {
            options: [
              {
                id: 1,
                name: '有效'
              },
              {
                id: 0,
                name: '无效'
              }
            ],
            label: 'name',
            value: 'id'
          }
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
          // Fun -&#45;&#45; defaultModify  defaultDelete
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
  }
};
</script>
