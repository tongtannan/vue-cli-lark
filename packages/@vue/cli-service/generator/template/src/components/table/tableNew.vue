<template>
  <div class="el-table-package">
    <template>
      <TForm
        isSelect="true"
        :propForm="propTable"
        class="table-select"
        v-if="!propTable.disSelect"
      ></TForm>
      <p class="table-row__handle">
        <span class="table-row__title">{{ propTable.title }}</span>
        <el-button
          type="primary "
          icon="el-icon-plus"
          @click="handleNew"
          v-if="!propTable.disNews"
          >新建</el-button
        >
        <!-- <el-button type="danger" icon="el-icon-delete" @click="handleDeleteRows"
          >删除</el-button
        > -->
      </p>
      <el-table
        :stripe="!propTable.hideStripe"
        :show-summary="propTable.hasShowSummary"
        :summary-method="propTable.getSummaries"
        ref="elTable"
        :data="tableData"
        tooltip-effect="dark"
        :border="propTable.border"
        style="width: 100%"
        :row-class-name="propTable.rowClassName"
        :span-method="objectSpanMethod"
        header-row-class-name="thClassName"
        :class="{ elTableNoneBorder: propTable.noneBorder }"
        @selection-change="handleSelectionChange"
        @cell-click="cellClick"
        @sort-change="sortChange"
        @row-click="rowClick"
        @row-dblclick="rowDblclick"
        v-loading="loading"
      >
        <el-table-column
          v-if="propTable.isSelection"
          type="selection"
          width="55"
        >
        </el-table-column>
        <el-table-column
          type="index"
          width="40"
          v-if="propTable.index"
          :label="propTable.indexName"
          :index="indexMethod"
        >
        </el-table-column>
        <el-table-column type="expand" v-if="propTable.hasExpand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item
                :label="item.label"
                v-for="item in propTable.expands"
                :key="item.key"
              >
                <span>{{ props.row[item.prop] }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <template v-for="(item, idx) in propTable.tr">
          <el-table-column
            v-if="item.show === 'template'"
            :label="item.label"
            :class-name="item.className"
            :key="'tr-' + idx"
            :sortable="item.sortable ? 'custom' : false"
            :width="item.width"
            :min-width="item.minWidth"
            :header-align="item.headerAlign || 'center'"
            :align="item.align || 'left'"
          >
            <template slot-scope="{ row }">
              <slot :item="row[item.prop] ? row : row" :name="item.prop"></slot>
            </template>
          </el-table-column>
          <el-table-column
            v-else-if="item.show && item.show !== 'template'"
            :label="item.label"
            :prop="item.prop"
            :class-name="item.className"
            :key="'tr-' + idx"
            :sortable="item.sortable || false"
            :width="item.width"
            :min-width="item.minWidth"
            :show-overflow-tooltip="item.tooltip"
            :header-align="item.headerAlign || 'center'"
            :align="item.align || 'left'"
          >
          </el-table-column>
        </template>
        <el-table-column
          column-key="operation"
          :label="propTable.operation.label"
          :width="propTable.operation.width"
          :min-width="propTable.operation.minWidth"
          :class-name="propTable.operation.className"
          :resizable="false"
          :header-align="propTable.tr[0].headerAlign || 'center'"
          :align="propTable.operation.align || 'center'"
          v-if="propTable.hasOperation"
        >
          <template slot-scope="{ row }">
            <span
              v-for="(item, iOpera) in propTable.operation.data"
              :key="'btn-' + iOpera"
              class="package-btn"
            >
              <el-button
                :class="item.classname"
                :size="item.size"
                :type="item.type"
                :icon="
                  item.spec && teams.includes(row.tid)
                    ? 'el-icon-chat-dot-round'
                    : item.icon
                "
                :style="{
                  background: item.spec && teams.includes(row.tid) ? 'red' : ''
                }"
                :disabled="
                  item.disabled && item.disabled.fn && item.disabled.fn(row)
                "
                v-if="!item.show || (item.show.fn && item.show.fn(row))"
                @click.stop="handleOperation(item.Fun, row)"
              >
                {{ item.label }}
              </el-button>
            </span>
            <span v-if="row.isShowEmpty" class="operation-empty">---</span>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page.page"
      :page-sizes="[5, 10, 20, 30, 40]"
      :page-size="page.size"
      layout=" total, prev, pager, next, sizes, jumper"
      v-if="!propTable.hidePage"
      :total="totalElements"
    >
    </el-pagination>
    <el-dialog
      width="50%"
      :title="dialogTitle"
      :visible.sync="dialogTableVisible"
      v-if="propTable.isDefaultDialog"
    >
      <TForm :propForm="propTable" ref="childForm" :dialogTitle="dialogTitle">
        <template #formStart>
          <slot name="formStart"></slot>
        </template>
        <template #formEnd>
          <slot name="formEnd"></slot>
        </template>
      </TForm>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogTableVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import ElTable from 'element-ui/packages/table'
// import ElTableColumn from 'element-ui/packages/table-column'
// import ElForm from 'element-ui/packages/form'
// import ElFormItem from 'element-ui/packages/form-item'
// import ElButton from 'element-ui/packages/button'
// import ElPagination from 'element-ui/packages/pagination'
import mixinMethod from './tableNew';
import { mapGetters } from 'vuex';
export default {
  name: 'ElTablePackage',
  // components: {
  //   ElTable,
  //   ElTableColumn,
  //   ElForm,
  //   ElFormItem,
  //   ElButton,
  //   ElPagination
  // },
  mixins: [mixinMethod],
  props: {
    propTable: Object
  },
  computed: {
    ...mapGetters(['getOfflinemsgs'])
  },
  data() {
    const selectOptions = Object.create(null);
    for (const val of this.propTable.tr) {
      const { prop, select } = val;
      if (select) {
        const { url, label, value, options } = select;
        selectOptions[prop] = {
          options: options || [],
          url,
          label,
          value
        };
      }
    }
    return {
      tableData: [],
      page: {
        page: 1,
        size: 10
      },
      totalElements: 0,
      loading: false,
      params: {},
      selectionList: [],
      dialogTitle: '新建',
      dialogTableVisible: false,
      formObj: {},
      selectOptions,
      handleFun: 'new',
      teams: []
    };
  },
  watch: {
    dialogTableVisible: function(newVal) {
      if (!newVal) {
        this.$refs['childForm'].$refs.defaultForm.resetFields();
        const { clearSlot } = this;
        clearSlot && clearSlot();
      }
    },
    getOfflinemsgs: {
      handler: function(val) {
        const { team } = val;
        console.log(team);
        this.teams = team;
        // this.noReadNumList = p2p;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style lang="less" stoped>
.el-table-package {
  padding: 0.1rem;
  margin: 0.2rem;
  background: #fff;
  .table-select {
    border-bottom: 1px solid #f0f2f5;
  }
  .table-row__handle {
    // text-align: end;
    margin: 0.2rem 0 0.2rem 0;
    display: flex;
    justify-content: space-between;
    .table-row__title {
      color: rgba(0, 0, 0, 0.85);
      font-size: 0.2rem;
    }
  }
  // 上左
  .el-table--border {
    border: 1px solid #ccc;
    margin-bottom: 0.1rem;
  }
  // 表头样式
  .el-table__header {
    background: rgb(14, 137, 183);
  }
  .operation {
    .cell {
      .package-btn button {
        margin-right: 0.1rem;
      }
    }
    .operation-empty {
      display: inline-block;
      width: 100%;
      text-align: center;
    }
  }
  .el-table th {
    height: 0.2rem;
    padding: 0.1rem 0;
    background: #fafafa;
    // 右下
    border-color: #f0f0f0;
    border-width: 1px;
    &:nth-last-child(2) {
      border-right: none;
    }
    & > .cell {
      color: rgba(0, 0, 0, 0.85);
      font: bold 0.14rem/0.2rem arial, sans-serif;
    }
  }
  // 表格样式
  .el-table td {
    height: 0.2rem;
    padding: 0.1rem 0;
    // background: #ebeef5;
    // 右下
    border-color: #f0f0f0;
    border-width: 1px;
    & > .cell {
      color: rgba(0, 0, 0, 0.65);
      font: 400 0.14rem/0.2rem arial, sans-serif;
    }
  }
  // 双数行背景
  .el-table--striped .el-table__body tr.el-table__row--striped td {
    background: #f2f6fc;
  }
  .el-pagination {
    text-align: end;
    padding: 0.2rem 0;
  }
  .el-dialog__body {
    margin-left: 0.6rem;
  }
}
</style>
