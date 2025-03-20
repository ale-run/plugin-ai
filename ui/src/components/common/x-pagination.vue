<template>
  <div class="x-pagination">
    <a class="x-pagination-prev" v-if="hasPrevSet" @click="goPrevSet">
      <IconChevronLeft class="text-xs" />
    </a>
    <a class="x-pagination-prev" v-else>
      <IconChevronLeft class="text-xs text-muted" />
    </a>

    <a
      class="x-pagination-page"
      :class="{
        selected: page === current
      }"
      v-for="page in pages"
      @click="paging(page)"
      :key="page"
    >
      {{ page }}
    </a>

    <a class="x-pagination-page" v-if="pages === 0">1</a>

    <a class="x-pagination-next" v-if="hasNextSet" @click="goNextSet">
      <IconChevronRight class="text-xs" />
    </a>
    <a class="x-pagination-next" v-else>
      <IconChevronRight class="text-xs text-muted" />
    </a>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import IconChevronLeft from 'bootstrap-icons/icons/chevron-left.svg';
import IconChevronRight from 'bootstrap-icons/icons/chevron-right.svg';

@Component({
  components: {
    IconChevronLeft,
    IconChevronRight
  }
})
export default class XPagination extends Vue {
  @Prop() public readonly dataTotal?: number;
  @Prop({ default: 0 }) public readonly dataOffset?: number;
  @Prop({ default: 25 }) public readonly dataLimit?: number;
  @Prop({ default: 10 }) public readonly dataPageSet?: number;

  public current = 1;

  public get offset() {
    return this.dataOffset || 0;
  }

  public get limit() {
    return this.dataLimit || 25;
  }

  public get pageSet() {
    return this.dataPageSet || 10;
  }

  public get total() {
    return this.dataTotal || 0;
  }

  public get pages() {
    const pages = [];
    for (let i = this.minPage; i <= this.maxPage; i++) {
      pages.push(i);
    }
    if (!pages.length) pages.push(1);
    return pages;
  }

  public get totalPage() {
    return Math.ceil(this.total / this.limit);
  }

  public get minPage() {
    const setfactor = Math.trunc((this.current - 1) / this.pageSet);
    return setfactor * this.pageSet + 1;
  }

  public get maxPage() {
    const setfactor = Math.trunc((this.current - 1) / this.pageSet);
    return Math.min(setfactor * this.pageSet + this.pageSet, this.totalPage);
  }

  public get hasPrevSet() {
    return this.minPage > this.pageSet;
  }

  public get hasNextSet() {
    return this.maxPage < this.totalPage;
  }

  public goPrevSet() {
    this.paging(this.minPage - 1);
  }

  public goNextSet() {
    this.paging(this.maxPage + 1);
  }

  public paging(page: number) {
    if (isNaN(page) || typeof page !== 'number') throw new Error(`page must be a number`);
    if (page > this.totalPage) page = this.totalPage;
    // this.current = page;
    let offset = page * this.limit - this.limit;
    if (offset < 0) offset = 0;
    this.$emit('change', { offset, limit: this.limit, total: this.total });
  }

  public validate() {
    this.current = Math.floor(this.offset / this.limit) + 1;
  }

  @Watch('dataTotal')
  @Watch('dataOffset')
  @Watch('dataLimit')
  @Watch('dataPageSet')
  public watchParams() {
    this.validate();
  }
}
</script>
