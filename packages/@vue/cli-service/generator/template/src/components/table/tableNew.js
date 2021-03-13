import CommonInterface from '@/utils/interface';
const NewInterface = new CommonInterface();
import { deepClone } from '@/utils/common';
export default {
  created() {
    const { noLoadInit, tr } = this.propTable;
    // 初始化table
    !noLoadInit && this.init();
    // 初始化空表单
    const emptynewObj = Object.create(null);
    for (const val of tr) {
      const { prop, defaultValue } = val;
      emptynewObj[prop] =
        defaultValue || defaultValue === 0 || defaultValue === false
          ? defaultValue
          : '';
    }
    this['emptynewObj'] = emptynewObj;
  },
  // beforeDestroy() {
  //   NewInterface.cancelToken();
  // },
  provide() {
    return {
      init: this.init
    };
  },
  inject: {
    setSlot: { default: null },
    validateSlot: { default: null },
    clearSlot: { default: null }
  },
  methods: {
    // table数据请求方法
    init(params) {
      let method = 'get';
      if (params) {
        this.params = params;
        this.page.page = 1;
      }
      const {
        loading,
        initMethod,
        initSrc,
        initProp,
        initParams,
        rebuildData,
        pageTotalProp,
        hidePage
      } = this.propTable;
      if (loading) {
        this.loading = true;
      }
      if (initMethod && initMethod !== 'get') {
        method = initMethod;
      }
      const { page, size } = this.page;
      const interfaceParams = initParams
        ? '&' +
          Object.keys(initParams)
            .map(key => `${key}=${initParams[key]}`)
            .join('&')
        : '';
      const filterParams = Object.create(null);
      for (const key in this.params) {
        const paramsVal = this.params[key];
        if (paramsVal || [false, 0, '0'].includes(paramsVal)) {
          filterParams[key] = paramsVal;
        }
      }
      const interfaceUrl = hidePage
        ? initSrc
        : `${initSrc}?pageNum=${page}&pageSize=${size}${interfaceParams}`;
      NewInterface[method](interfaceUrl, filterParams, false)
        .then(response => {
          const res = response.data;
          const tableData = res[initProp];
          if (rebuildData) {
            rebuildData(tableData);
          }
          this.tableData = tableData;
          this.totalElements = res[pageTotalProp];
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false;
        });
    },
    // currentPage 改变时会触发
    handleCurrentChange(val) {
      this.page.page = val;
      this.init();
    },
    // pageSize 改变时会触发
    handleSizeChange(size) {
      this.page = {
        page: 1,
        size
      };
      this.init();
    },
    // 当选择项发生变化时会触发该事件
    handleSelectionChange(val) {
      this.selectionList = val;
      this.$emit('handleSelectionChange', val);
    },
    // 排序
    sortChange(val) {
      const order = val.order;
      this.page.field = val.prop;
      this.page.order = order === 'ascending' ? 'ASC' : 'DESC';
      this.init();
    },
    // 操作
    handleOperation(rowFun, row) {
      if (['defaultDelete', 'defaultModify', 'deleteline'].includes(rowFun)) {
        this[rowFun](row);
      } else {
        // 特殊操作
        this.$emit('emitOperation', {
          row,
          rowFun
        });
      }
    },
    // 新建
    handleNew() {
      if (this.propTable.isDefaultDialog) {
        this.handleFun = 'new';
        this.dialogTitle = '新建';
        this.dialogTableVisible = true;
      }
      this.$emit('emitOperation', {
        row: {},
        rowFun: 'new'
      });
    },
    // 批量删除
    handleDeleteRows() {
      const { selectionList } = this;
      if (selectionList.length) {
        const ids = selectionList.map(item => item.id).join(',');
        this.$confirm('此操作将永久删除, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            NewInterface.post(this.propTable.batchDeleteSrc, {
              ids
            })
              .then(() => {
                this.init();
              })
              .catch(() => {});
          })
          .catch(() => {});
      } else {
        this.$message({
          type: 'error',
          message: '请先选择'
        });
      }
    },
    // 删除
    defaultDelete(val) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const { deleteMethod, deleteSrc } = this.propTable;
          NewInterface[deleteMethod](
            `${deleteSrc}`,
            {
              id: val.id
            },
            true
          )
            .then(res => {
              const { code } = res;
              if (code === '200') {
                this.init();
              }
            })
            .catch(() => {});
        })
        .catch(() => {});
    },
    // 删除行（不发送请求）
    deleteline(val) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$emit('deleteline', val);
        })
        .catch(() => {});
    },
    // 修改
    defaultModify(val) {
      if (this.propTable.isDefaultDialog) {
        this.handleFun = 'modify';
        this.dialogTitle = '修改';
        this.dialogTableVisible = true;
        this.$nextTick(() => {
          const formObj = deepClone(val);
          const { rebuildModify } = this.propTable;
          rebuildModify && rebuildModify(formObj);
          this.$refs.childForm.formObj = formObj;
        });
      }
      this.$emit('emitOperation', {
        row: val,
        rowFun: 'modify'
      });
    },
    // 新建、修改提交
    handleSubmit() {
      const { handleFun } = this;
      const { childForm } = this.$refs;
      const promiseDefault = new Promise(resolve => {
        childForm.$refs.defaultForm.validate(val =>
          resolve({
            val
          })
        );
      });
      const promiseArr = this.validateSlot
        ? [
            promiseDefault,
            new Promise(resolve => {
              this.validateSlot((val, shotFormObj) => {
                resolve({
                  val,
                  formObj: shotFormObj
                });
              });
            })
          ]
        : [promiseDefault];
      Promise.all(promiseArr).then(res => {
        if (res.every(item => item.val)) {
          const fileRaw = childForm.formObj.file
            ? childForm.formObj.file.raw
            : '';
          let newObj = this.validateSlot
            ? Object.assign({}, childForm.formObj, res[1].formObj)
            : deepClone(childForm.formObj);
          const modifyObj = Object.create(null);
          if (handleFun === 'modify') {
            const props = this.propTable.tr.map(item => {
              if (!item.isNoForm) {
                return item.prop;
              }
            });
            props.push('id');
            for (const key in newObj) {
              if (props.includes(key)) {
                modifyObj[key] = newObj[key];
              }
            }
          }
          const { emptyObj, rebuildPostObj } = this.propTable;
          if (handleFun === 'new' && emptyObj) {
            newObj = Object.assign({}, newObj, emptyObj);
          }
          const postObj = handleFun === 'new' ? newObj : modifyObj;
          if (postObj['file']) {
            postObj.file = fileRaw;
          }
          // 提交数据重构
          rebuildPostObj && rebuildPostObj(postObj);
          const {
            dialogMethod,
            dialogNewSrc,
            dialogModifySrc
          } = this.propTable;

          const interfaceMethod = dialogMethod || 'put';
          const dialogSrc =
            this.dialogTitle.indexOf('新') > -1
              ? dialogNewSrc
              : dialogModifySrc;
          NewInterface[interfaceMethod](dialogSrc, postObj, true)
            .then(res => {
              const { code } = res;
              if (code === '200') {
                this.dialogTableVisible = false;
                this.init();
              }
            })
            .catch(() => {})
            .finally(() => {});
        } else {
          const { errorMessage } = this.propTable;
          if (errorMessage && errorMessage.allowed) {
            this.$message({
              type: 'error',
              message: errorMessage.message || '格式不正确'
            });
          }
        }
      });
    },
    // 搜索
    select(val) {
      console.log(val);
    },
    // 序号
    indexMethod(index) {
      return this.page.page * this.page.size + index + 1;
    },
    // 合并
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      const { objectSpanMethod } = this.propTable;
      objectSpanMethod && objectSpanMethod(row, column, rowIndex, columnIndex);
      // examble
      // if (columnIndex === 0) {
      //   if (rowIndex % 2 === 0) {
      //     return {
      //       rowspan: 2,
      //       colspan: 1
      //     };
      //   } else {
      //     return {
      //       rowspan: 0,
      //       colspan: 0
      //     };
      //   }
      // }
      // this.$emit('onMergeRowOrColumn', {
      //   row,
      //   column,
      //   rowIndex,
      //   columnIndex
      // });
    },
    // 点击某个单元格时触发
    cellClick(row, column) {
      if (
        column.className === 'classname-from' ||
        column.className === 'classname-click'
      ) {
        this.$emit('cellClick', {
          val: row,
          label: column.label
        });
      }
    },
    // 点击某一行时触发的函数
    // *** 按下左键然后移动鼠标到其它列放开左键，会有报错 -- 优化：添加点击行参数，
    rowClick(row, event, column) {
      if (
        !column ||
        column.type === 'selection' ||
        column.columnKey === 'operation' ||
        column.type === 'expand'
      ) {
        return;
      }
      this.$emit('onRowClick', {
        row,
        event,
        column
      });
      // if (this.table.isClickChangeColor) {
      //   for (const val of document.querySelectorAll('.el-table tr')) {
      //     if (val.classList) {
      //       val.classList.remove('success-row');
      //     }
      //   }
      // if (document.querySelectorAll('.el-table tr').classList) {
      //     document.querySelectorAll('.el-table tr').classList.remove('success-row')
      //   }
      //   this.table.data.forEach((item, idx) => {
      //     if (Row == item) {
      //       document
      //         .querySelectorAll('.el-table__row')
      //         [idx].classList.add('success-row');
      //     }
      //   });
      // }
    },
    // 双击某一行时触发的函数
    rowDblclick(row, column, event) {
      if (
        !column ||
        column.type === 'selection' ||
        column.columnKey === 'operation' ||
        column.type === 'expand'
      ) {
        return;
      }
      this.$emit('onRowDbClick', {
        row,
        event,
        column
      });
    }
  }
};
