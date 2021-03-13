<template>
  <div class="first-page">
    <el-table-package
      :propTable="propTable"
      @emitOperation="emitOperation"
      ref="childTable"
    >
      <template #roleId="{item}"> {{ typeList[item.roleId] }} </template>
      <!-- <template #formStart>
        <el-form
          :model="formObj"
          :rules="propTable.rules"
          ref="slotForm"
          :label-width="propTable.formLabelWidth"
        >
          <el-form-item label="额外表单：">
            <el-input v-model="formObj.name"></el-input>
          </el-form-item>
        </el-form>
      </template> -->
    </el-table-package>
  </div>
</template>

<script>
import { phoneReg } from '@/utils/reg';
import CommonInterface from '@/utils/interface';
const NewInterface = new CommonInterface();
// import FormMixin from '@/mixins/form';
export default {
  // mixins: [FormMixin],
  data() {
    return {
      typeList: {}
    };
  },
  created() {
    NewInterface.get('/roles/queryAll').then(res => {
      const obj = Object.create(null);
      const list = res.data;
      for (let i = 0, len = list.length; i < len; i++) {
        obj[list[i].id] = list[i].roleName;
      }
      this.typeList = obj;
    });
  },
  methods: {
    emitOperation({ row, rowFun }) {
      this.rowFun = rowFun;
      switch (rowFun) {
        case 'resetPsd':
          this.$confirm('此操作将重置密码, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              NewInterface.formPost('operator/resetPassword', {
                id: row.id
              }).then(res => {
                const { code, data } = res;
                if (code === '200') {
                  if (data) {
                    this.$message({
                      message: '重置密码成功',
                      type: 'success'
                    });
                  }
                }
              });
            })
            .catch(() => {});
          break;
        default:
          break;
      }
      console.log(row, rowFun);
    }
  },
  beforeCreate() {
    //规则校验
    const validateUserName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('账号不能为空'));
      } else if (!phoneReg.test(value)) {
        callback(new Error('账号格式不正确'));
      } else {
        callback();
      }
    };
    this['propTable'] = {
      title: '操作员列表', // table标题
      noLoadInit: false, // 初始化是否加载数据
      hidePage: false, // 不需要分页
      initSrc: '/operator/queryList', // 初始化table接口地址
      initMethod: 'get', // 初始化table接口method,默认get
      initProp: 'list', // 数据属性 res[initProp]
      // initParams: { aaa: 1, bbb: 2 }, // 额外参数
      pageTotalProp: 'total', // 分页总数prop
      rebuildData: null, // 数据重构 --- data void
      rebuildPostObj: null, // 新建修改提交数据重构回调函数 --- data void
      deleteMethod: 'formPost', // 删除接口method
      deleteSrc: '/operator/deleteById', // 删除操作接口地址
      batchDeleteSrc: '/api/projectPlan/batchDel', // 批量删除操作接口地址
      dialogMethod: 'formPost', // 新建删除method,默认put
      dialogNewSrc: '/operator/insert', // 新建接口地址
      dialogModifySrc: '/operator/update', // 修改接口地址
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
      formLabelWidth: '100px', // 弹框表单label宽度
      // disSelect: true,
      // disNews: true, // 隐藏新建
      // 表单错误信息,该属性可以为空
      // allowed为true允许弹出，message为错误信息内容
      // 默认禁止弹出，message默认'格式不正确'
      // errorMessage: {
      //   allowed: false,
      //   message: '格式不正确'
      // },
      emptyObj: {
        // sex: '男'
        // agencyId: 1
      },
      rules: {
        realName: [
          { required: true, message: '请填写真实姓名', trigger: 'blur' }
        ],
        sex: [
          {
            required: true,
            message: '请选择性别',
            trigger: 'change'
          }
        ],
        userName: [
          {
            required: true,
            validator: validateUserName,
            trigger: 'blur'
          }
        ],
        roleId: [
          {
            required: true,
            message: '请选择角色',
            trigger: 'blur'
          }
        ],
        agencyId: [
          {
            required: true,
            message: '请选择机构',
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
        // defaultValue 新建默认值
        {
          label: '账号',
          prop: 'userName',
          className: 'classname',
          show: true,
          disModify: true,
          align: 'center',
          type: 'input',
          isSelect: true
        },
        {
          label: '真实姓名',
          prop: 'realName',
          className: 'classname-image',
          show: true,
          align: 'center',
          isSelect: true
        },
        {
          label: '性别',
          prop: 'sex',
          className: 'classname',
          // width: '90',
          show: true,
          tooltip: true,
          align: 'center',
          defaultValue: '男',
          type: 'radio',
          select: {
            options: [
              {
                id: '男',
                name: '男'
              },
              {
                id: '女',
                name: '女'
              }
            ],
            label: 'name',
            value: 'id'
          }
        },
        {
          label: '角色',
          prop: 'roleId',
          className: 'classname',
          show: 'template', // slot特殊列
          tooltip: true,
          align: 'center',
          type: 'select',
          select: {
            url: '/roles/queryAll',
            options: [],
            label: 'roleName',
            value: 'id'
          }
        },
        {
          label: '机构',
          prop: 'agencyId',
          className: 'agencyIdName',
          show: false,
          align: 'center',
          type: 'select',
          select: {
            url: '/agency/queryAll',
            options: [],
            label: 'name',
            value: 'id'
          },
          showForm: {
            fn: val => {
              return [3, 4].includes(Number(val.roleId));
            }
          }
        },
        {
          label: '微信号',
          prop: 'wechat',
          className: 'classname',
          show: true,
          align: 'center',
          type: 'input'
        },
        {
          label: '备注',
          prop: 'description',
          className: 'wechat',
          show: true,
          align: 'center',
          tooltip: true,
          type: 'input',
          inputType: 'textarea'
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
            label: '重置密码', // 按钮文字
            Fun: 'resetPsd', // 点击按钮后触发的父事件
            size: 'mini', // 按钮大小
            classname: 'show-delete',
            icon: 'el-icon-refresh-right',
            type: 'warning'
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
