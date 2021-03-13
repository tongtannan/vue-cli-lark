<template>
  <div class="first-page">
    <el-table-package :propTable="propTable">
      <template #birthDate="{item}">
        {{ changeTime(item.birthDate) }}
      </template>
      <template #area="{item}">
        <span
          v-if="
            item.province != null && item.city != null && item.district != null
          "
          >{{ item.province + ' ' + item.city + ' ' + item.district }}</span
        >
        <span v-else>暂无</span>
      </template>
      <template #headPortrait="{item}">
        <img
          :src="item.headPortrait"
          width="127"
          height="70"
          v-if="item.headPortrait != null"
        />
        <span v-else>暂无</span>
      </template>
    </el-table-package>
  </div>
</template>

<script>
import { changeTime } from '@/utils/common';
export default {
  beforeCreate() {
    this['changeTime'] = changeTime;
    (this['textList'] = ['首页', '用户列表']),
      (this['propTable'] = {
        title: '用户列表', // table标题
        noLoadInit: false, // 初始化是否加载数据
        hidePage: false, // 不需要分页
        initSrc: '/user/queryList', // 初始化table接口地址
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
        isDefaultHandles: false, // 是否显示默认新建/删除操作
        isSelection: false, // 是否显示多选框
        hasSelect: false, // 有无选中功能
        hasExpand: false, // 有无展开行功能
        isDefaultDialog: false, // 使用默认新建/修改弹框
        formLabelWidth: '120px', // 弹框表单label宽度
        disNews: true,
        emptyObj: {
          agencyId: 1
        },
        // 用户模块不需要新建字段校验规则
        // rules: {
        //   dicType: [
        //     { required: true, message: '请填写真实姓名', trigger: 'blur' }
        //   ],
        //   dicCode: [
        //     { required: true, message: '请填写字典编码', trigger: 'blur' }
        //   ],
        //   dicName: [
        //     { required: true, message: '请填写字典名称', trigger: 'blur' }
        //   ],
        //   status: [{ required: true, message: '请选择状态', trigger: 'blur' }]
        // }, // 弹框表单rules
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
            label: '用户名',
            prop: 'userName',
            className: 'userName',
            show: true,
            align: 'center',
            type: 'input',
            isSelect: true
          },
          {
            label: '性别',
            prop: 'sex',
            className: 'sex',
            show: true,
            align: 'center',
            type: 'input',
            isSelect: false
          },
          {
            label: '头像',
            prop: 'headPortrait',
            className: 'headPortrait',
            show: false,
            align: 'center',
            type: 'input',
            isSelect: false
          },
          {
            label: '身份证号',
            prop: 'identityCard',
            className: 'identityCard',
            show: true,
            align: 'center',
            type: 'input'
          },
          {
            label: '身份证正面照',
            prop: 'identityCardObverse',
            className: 'identityCardObverse',
            show: false,
            align: 'center',
            type: 'input'
          },
          {
            label: '身份证反面照',
            prop: 'identityCardReverse',
            className: 'identityCardReverse',
            show: false,
            align: 'center',
            type: 'input'
          },
          {
            label: '省',
            prop: 'province',
            className: 'province',
            show: false,
            align: 'center',
            type: 'input',
            isSelect: true
          },
          {
            label: '市',
            prop: 'city',
            className: 'city',
            show: false,
            align: 'center',
            type: 'input',
            isSelect: true
          },
          {
            label: '区',
            prop: 'district',
            className: 'district',
            show: false,
            align: 'center',
            type: 'input',
            isSelect: true
          },
          {
            label: '区域信息',
            prop: 'area',
            className: 'area',
            show: 'template',
            align: 'center',
            type: 'input',
            isSelect: false
          },
          {
            label: '现居地详细地址',
            prop: 'detailAddress',
            className: 'detailAddress',
            show: true,
            align: 'center',
            type: 'input'
          },
          {
            label: '出身日期',
            prop: 'birthDate',
            className: 'className',
            show: false,
            align: 'center',
            type: 'input'
          }
        ],
        data: [], // 表格数据 如需添加行class,处理数据时则需要传入class名数组
        hasOperation: false, // 有无操作功能
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
        },
        expands: [
          // 展开行数据
          {
            id: '1',
            label: 'label',
            prop: 'prop'
          }
        ],
        getSummaries(param) {
          // 自定义表位合计行数据
          // *** 此函数传入param参数
          console.log(param);
          // *** 最后返回一个数组，合计行会显示数组中的内容
          return [];
        }
      });
  }
};
</script>
